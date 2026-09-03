#!/usr/bin/env node
// 策展产物不变量校验：
//   curation/reviewed/gameability-curation-4char-v1.json
//   curation/generated/gameability-curation-3char-v1.json
//   curation/generated/gameability-prefilter-2char-v1.json
//   curation/generated/gameability-conflicts-v1.json
//   curation/gameability-review-queue-v1.json
// 全部对照 curation/textbook-diff.json 的 provenance 检查；
// 任一不变量违反即退出码 1。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const diff = read("curation/textbook-diff.json");
const c4 = read("curation/reviewed/gameability-curation-4char-v1.json");
const c3 = read("curation/generated/gameability-curation-3char-v1.json");
const c2 = read("curation/generated/gameability-prefilter-2char-v1.json");
const conflicts = read("curation/generated/gameability-conflicts-v1.json");
const queue = read("curation/gameability-review-queue-v1.json");
const c11 = read("curation/generated/gameability-curation-v1.1.json");
const queue11 = read("curation/gameability-review-queue-v1.1.json");
const resolution11 = read("curation/generated/gameability-conflict-resolution-v1.1.json");
const closure = read("curation/generated/gameability-curation-v1.1-closure.json");
const closureQueue = read("curation/gameability-review-queue-v1.1-closure.json");
const bank = read("static/huacai/data/words.json");

const STATUSES = ["KEEP", "MAYBE", "REJECT"];
const CATEGORIES = ["KEEP_CANDIDATE", "REJECT_CANDIDATE", "REVIEW"];
const CONFLICT_TYPES = ["near-synonym", "same-drawing", "granularity", "phrase-variant"];
const DIFFICULTIES = ["easy", "normal", "hard"];
const CONFIDENCES = ["high", "medium", "low"];

const errors = [];
function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

// 合并后部分策展词已入库：provenance 以“仍在候选 + 已入库”并集对照（数据均来自源池）
const sourceByText = new Map(
  [...diff.newCandidates, ...diff.alreadyInBank].map((w) => [w.text, w]),
);
const bankTexts = new Set(bank.groups.flatMap((g) => g.words.map((w) => w.text)));
const catalogTags = new Set(Object.keys(bank.tagCatalog || {}));

// provenance：text/length/grades/occurrences 必须与 diff 完全一致
function provenanceMatches(item, label) {
  const origin = sourceByText.get(item.text);
  check(Boolean(origin), `${label} "${item.text}" 不在 textbook-diff 的 newCandidates 中`);
  if (!origin) return;
  check(item.length === origin.length, `${label} "${item.text}" length 与 diff 不一致`);
  check(
    JSON.stringify(item.grades) === JSON.stringify(origin.grades),
    `${label} "${item.text}" grades 与 diff 不一致`,
  );
  check(
    JSON.stringify(item.occurrences) === JSON.stringify(origin.occurrences),
    `${label} "${item.text}" occurrences 与 diff 不一致`,
  );
}

// gameability 结构与算术
function checkGameability(g, label) {
  check(g && typeof g === "object", `${label} 缺少 gameability`);
  if (!g) return;
  const { visualizability: v, guessSpecificity: s, childFamiliarity: f, playfulness: p } = g;
  for (const [name, value, max] of [
    ["visualizability", v, 3],
    ["guessSpecificity", s, 3],
    ["childFamiliarity", f, 2],
    ["playfulness", p, 2],
  ]) {
    check(
      Number.isInteger(value) && value >= 0 && value <= max,
      `${label} ${name} 越界：${value}`,
    );
  }
  check(g.score === v + s + f + p, `${label} score(${g.score}) != V+G+F+P(${v + s + f + p})`);
  check(STATUSES.includes(g.status), `${label} status 无效：${g.status}`);
  check(CONFIDENCES.includes(g.confidence), `${label} confidence 无效：${g.confidence}`);
  check(Array.isArray(g.flags), `${label} flags 应为数组`);
  check(
    typeof g.reason === "string" && g.reason.trim() !== "",
    `${label} reason 应为非空字符串`,
  );
}

// —— 四字已复核 ——
{
  const expected4 = c4.scope.candidateCount;
  check(expected4 === 131, `4char 快照候选数应为 131，实际 ${expected4}`);
  check(c4.items.length === 131, `4char 条目应为 131，实际 ${c4.items.length}`);
  const seen4 = new Set();
  for (const item of c4.items) {
    provenanceMatches(item, "4char");
    check(item.length === 4, `4char "${item.text}" 不是四字词`);
    check(!seen4.has(item.text), `4char "${item.text}" 重复出现`);
    seen4.add(item.text);
    checkGameability(item.gameability, `4char "${item.text}"`);
    if (item.suggestedDifficulty !== undefined) {
      check(DIFFICULTIES.includes(item.suggestedDifficulty), `4char "${item.text}" suggestedDifficulty 无效`);
    }
  }
  check(seen4.size === 131, `4char 覆盖应为 131，实际 ${seen4.size}`);
  const summary4 = { KEEP: 0, MAYBE: 0, REJECT: 0 };
  for (const item of c4.items) summary4[item.gameability.status] += 1;
  for (const status of STATUSES) {
    check(
      (c4.summary[status] || 0) === summary4[status],
      `4char summary ${status}(${c4.summary[status] || 0}) 与实际(${summary4[status]}) 不一致`,
    );
  }
}

// —— 三字策展 ——
{
  check(c3.scope.candidateCount === 69, `3char 快照候选数应为 69`);
  check(c3.items.length === 69, `3char 条目应为 69，实际 ${c3.items.length}`);
  const seen3 = new Set();
  for (const item of c3.items) {
    provenanceMatches(item, "3char");
    check(item.length === 3, `3char "${item.text}" 不是三字词`);
    check(!seen3.has(item.text), `3char "${item.text}" 重复出现`);
    seen3.add(item.text);
    checkGameability(item.gameability, `3char "${item.text}"`);
    if (item.gameability.status === "KEEP") {
      check(DIFFICULTIES.includes(item.suggestedDifficulty), `3char KEEP "${item.text}" 缺少有效 suggestedDifficulty`);
      check(Array.isArray(item.suggestedTags) && item.suggestedTags.length > 0, `3char KEEP "${item.text}" 缺少 suggestedTags`);
    }
  }
  check(seen3.size === 69, `3char 覆盖应为 69，实际 ${seen3.size}`);
}

// —— 两字首轮 ——
{
  check(c2.scope.candidateCount === 1625, `2char 快照候选数应为 1625`);
  check(c2.items.length === 1625, `2char 条目应为 1625，实际 ${c2.items.length}`);
  const seen2 = new Set();
  for (const item of c2.items) {
    provenanceMatches(item, "2char");
    check(item.length === 2, `2char "${item.text}" 不是两字词`);
    check(!seen2.has(item.text), `2char "${item.text}" 重复出现`);
    seen2.add(item.text);
    check(CATEGORIES.includes(item.firstPass.category), `2char "${item.text}" category 无效：${item.firstPass.category}`);
    check(
      typeof item.firstPass.reason === "string" && item.firstPass.reason.trim() !== "",
      `2char "${item.text}" 缺少 reason`,
    );
    if (item.firstPass.category === "KEEP_CANDIDATE") {
      check(DIFFICULTIES.includes(item.suggestedDifficulty), `2char KEEP_CANDIDATE "${item.text}" 缺少有效 suggestedDifficulty`);
      check(Array.isArray(item.suggestedTags) && item.suggestedTags.length > 0, `2char KEEP_CANDIDATE "${item.text}" 缺少 suggestedTags`);
    }
  }
  check(seen2.size === 1625, `2char 覆盖应为 1625，实际 ${seen2.size}`);
}

// —— 总量与互斥 ——
{
  const total =
    new Set(c4.items.map((i) => i.text)).size +
    new Set(c3.items.map((i) => i.text)).size +
    new Set(c2.items.map((i) => i.text)).size;
  check(total === 1825, `三段覆盖合计 ${total} != 1825（策展快照总量）`);
  for (const item of c3.items) {
    check(!c4.items.some((i) => i.text === item.text), `"${item.text}" 同时出现在 4char 与 3char`);
  }
  for (const item of c2.items) {
    check(!c4.items.some((i) => i.text === item.text), `"${item.text}" 同时出现在 4char 与 2char`);
    check(!c3.items.some((i) => i.text === item.text), `"${item.text}" 同时出现在 3char 与 2char`);
  }
  // suggestedTags 必须来自当前词库 tagCatalog
  const catalog = new Set(Object.keys(bank.tagCatalog || {}));
  check(catalog.size > 0, "words.json 缺少 tagCatalog");
  for (const item of [...c3.items, ...c2.items]) {
    for (const tag of item.suggestedTags || []) {
      check(catalog.has(tag), `"${item.text}" 建议标签 "${tag}" 不在词库 tagCatalog 中`);
    }
  }
}

// —— 冲突组 ——
{
  const known = (text) => sourceByText.has(text) || bankTexts.has(text);
  for (const [index, group] of conflicts.groups.entries()) {
    check(CONFLICT_TYPES.includes(group.type), `冲突组 #${index} type 无效：${group.type}`);
    check(Array.isArray(group.words) && group.words.length >= 2, `冲突组 #${index} words 应至少两个`);
    check(
      typeof group.reason === "string" && group.reason.trim() !== "",
      `冲突组 #${index} 缺少 reason`,
    );
    for (const entry of group.words) {
      const text = typeof entry === "string" ? entry : entry.text;
      check(known(text), `冲突组 #${index} 成员 "${text}" 既不在词库也不在候选中`);
    }
  }
}

// —— 复核队列 ——
{
  const required = new Set([
    ...c4.items.filter((i) => i.gameability.status === "MAYBE").map((i) => i.text),
    ...c3.items.filter((i) => i.gameability.status === "MAYBE").map((i) => i.text),
    ...c2.items.filter((i) => i.firstPass.category === "REVIEW").map((i) => i.text),
  ]);
  for (const group of conflicts.groups) {
    for (const entry of group.words) {
      const text = typeof entry === "string" ? entry : entry.text;
      if (diff.newCandidates.some((w) => w.text === text)) {
        required.add(text); // 候选成员必须入队；词库词不算候选
      }
    }
  }
  const queueTexts = queue.items.map((i) => i.text);
  check(new Set(queueTexts).size === queueTexts.length, "复核队列内存在重复 text");
  const candidateTexts = new Set(diff.newCandidates.map((w) => w.text));
  for (const text of queueTexts) {
    check(sourceByText.has(text), `复核队列 "${text}" 不在来源池`);
  }
  for (const text of required) {
    check(queueTexts.includes(text), `复核队列缺少 "${text}"`);
  }
  for (const item of queue.items) {
    provenanceMatches(item, "queue");
    check(item.currentAssessment && item.stages.length > 0, `队列 "${item.text}" 缺少当前判定`);
  }
}


// —— v1.1 策展 ——
{
  const V11_STATUSES = ["KEEP", "REJECT", "REVIEW", "REDUNDANT"];
  check(c11.items.length === 1825, `v1.1 条目应为 1825（策展快照），实际 ${c11.items.length}`);
  const seen11 = new Set();
  const outcome11 = new Map(c11.items.map((i) => [i.text, i.v1_1.status]));
  for (const item of c11.items) {
    provenanceMatches(item, "v1.1");
    check(V11_STATUSES.includes(item.v1_1.status), `v1.1 "${item.text}" status 无效：${item.v1_1.status}`);
    check(typeof item.v1_1.reason === "string" && item.v1_1.reason.trim() !== "", `v1.1 "${item.text}" 缺少 reason`);
    check(!seen11.has(item.text), `v1.1 "${item.text}" 重复出现`);
    seen11.add(item.text);
    outcome11.set(item.text, item.v1_1.status);
    if (item.v1_1.status === "KEEP") {
      check(DIFFICULTIES.includes(item.suggestedDifficulty), `v1.1 KEEP "${item.text}" suggestedDifficulty 无效`);
    }
    if (item.v1_1.status === "REDUNDANT") {
      const canonical = item.v1_1.canonical;
      check(Boolean(canonical), `v1.1 REDUNDANT "${item.text}" 缺少 canonical`);
      const inBank = bankTexts.has(canonical);
      const outcome = outcome11.get(canonical);
      check(
        inBank || outcome === "KEEP",
        `v1.1 "${item.text}" 的 canonical "${canonical}" 既不在词库也不是 v1.1 KEEP`,
      );
      if (outcome === "REDUNDANT") {
        check(false, `v1.1 canonical 链 "${item.text}" -> "${canonical}" 本身是 REDUNDANT`);
      }
    }
    for (const tag of item.suggestedTags || []) {
      check(catalogTags.has(tag), `v1.1 "${item.text}" 建议标签 "${tag}" 不在词库 tagCatalog 中`);
    }
  }
  for (const w of diff.newCandidates) {
    check(seen11.has(w.text), `v1.1 缺少候选 "${w.text}"`);
  }

  // REDUNDANT 与其它终态的语义分工：REDUNDANT 不是低 Gameability，仅撞车
  // 复核队列 = REVIEW 集合，且仅此集合
  const reviewTexts = c11.items.filter((i) => i.v1_1.status === "REVIEW").map((i) => i.text);
  const queueTexts11 = queue11.items.map((i) => i.text);
  check(new Set(queueTexts11).size === queueTexts11.length, "v1.1 复核队列内存在重复 text");
  check(
    queueTexts11.length === reviewTexts.length &&
      reviewTexts.every((t) => queueTexts11.includes(t)),
    "v1.1 复核队列与 REVIEW 集合不一致",
  );
  for (const item of queue11.items) {
    provenanceMatches(item, "queue-v1.1");
    check(item.currentAssessment.status === "REVIEW", `v1.1 队列 "${item.text}" 非 REVIEW`);
  }

  // 冲突消解
  const redundantTexts = new Set(
    c11.items.filter((i) => i.v1_1.status === "REDUNDANT").map((i) => i.text),
  );
  const clusterMembership = new Map();
  for (const cluster of resolution11.clusters) {
    check(CONFLICT_TYPES.includes(cluster.type), `v1.1 消解簇 "${cluster.canonical}" type 无效：${cluster.type}`);
    check(Boolean(cluster.note), `v1.1 消解簇 "${cluster.canonical}" 缺少 note`);
    const canonicalOk =
      bankTexts.has(cluster.canonical) || outcome11.get(cluster.canonical) === "KEEP";
    check(canonicalOk, `v1.1 消解簇代表 "${cluster.canonical}" 既不在词库也不是 KEEP`);
    for (const member of cluster.redundant || []) {
      check(redundantTexts.has(member), `v1.1 消解簇 "${cluster.canonical}" 成员 "${member}" 不是 REDUNDANT`);
      check(!clusterMembership.has(member), `v1.1 "${member}" 出现在多个消解簇中`);
      clusterMembership.set(member, cluster.canonical);
    }
  }
  for (const text of redundantTexts) {
    const canonicalInItems = c11.items.find((i) => i.text === text)?.v1_1.canonical;
    check(
      clusterMembership.get(text) === canonicalInItems,
      `v1.1 REDUNDANT "${text}" 的 canonical 与消解簇记录不一致`,
    );
  }
}


// —— v1.1 closure（终结复核）——
{
  const REVIEW_CATEGORIES = [
    "family-tone", "violence-adjacent", "negative-emotion", "polysemy",
    "hypernym", "cultural-familiarity", "symbol-dependent", "child-familiarity", "other",
  ];
  const FINAL_STATUSES = ["KEEP", "REJECT", "REVIEW", "REDUNDANT"];
  check(closure.items.length === 1825, `closure 条目应为 1825（策展快照），实际 ${closure.items.length}`);
  const seenC = new Set();
  const finalBy = new Map(closure.items.map((i) => [i.text, i.final.status]));
  for (const item of closure.items) {
    provenanceMatches(item, "closure");
    check(FINAL_STATUSES.includes(item.final.status), `closure "${item.text}" final status 无效：${item.final.status}`);
    check(typeof item.final.reason === "string" && item.final.reason.trim() !== "", `closure "${item.text}" 缺少 reason`);
    check(!seenC.has(item.text), `closure "${item.text}" 重复出现`);
    seenC.add(item.text);
    // 非 REVIEW 词不得变动：final 必须等于 v1.1 终态
    const v11Item = c11.items.find((i) => i.text === item.text);
    if (v11Item.v1_1.status !== "REVIEW") {
      check(
        item.final.status === v11Item.v1_1.status,
        `closure 改动了非 REVIEW 词 "${item.text}"：${v11Item.v1_1.status} -> ${item.final.status}`,
      );
    }
    if (item.final.status === "KEEP") {
      check(DIFFICULTIES.includes(item.suggestedDifficulty), `closure KEEP "${item.text}" suggestedDifficulty 无效`);
      for (const tag of item.suggestedTags || []) {
        check(catalogTags.has(tag), `closure "${item.text}" 标签 "${tag}" 不在 tagCatalog`);
      }
    }
    if (item.final.status === "REDUNDANT") {
      const canonical = item.final.canonical;
      check(Boolean(canonical), `closure REDUNDANT "${item.text}" 缺少 canonical`);
      check(
        bankTexts.has(canonical) || finalBy.get(canonical) === "KEEP",
        `closure "${item.text}" 的 canonical "${canonical}" 无效`,
      );
    }
    if (item.final.status === "REVIEW") {
      check(
        REVIEW_CATEGORIES.includes(item.final.reviewCategory),
        `closure REVIEW "${item.text}" reviewCategory 无效：${item.final.reviewCategory}`,
      );
    }
  }
  for (const w of diff.newCandidates) {
    check(seenC.has(w.text), `closure 缺少候选 "${w.text}"`);
  }
  // 迁移统计与实际一致
  const actualTransitions = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
  for (const item of closure.items) {
    if (item.transitionFrom === "REVIEW") actualTransitions[item.final.status] += 1;
  }
  const expected = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
  for (const [k, v] of Object.entries(actualTransitions)) {
    check(closure.transitions.overall[k] === v, `closure 迁移统计 overall.${k} 不一致`);
  }
  check(
    closure.transitions.stage1Closure.KEEP + closure.transitions.stage2ProductDecisions.KEEP === actualTransitions.KEEP &&
      closure.transitions.stage1Closure.REJECT + closure.transitions.stage2ProductDecisions.REJECT === actualTransitions.REJECT,
    "closure 分阶段迁移统计与总迁移不一致",
  );
  // closure 队列 = 最终 REVIEW 集合
  const finalReviewTexts = closure.items.filter((i) => i.final.status === "REVIEW").map((i) => i.text);
  const qTexts = closureQueue.items.map((i) => i.text);
  check(new Set(qTexts).size === qTexts.length, "closure 队列存在重复");
  check(
    qTexts.length === finalReviewTexts.length && finalReviewTexts.every((t) => qTexts.includes(t)),
    "closure 队列与最终 REVIEW 集合不一致",
  );
  for (const item of closureQueue.items) {
    provenanceMatches(item, "closure-queue");
    check(REVIEW_CATEGORIES.includes(item.reviewCategory), `closure 队列 "${item.text}" reviewCategory 无效`);
  }
  // 新增消解簇与 REDUNDANT 迁移项一致
  const transitionRedundant = new Set(
    closure.items.filter((i) => i.transitionFrom === "REVIEW" && i.final.status === "REDUNDANT").map((i) => i.text),
  );
  const clusterRedundant = new Set(closure.newClusters.flatMap((c) => c.redundant));
  check(
    transitionRedundant.size === clusterRedundant.size &&
      [...transitionRedundant].every((t) => clusterRedundant.has(t)),
    "closure newClusters 与 REDUNDANT 迁移项不一致",
  );
  // 汇总数字一致
  const finalCounts = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
  for (const item of closure.items) finalCounts[item.final.status] += 1;
  for (const status of FINAL_STATUSES) {
    check(closure.summary[status] === finalCounts[status], `closure summary ${status} 不一致`);
  }
}

if (errors.length > 0) {
  console.error(`校验失败，共 ${errors.length} 处：`);
  for (const error of errors.slice(0, 50)) {
    console.error(`  - ${error}`);
  }
  if (errors.length > 50) console.error(`  ...（其余 ${errors.length - 50} 处省略）`);
  process.exit(1);
}

const summary = {
  "4char": c4.summary,
  "3char": c3.summary,
  "2char": c2.summary,
  conflictGroups: conflicts.groups.length,
  reviewQueue: queue.items.length,
  v1_1: {
    ...c11.summary,
    queue: queue11.items.length,
    clusters: resolution11.clusters.length,
  },
  closure: {
    ...closure.summary,
    queue: closureQueue.items.length,
  },
};
console.log("全部策展不变量校验通过。");
console.log(JSON.stringify(summary, null, 2));
