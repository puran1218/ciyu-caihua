#!/usr/bin/env node
// 生成 Gameability 策展产物：
//   curation/generated/gameability-curation-3char-v1.json/.md
//   curation/generated/gameability-prefilter-2char-v1.json/.md
//   curation/generated/gameability-conflicts-v1.json/.md
//   curation/gameability-summary-v1.md
//   curation/gameability-review-queue-v1.json
// 语义决策来自 curation/authored/*.mjs（人工判断），
// provenance 一律从 curation/textbook-diff.json 补齐，保证不漂移。
// 用法：node scripts/build-curation-artifacts.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import decisions3 from "../curation/authored/curation-3char-v1.mjs";
import decisions2a from "../curation/authored/prefilter-2char-part1.mjs";
import decisions2b from "../curation/authored/prefilter-2char-part2.mjs";
import decisions2c from "../curation/authored/prefilter-2char-part3.mjs";
import decisions2d from "../curation/authored/prefilter-2char-part4.mjs";
import conflictGroups from "../curation/authored/conflicts-v1.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const diff = JSON.parse(
  readFileSync(join(ROOT, "curation/textbook-diff.json"), "utf8"),
);
const bank = JSON.parse(
  readFileSync(join(ROOT, "static/huacai/data/words.json"), "utf8"),
);
const c4 = JSON.parse(
  readFileSync(
    join(ROOT, "curation/reviewed/gameability-curation-4char-v1.json"),
    "utf8",
  ),
);
const decisions2 = {
  ...decisions2a,
  ...decisions2b,
  ...decisions2c,
  ...decisions2d,
};
const GRADES = [2, 3, 4, 5, 6];
const CATEGORY_NAMES = {
  K: "KEEP_CANDIDATE",
  R: "REJECT_CANDIDATE",
  W: "REVIEW",
};

function fail(message) {
  console.error(`构建失败：${message}`);
  process.exit(1);
}

function byText(a, b) {
  return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const key = keyFn(item);
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

// —— 三字词策展 ——
const newByLength = (len) =>
  diff.newCandidates.filter((w) => w.length === len).map((w) => w.text);
const c3Texts = newByLength(3);
const c2Texts = newByLength(2);

const missing3 = c3Texts.filter((t) => !decisions3[t]);
if (missing3.length > 0) fail(`三字词缺少决策：${missing3.join("、")}`);
const extra3 = Object.keys(decisions3).filter((t) => !c3Texts.includes(t));
if (extra3.length > 0) fail(`三字决策含非候选词：${extra3.join("、")}`);

const sourceByText = new Map(
  diff.newCandidates.map((w) => [w.text, w]),
);
const c3Items = c3Texts
  .map((text) => {
    const d = decisions3[text];
    const origin = sourceByText.get(text);
    const item = {
      text,
      length: origin.length,
      grades: origin.grades,
      occurrences: origin.occurrences,
      gameability: {
        visualizability: d.v,
        guessSpecificity: d.g,
        childFamiliarity: d.f,
        playfulness: d.p,
        score: d.v + d.g + d.f + d.p,
        status: d.status,
        confidence: d.confidence,
        flags: d.flags,
        reason: d.reason,
      },
    };
    if (d.status === "KEEP") {
      item.suggestedDifficulty = d.difficulty;
      item.suggestedTags = d.tags;
    }
    return item;
  })
  .sort(byText);

const c3Summary = countBy(c3Items, (i) => i.gameability.status);
const c3Json = {
  schema: "cn-primary-gameability-curation",
  version: "0.1.0",
  scope: {
    source: "curation/textbook-diff.json#newCandidates",
    length: 3,
    candidateCount: c3Items.length,
    note: "三字词全量策展：按 rubric 打分并给出 KEEP/MAYBE/REJECT；仅 KEEP 附建议难度与标签。",
  },
  rubric: "gameability-rubric-v1",
  summary: { KEEP: c3Summary.KEEP || 0, MAYBE: c3Summary.MAYBE || 0, REJECT: c3Summary.REJECT || 0 },
  items: c3Items,
};

// —— 两字词首轮过滤 ——
const missing2 = c2Texts.filter((t) => !decisions2[t]);
if (missing2.length > 0) fail(`两字词缺少决策：${missing2.join("、")}`);
const extra2 = Object.keys(decisions2).filter((t) => !c2Texts.includes(t));
if (extra2.length > 0) fail(`两字决策含非候选词：${extra2.join("、")}`);

const c2Items = c2Texts
  .map((text) => {
    const [code, reason, tags, difficulty] = decisions2[text];
    const origin = sourceByText.get(text);
    const item = {
      text,
      length: origin.length,
      grades: origin.grades,
      occurrences: origin.occurrences,
      firstPass: {
        category: CATEGORY_NAMES[code],
        reason,
      },
    };
    if (code === "K") {
      item.suggestedTags = tags;
      item.suggestedDifficulty = difficulty;
    }
    return item;
  })
  .sort(byText);

const c2Summary = countBy(c2Items, (i) => i.firstPass.category);
const c2Json = {
  schema: "cn-primary-gameability-prefilter",
  version: "0.1.0",
  scope: {
    source: "curation/textbook-diff.json#newCandidates",
    length: 2,
    candidateCount: c2Items.length,
    note: "两字词保守首轮过滤：只区分高置信 KEEP_CANDIDATE / REJECT_CANDIDATE，其余全部进入 REVIEW 供下一轮人工复核。",
  },
  rubric: "gameability-rubric-v1",
  summary: {
    KEEP_CANDIDATE: c2Summary.KEEP_CANDIDATE || 0,
    REJECT_CANDIDATE: c2Summary.REJECT_CANDIDATE || 0,
    REVIEW: c2Summary.REVIEW || 0,
  },
  items: c2Items,
};

// —— 冲突组（给每个词标注来源与当前判定）——
const bankTexts = new Set(
  bank.groups.flatMap((g) => g.words.map((w) => w.text)),
);
const c4Status = new Map(c4.items.map((i) => [i.text, i.gameability.status]));
const c3Status = new Map(c3Items.map((i) => [i.text, i.gameability.status]));
const c2Category = new Map(c2Items.map((i) => [i.text, i.firstPass.category]));

function originOf(text) {
  if (bankTexts.has(text)) {
    return { source: "words.json(当前词库)", assessment: "已在游戏中" };
  }
  if (c4Status.has(text)) {
    return { source: "4char-reviewed", assessment: c4Status.get(text) };
  }
  if (c3Status.has(text)) {
    return { source: "3char-curation", assessment: c3Status.get(text) };
  }
  if (c2Category.has(text)) {
    return { source: "2char-prefilter", assessment: c2Category.get(text) };
  }
  return null;
}

const conflictsJson = {
  schema: "cn-primary-gameability-conflicts",
  version: "0.1.0",
  scope: {
    sources: [
      "static/huacai/data/words.json",
      "curation/reviewed/gameability-curation-4char-v1.json",
      "curation/generated/gameability-curation-3char-v1.json",
      "curation/generated/gameability-prefilter-2char-v1.json",
    ],
    note: "只标记冲突供人工取舍，不自动删词。words 字段标注了每个词的来源与当前判定。",
  },
  groups: conflictGroups.map((group) => ({
    ...group,
    words: group.words.map((text) => {
      const origin = originOf(text);
      return origin
        ? { text, from: origin.source, assessment: origin.assessment }
        : { text, from: "unknown", assessment: "unknown" };
    }),
  })),
};

// —— 复核队列 ——
// 4字 MAYBE + 3字 MAYBE + 2字 REVIEW + 冲突组中的候选词，按 text 去重。
const conflictByText = new Map();
for (const group of conflictGroups) {
  for (const text of group.words) {
    const list = conflictByText.get(text) || [];
    list.push(group.words.filter((w) => w !== text));
    conflictByText.set(text, list);
  }
}

const queueMap = new Map();
function enqueue(text, stage) {
  const origin = sourceByText.get(text);
  if (!origin) {
    return; // 词库词或未知来源不进队列（队列只收候选词）
  }
  const existing = queueMap.get(text);
  const stages = existing ? new Set([...existing.stages, stage]) : new Set([stage]);
  queueMap.set(text, {
    text,
    length: origin.length,
    grades: origin.grades,
    occurrences: origin.occurrences,
    currentAssessment: existing ? existing.currentAssessment : assessmentOf(text),
    stages: [...stages],
    conflicts: conflictByText.has(text) ? conflictByText.get(text) : [],
  });
}

function assessmentOf(text) {
  if (c4Status.has(text)) {
    const item = c4.items.find((i) => i.text === text);
    return { stage: "4char-reviewed", ...item.gameability };
  }
  if (c3Status.has(text)) {
    const item = c3Items.find((i) => i.text === text);
    return { stage: "3char-curation", ...item.gameability };
  }
  const item = c2Items.find((i) => i.text === text);
  if (item) {
    return { stage: "2char-prefilter", ...item.firstPass };
  }
  return null;
}

for (const item of c4.items) {
  if (item.gameability.status === "MAYBE") enqueue(item.text, "4char:MAYBE");
}
for (const item of c3Items) {
  if (item.gameability.status === "MAYBE") enqueue(item.text, "3char:MAYBE");
}
for (const item of c2Items) {
  if (item.firstPass.category === "REVIEW") enqueue(item.text, "2char:REVIEW");
}
for (const text of conflictByText.keys()) {
  enqueue(text, "conflict-group-member");
}

const queue = [...queueMap.values()].sort((a, b) => a.length - b.length || byText(a, b));

// —— 写文件 ——
const GENERATED = join(ROOT, "curation/generated");
write(
  join(GENERATED, "gameability-curation-3char-v1.json"),
  `${JSON.stringify(c3Json, null, 2)}\n`,
);
write(
  join(GENERATED, "gameability-prefilter-2char-v1.json"),
  `${JSON.stringify(c2Json, null, 2)}\n`,
);
write(
  join(GENERATED, "gameability-conflicts-v1.json"),
  `${JSON.stringify(conflictsJson, null, 2)}\n`,
);
write(
  join(ROOT, "curation/gameability-review-queue-v1.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-review-queue",
    version: "0.1.0",
    scope: {
      note: "下一轮人工复核队列：4字 MAYBE + 3字 MAYBE + 2字 REVIEW + 冲突组成员（按 text 去重）。",
      total: queue.length,
    },
    items: queue,
  }, null, 2)}\n`,
);

// —— Markdown 渲染 ——
function renderC3Md() {
  const lines = [];
  lines.push("# 三字词 Gameability 策展 v1");
  lines.push("");
  lines.push(`候选总数：${c3Items.length}`);
  lines.push("");
  lines.push(`- KEEP：${c3Json.summary.KEEP}`);
  lines.push(`- MAYBE：${c3Json.summary.MAYBE}`);
  lines.push(`- REJECT：${c3Json.summary.REJECT}`);
  lines.push("");
  for (const status of ["KEEP", "MAYBE", "REJECT"]) {
    lines.push(`## ${status}`);
    lines.push("");
    for (const item of c3Items.filter((i) => i.gameability.status === status)) {
      const g = item.gameability;
      const extra =
        status === "KEEP"
          ? `（难度建议 ${item.suggestedDifficulty}；标签 ${(item.suggestedTags || []).join("/")}）`
          : "";
      lines.push(
        `- **${item.text}** ${g.visualizability}/${g.guessSpecificity}/${g.childFamiliarity}/${g.playfulness} = ${g.score}${extra}：${g.reason}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

function renderC2Md() {
  const lines = [];
  lines.push("# 两字词首轮过滤 v1");
  lines.push("");
  lines.push(`候选总数：${c2Items.length}`);
  lines.push("");
  lines.push(`- KEEP_CANDIDATE：${c2Json.summary.KEEP_CANDIDATE}`);
  lines.push(`- REJECT_CANDIDATE：${c2Json.summary.REJECT_CANDIDATE}`);
  lines.push(`- REVIEW：${c2Json.summary.REVIEW}`);
  lines.push("");
  lines.push("首轮只做保守的高置信分类，REVIEW 是刻意保留的复核主体，不是遗留问题。");
  lines.push("");
  for (const [category, title] of [
    ["KEEP_CANDIDATE", "KEEP_CANDIDATE（高置信保留候选）"],
    ["REJECT_CANDIDATE", "REJECT_CANDIDATE（高置信拒绝候选）"],
    ["REVIEW", "REVIEW（待人工复核）"],
  ]) {
    lines.push(`## ${title}`);
    lines.push("");
    for (const item of c2Items.filter((i) => i.firstPass.category === category)) {
      const extra =
        category === "KEEP_CANDIDATE"
          ? `（难度建议 ${item.suggestedDifficulty}；标签 ${(item.suggestedTags || []).join("/")}）`
          : "";
      lines.push(`- **${item.text}**${extra}：${item.firstPass.reason}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function renderConflictsMd() {
  const lines = [];
  const byType = countBy(conflictGroups, (g) => g.type);
  lines.push("# 词库级冲突分析 v1");
  lines.push("");
  lines.push(`冲突组总数：${conflictGroups.length}`);
  lines.push("");
  for (const [type, count] of Object.entries(byType)) {
    lines.push(`- ${type}：${count} 组`);
  }
  lines.push("");
  lines.push("每组给出成员来源与当前判定；只标记不删词，由下一轮人工取舍。");
  lines.push("");
  for (const group of conflictGroups) {
    lines.push(`## ${group.type}：${group.words.join(" / ")}`);
    lines.push("");
    lines.push(`- 建议：${group.recommendation}`);
    lines.push(`- 原因：${group.reason}`);
    const originList = group.words
      .map((text) => {
        const o = originOf(text);
        return o ? `${text}（${o.source}，${o.assessment}）` : `${text}（未知来源）`;
      })
      .join("、");
    lines.push(`- 成员：${originList}`);
    lines.push("");
  }
  return lines.join("\n");
}

write(join(GENERATED, "gameability-curation-3char-v1.md"), renderC3Md());
write(join(GENERATED, "gameability-prefilter-2char-v1.md"), renderC2Md());
write(join(GENERATED, "gameability-conflicts-v1.md"), renderConflictsMd());

// —— 汇总报告 ——
function renderSummary() {
  const lines = [];
  const c4s = c4.summary;
  lines.push("# Gameability 策展汇总 v1");
  lines.push("");
  lines.push("针对 textbook-diff 的 1825 个新增教材词：131 四字已复核、69 三字完成策展、1625 两字完成保守首轮过滤。年级只作来源记录，不代表游戏难度。");
  lines.push("");
  lines.push("## 4-character reviewed set");
  lines.push("");
  lines.push(`- total：131`);
  lines.push(`- KEEP：${c4s.KEEP}`);
  lines.push(`- MAYBE：${c4s.MAYBE}`);
  lines.push(`- REJECT：${c4s.REJECT}`);
  lines.push("");
  lines.push("## 3-character set");
  lines.push("");
  lines.push(`- total：${c3Items.length}`);
  lines.push(`- KEEP：${c3Json.summary.KEEP}`);
  lines.push(`- MAYBE：${c3Json.summary.MAYBE}`);
  lines.push(`- REJECT：${c3Json.summary.REJECT}`);
  lines.push("");
  lines.push("## 2-character first pass");
  lines.push("");
  lines.push(`- total：${c2Items.length}`);
  lines.push(`- KEEP_CANDIDATE：${c2Json.summary.KEEP_CANDIDATE}`);
  lines.push(`- REJECT_CANDIDATE：${c2Json.summary.REJECT_CANDIDATE}`);
  lines.push(`- REVIEW：${c2Json.summary.REVIEW}`);
  lines.push("");
  lines.push("## By source grade");
  lines.push("");
  lines.push("年级是教材 provenance，不是游戏难度；一个词出现在多个年级就在多个年级各计一次。");
  lines.push("");
  for (const grade of GRADES) {
    const inGrade = diff.newCandidates.filter((w) => w.grades.includes(grade));
    const textSet = new Set(inGrade.map((w) => w.text));
    const stat = (fn) => [...textSet].filter((t) => fn(t)).length;
    lines.push(
      `### Grade ${grade}（去重 ${textSet.size}）`,
    );
    lines.push("");
    lines.push(`- 4字：KEEP ${stat((t) => c4Status.get(t) === "KEEP")} / MAYBE ${stat((t) => c4Status.get(t) === "MAYBE")} / REJECT ${stat((t) => c4Status.get(t) === "REJECT")}`);
    lines.push(`- 3字：KEEP ${stat((t) => c3Status.get(t) === "KEEP")} / MAYBE ${stat((t) => c3Status.get(t) === "MAYBE")} / REJECT ${stat((t) => c3Status.get(t) === "REJECT")}`);
    lines.push(
      `- 2字：KEEP_CANDIDATE ${stat((t) => c2Category.get(t) === "KEEP_CANDIDATE")} / REJECT_CANDIDATE ${stat((t) => c2Category.get(t) === "REJECT_CANDIDATE")} / REVIEW ${stat((t) => c2Category.get(t) === "REVIEW")}`,
    );
    lines.push("");
  }
  lines.push("## By suggested tag（KEEP / KEEP_CANDIDATE）");
  lines.push("");
  lines.push("标签只用现有 tagCatalog；展示未来可能新增到各分类的词量。");
  lines.push("");
  const tagCounts = {};
  for (const item of [...c3Items, ...c2Items]) {
    const isKeep =
      item.gameability
        ? item.gameability.status === "KEEP"
        : item.firstPass.category === "KEEP_CANDIDATE";
    if (!isKeep) continue;
    for (const tag of item.suggestedTags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [tag, count] of sortedTags) {
    lines.push(`- ${tag}：${count}`);
  }
  lines.push("");
  lines.push("## Conflict summary");
  lines.push("");
  const byType = countBy(conflictGroups, (g) => g.type);
  for (const [type, count] of Object.entries(byType)) {
    lines.push(`- ${type} groups：${count}`);
  }
  lines.push("");
  lines.push(`- 冲突组总数：${conflictGroups.length}`);
  lines.push(`- 复核队列（4字 MAYBE + 3字 MAYBE + 2字 REVIEW + 冲突组成员，去重）：${queue.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("由 `scripts/build-curation-artifacts.mjs` 从 `curation/authored/*` 与 `curation/textbook-diff.json` 生成；重新运行即可复现。");
  return lines.join("\n");
}

write(join(ROOT, "curation/gameability-summary-v1.md"), renderSummary());

console.log(`3char: ${c3Items.length} (KEEP ${c3Json.summary.KEEP} / MAYBE ${c3Json.summary.MAYBE} / REJECT ${c3Json.summary.REJECT})`);
console.log(`2char: ${c2Items.length} (K ${c2Json.summary.KEEP_CANDIDATE} / R ${c2Json.summary.REJECT_CANDIDATE} / W ${c2Json.summary.REVIEW})`);
console.log(`conflict groups: ${conflictGroups.length}`);
console.log(`review queue: ${queue.length}`);
console.log("coverage: 131 + 69 + 1625 =", 131 + c3Items.length + c2Items.length, "of 1825");
