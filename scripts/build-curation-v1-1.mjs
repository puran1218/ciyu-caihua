#!/usr/bin/env node
// 生成 Gameability 策展 v1.1 产物：
//   curation/rubric/gameability-rubric-v1.1.md（手写，本脚本不生成）
//   curation/generated/gameability-curation-v1.1.json      全部 1825 词的 v1.1 终态
//   curation/generated/gameability-conflict-resolution-v1.1.json  冲突簇消解
//   curation/gameability-review-queue-v1.1.json            剩余 REVIEW 队列
//   curation/gameability-summary-v1.1.md                   汇总
// 决策来源：curation/authored/*-v1.1.mjs（人工语义判断）；
// provenance 与 v1 状态一律来自 textbook-diff 与 v1 产物，不复制粘贴。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import overlay2a from "../curation/authored/prefilter-2char-v1.1-part1.mjs";
import overlay2b from "../curation/authored/prefilter-2char-v1.1-part2.mjs";
import overlay2c from "../curation/authored/prefilter-2char-v1.1-part3.mjs";
import overlay3 from "../curation/authored/curation-3char-v1.1.mjs";
import overlay4 from "../curation/authored/curation-4char-v1.1.mjs";
import resolutionMeta from "../curation/authored/conflict-resolution-v1.1.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const diff = read("curation/textbook-diff.json");
const bank = read("static/huacai/data/words.json");
const c4 = read("curation/reviewed/gameability-curation-4char-v1.json");
const c3 = read("curation/generated/gameability-curation-3char-v1.json");
const c2 = read("curation/generated/gameability-prefilter-2char-v1.json");
const conflictsV1 = read("curation/generated/gameability-conflicts-v1.json");

const overlay2 = { ...overlay2a, ...overlay2b, ...overlay2c };
const GRADES = [2, 3, 4, 5, 6];

function fail(message) {
  console.error(`构建失败：${message}`);
  process.exit(1);
}

const bankTexts = new Set(bank.groups.flatMap((g) => g.words.map((w) => w.text)));
const sourceByText = new Map(diff.newCandidates.map((w) => [w.text, w]));
const c4By = new Map(c4.items.map((i) => [i.text, i]));
const c3By = new Map(c3.items.map((i) => [i.text, i]));
const c2By = new Map(c2.items.map((i) => [i.text, i]));

// —— 计算 v1.1 终态 ——
const items = [];
function baseOutcome(from, v1Item) {
  if (from === "4char") {
    const s = v1Item.gameability.status;
    return s === "MAYBE" ? "REVIEW" : s; // KEEP/REJECT 沿用，MAYBE → REVIEW
  }
  if (from === "3char") {
    const s = v1Item.gameability.status;
    return s === "MAYBE" ? "REVIEW" : s;
  }
  const cat = v1Item.firstPass.category;
  return cat === "KEEP_CANDIDATE" ? "KEEP" : cat === "REJECT_CANDIDATE" ? "REJECT" : "REVIEW";
}

for (const origin of diff.newCandidates) {
  const from = origin.length === 4 ? "4char" : origin.length === 3 ? "3char" : "2char";
  const v1Item = from === "4char" ? c4By.get(origin.text) : from === "3char" ? c3By.get(origin.text) : c2By.get(origin.text);
  if (!v1Item) fail(`缺少 v1 条目：${origin.text}`);
  const v1Status =
    from === "2char" ? v1Item.firstPass.category : v1Item.gameability.status;
  const overlay = from === "4char" ? overlay4[origin.text] : from === "3char" ? overlay3[origin.text] : overlay2[origin.text];
  let status = baseOutcome(from, v1Item);
  let reason =
    from === "2char" ? v1Item.firstPass.reason : v1Item.gameability.reason;
  let canonical = undefined;
  let suggestedDifficulty = v1Item.suggestedDifficulty;
  let suggestedTags = v1Item.suggestedTags;
  if (overlay) {
    status = overlay.o === "REDUNDANT" ? "REDUNDANT" : overlay.o;
    if (overlay.o === "REDUNDANT") {
      canonical = overlay.c;
      reason = `与「${overlay.c}」产生几乎相同的游戏画面，保留更具代表性的后者。`;
    } else {
      if (overlay.r) reason = overlay.r;
      if (overlay.o === "KEEP") {
        suggestedDifficulty = overlay.d ?? suggestedDifficulty;
        suggestedTags = overlay.t ?? suggestedTags;
        if (!suggestedDifficulty || !suggestedTags) {
          fail(`KEEP 覆盖缺少难度/标签：${origin.text}`);
        }
      }
    }
  }
  if (status === "KEEP" && !suggestedDifficulty) {
    fail(`KEEP 词缺少 suggestedDifficulty：${origin.text}`);
  }
  const entry = {
    text: origin.text,
    length: origin.length,
    grades: origin.grades,
    occurrences: origin.occurrences,
    from,
    v1Status,
    v1_1: { status, reason },
  };
  if (canonical) entry.v1_1.canonical = canonical;
  if (status === "KEEP") {
    entry.suggestedDifficulty = suggestedDifficulty;
    if (suggestedTags) entry.suggestedTags = suggestedTags;
  }
  items.push(entry);
}
items.sort((a, b) => a.length - b.length || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));

// —— 内部一致性 ——
const outcomeBy = new Map(items.map((i) => [i.text, i.v1_1.status]));
for (const item of items) {
  if (item.v1_1.status !== "REDUNDANT") continue;
  const c = item.v1_1.canonical;
  if (!c) fail(`REDUNDANT 缺少 canonical：${item.text}`);
  const inBank = bankTexts.has(c);
  const candidateOutcome = outcomeBy.get(c);
  if (!inBank && candidateOutcome !== "KEEP") {
    fail(`"${item.text}" 的 canonical "${c}" 既不在词库也不是 v1.1 KEEP（状态 ${candidateOutcome}）`);
  }
}
for (const [from, overlay] of [["4char", overlay4], ["3char", overlay3], ["2char", overlay2]]) {
  for (const text of Object.keys(overlay)) {
    const item = items.find((i) => i.text === text);
    if (!item || item.from !== from) fail(`${from} overlay 含无效词条：${text}`);
  }
}

// —— 冲突消解簇 ——
const membersByCanonical = new Map();
for (const item of items) {
  if (item.v1_1.status === "REDUNDANT") {
    const list = membersByCanonical.get(item.v1_1.canonical) || [];
    list.push(item.text);
    membersByCanonical.set(item.v1_1.canonical, list);
  }
}
const clusters = [];
const noteOnly = [];
for (const [canonical, meta] of Object.entries(resolutionMeta)) {
  const [type, note] = meta;
  const members = membersByCanonical.get(canonical) || [];
  const entry = {
    type,
    canonical,
    canonicalFrom: originLabel(canonical),
    note,
  };
  if (members.length > 0) {
    entry.redundant = members.sort();
    clusters.push(entry);
  } else {
    noteOnly.push(entry);
  }
  membersByCanonical.delete(canonical);
}
if (membersByCanonical.size > 0) {
  fail(`canonical 缺少消解元数据：${[...membersByCanonical.keys()].join("、")}`);
}
function originLabel(text) {
  if (bankTexts.has(text)) return "words.json（已在游戏中）";
  const item = items.find((i) => i.text === text);
  if (item) return `${item.from}（v1.1 ${item.v1_1.status}）`;
  return "未知";
}

// v1 冲突组覆盖核对：每个组至少有一个成员成为 canonical / REDUNDANT / 词库对照说明
const resolvedByText = new Set([
  ...clusters.flatMap((c) => [c.canonical, ...(c.redundant || [])]),
  ...noteOnly.map((c) => c.canonical),
]);
const unresolvedGroups = [];
for (const group of conflictsV1.groups) {
  const texts = group.words.map((w) => (typeof w === "string" ? w : w.text));
  const covered = texts.some((t) => resolvedByText.has(t) || bankTexts.has(t));
  if (!covered) unresolvedGroups.push(texts);
}

// —— 汇总数字 ——
const count = {};
for (const item of items) count[item.v1_1.status] = (count[item.v1_1.status] || 0) + 1;
const byFrom = {};
for (const item of items) {
  byFrom[item.from] ||= { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
  byFrom[item.from][item.v1_1.status] += 1;
}
const redundantTotal = (count.REDUNDANT || 0) + 7; // 7 个四字 REDUNDANT 已在 items 中计入
const queueItems = items.filter((i) => i.v1_1.status === "REVIEW");

// —— 写文件 ——
const GENERATED = join(ROOT, "curation/generated");
mkdirSync(GENERATED, { recursive: true });
writeFileSync(
  join(GENERATED, "gameability-curation-v1.1.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-curation",
    version: "1.1.0",
    scope: {
      source: "curation/textbook-diff.json#newCandidates",
      candidateCount: items.length,
      rubric: "gameability-rubric-v1.1",
      note: "v1.1 终态：KEEP / REJECT / REVIEW / REDUNDANT。REVIEW 仅保留真实产品判断；近义歧义已转入冲突消解。",
    },
    summary: {
      KEEP: count.KEEP || 0,
      REJECT: count.REJECT || 0,
      REDUNDANT: count.REDUNDANT || 0,
      REVIEW: count.REVIEW || 0,
    },
    items,
  }, null, 2)}\n`,
);
writeFileSync(
  join(GENERATED, "gameability-conflict-resolution-v1.1.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-conflict-resolution",
    version: "1.1.0",
    scope: {
      rubric: "gameability-rubric-v1.1",
      note: "每个冲突簇选出代表词（canonical），其余记 REDUNDANT 指向代表词；已在词库中的词不改动，仅在 note 中说明后续合并取舍。",
      clusterCount: clusters.length,
      noteOnlyCount: noteOnly.length,
      unresolvedV1Groups: unresolvedGroups,
    },
    clusters,
    bankCoexistenceNotes: noteOnly,
  }, null, 2)}\n`,
);
writeFileSync(
  join(ROOT, "curation/gameability-review-queue-v1.1.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-review-queue",
    version: "1.1.0",
    scope: {
      note: "v1.1 剩余复核队列：仅含 REVIEW 终态（真实产品判断）。近义歧义已由冲突消解处理，不再入队。",
      total: queueItems.length,
    },
    items: queueItems.map((item) => ({
      text: item.text,
      length: item.length,
      grades: item.grades,
      occurrences: item.occurrences,
      from: item.from,
      v1Status: item.v1Status,
      currentAssessment: { status: item.v1_1.status, reason: item.v1_1.reason },
    })),
  }, null, 2)}\n`,
);

// —— 汇总 md ——
const lines = [];
lines.push("# Gameability 策展汇总 v1.1");
lines.push("");
lines.push("维度修订：`Guess Specificity` → `Semantic Guessability`（语义邻域即可，不要求命中词面）；近义歧义从个体 REVIEW 移入冲突消解（canonical + REDUNDANT）；新增 REDUNDANT 终态。对照 [gameability-rubric-v1.1.md](rubric/gameability-rubric-v1.1.md)。");
lines.push("");
lines.push("## 总体");
lines.push("");
lines.push(`- KEEP：${count.KEEP || 0}`);
lines.push(`- REJECT：${count.REJECT || 0}`);
lines.push(`- REDUNDANT：${count.REDUNDANT || 0}`);
lines.push(`- REVIEW（剩余队列）：${count.REVIEW || 0}`);
lines.push(`- 合计：${items.length}`);
lines.push("");
lines.push("## 按词长");
lines.push("");
for (const from of ["4char", "3char", "2char"]) {
  const s = byFrom[from];
  lines.push(`- ${from}：KEEP ${s.KEEP} / REJECT ${s.REJECT} / REDUNDANT ${s.REDUNDANT} / REVIEW ${s.REVIEW}`);
}
lines.push("");
lines.push("## 冲突消解");
lines.push("");
lines.push(`- v1 冲突组：${conflictsV1.groups.length}`);
lines.push(`- v1.1 消解簇（含 REDUNDANT 成员）：${clusters.length}`);
lines.push(`- 词库共存说明（无候选成员的消解说明）：${noteOnly.length}`);
lines.push(`- 未覆盖的 v1 冲突组：${unresolvedGroups.length}${unresolvedGroups.length ? "（" + unresolvedGroups.map((g) => g.join("/")).join("；") + "）" : ""}`);
lines.push("");
lines.push("## 与 v1 相比的主要变化（示例）");
lines.push("");
lines.push("- 发抖：REVIEW(v1 邻居歧义) → KEEP；颤抖/发颤/抖动 → REDUNDANT_WITH 发抖。");
lines.push("- 暴风雨：v1 按 rubric 校准压为 MAYBE → KEEP（邻域即命中）。");
lines.push("- 幸福/休息/寻找/假装/拒绝/停泊/搬运/排练/探望/尖叫/吓唬/屏息/倒霉：REVIEW → KEEP。");
lines.push("- 打猎/猎人/猎物/坦克/勇猛/敌人：KEEP/REVIEW 维持 REVIEW，按 v1.1 暴力邻域规则收紧。");
lines.push("- 匪徒/攻击/搏斗/恐怖：收紧为 REJECT。");
lines.push("- 一望无际/精疲力竭/震天动地/哄堂大笑/心惊胆战/威风凛凛/全神贯注（四字）：→ REDUNDANT，指向代表词。");
lines.push("");
lines.push("## 剩余 REVIEW 的构成（真实产品判断）");
lines.push("");
lines.push("暴力/惊悚程度（打猎、搏斗类）、双关词（杜鹃、画眉、结实）、上位词体验（动物、生物）、负面基调（绝望、辛酸）、地图/符号依赖（东北、日本、长江）、元概念（角色、游戏、提示）、熟悉度存疑（海参、藤萝、染缸）等。");
lines.push("");
lines.push(`复核队列：${queueItems.length} 项（v1 为 924 项）。`);
lines.push("");
lines.push("---");
lines.push("");
lines.push("由 `scripts/build-curation-v1-1.mjs` 生成；重新运行即可复现。");
writeFileSync(join(ROOT, "curation/gameability-summary-v1.1.md"), lines.join("\n") + "\n");

console.log(`v1.1 total ${items.length}: KEEP ${count.KEEP || 0} / REJECT ${count.REJECT || 0} / REDUNDANT ${count.REDUNDANT || 0} / REVIEW ${count.REVIEW || 0}`);
console.log(`by length:`, JSON.stringify(byFrom));
console.log(`clusters: ${clusters.length} (+${noteOnly.length} notes), unresolved v1 groups: ${unresolvedGroups.length}`);
console.log(`review queue: ${queueItems.length} (v1: 924)`);
