#!/usr/bin/env node
// 生成 v1.1 终结复核（closure）产物：
//   curation/generated/gameability-curation-v1.1-closure.json   全部 1825 词的最终终态
//   curation/gameability-review-queue-v1.1-closure.json         剩余 REVIEW（带 reviewCategory）
//   curation/gameability-summary-v1.1-closure.md                迁移统计
//   curation/gameability-human-review-v1.1.md                   按类别分组的人工复核文档
// 输入：v1.1 产物 + curation/authored/curation-closure-v1.1.mjs（本次 225 项的判定）。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import closure from "../curation/authored/curation-closure-v1.1.mjs";
import reviewNotes from "../curation/authored/human-review-notes-v1.1.mjs";
import finalDecisions from "../curation/authored/curation-final-decisions-v1.1.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const c11 = read("curation/generated/gameability-curation-v1.1.json");
const bank = read("static/huacai/data/words.json");

const REVIEW_CATEGORIES = [
  "family-tone",
  "violence-adjacent",
  "negative-emotion",
  "polysemy",
  "hypernym",
  "cultural-familiarity",
  "symbol-dependent",
  "child-familiarity",
  "other",
];
const CATEGORY_TITLES = {
  "violence-adjacent": "暴力邻域（violence-adjacent）",
  "family-tone": "家庭基调（family-tone）",
  polysemy: "双关歧义（polysemy）",
  hypernym: "上位词体验（hypernym）",
  "cultural-familiarity": "文化 / 熟悉度（cultural-familiarity）",
  "symbol-dependent": "符号 / 地图依赖（symbol-dependent）",
};

function fail(message) {
  console.error(`构建失败：${message}`);
  process.exit(1);
}

const bankTexts = new Set(bank.groups.flatMap((g) => g.words.map((w) => w.text)));
const reviewV11 = c11.items.filter((i) => i.v1_1.status === "REVIEW");
const reviewTexts = new Set(reviewV11.map((i) => i.text));

// overlay 必须恰好覆盖 v1.1 REVIEW 集合
const overlayKeys = new Set(Object.keys(closure));
for (const text of reviewTexts) {
  if (!overlayKeys.has(text)) fail(`closure overlay 缺少 REVIEW 词：${text}`);
}
for (const text of overlayKeys) {
  if (!reviewTexts.has(text)) fail(`closure overlay 含非 REVIEW 词：${text}`);
}
{
  const afterClosureReview = new Set(
    c11.items
      .filter((i) => i.v1_1.status === "REVIEW")
      .map((i) => (closure[i.text].o === "REVIEW" ? i.text : null))
      .filter(Boolean),
  );
  for (const text of Object.keys(finalDecisions)) {
    if (!afterClosureReview.has(text)) fail(`最终裁定对应的词不是待裁定 REVIEW：${text}`);
  }
}

for (const text of Object.keys(reviewNotes)) {
  if (!overlayKeys.has(text) || closure[text].o !== "REVIEW") {
    fail(`人工复核说明对应的词不是 REVIEW：${text}`);
  }
}

// —— 计算最终终态 ——
const items = c11.items.map((item) => {
  const entry = {
    text: item.text,
    length: item.length,
    grades: item.grades,
    occurrences: item.occurrences,
    from: item.from,
    v1_1: item.v1_1,
    final: {
      status: item.v1_1.status,
      reason: item.v1_1.reason,
      ...(item.v1_1.canonical ? { canonical: item.v1_1.canonical } : {}),
    },
  };
  if (item.suggestedDifficulty) entry.suggestedDifficulty = item.suggestedDifficulty;
  if (item.suggestedTags) entry.suggestedTags = item.suggestedTags;
  const overlay = closure[item.text];
  if (overlay) {
    entry.final = { status: overlay.o, reason: overlay.r };
    if (overlay.o === "REDUNDANT") {
      entry.final.canonical = overlay.c;
      entry.final.reason = `与「${overlay.c}」产生几乎相同的游戏画面，保留更具代表性的后者。`;
    }
    if (overlay.o === "KEEP") {
      entry.suggestedDifficulty = overlay.d;
      entry.suggestedTags = overlay.t;
    }
    if (overlay.o === "REVIEW") {
      entry.final.reviewCategory = overlay.rc;
    }
    entry.transitionFrom = "REVIEW";
  }
  // 第二阶段：产品方最终裁定（仅作用于终结复核后仍为 REVIEW 的词）
  const decision = finalDecisions[item.text];
  if (decision) {
    if (entry.final.status !== "REVIEW") {
      fail(`最终裁定作用于非 REVIEW 词：${item.text}`);
    }
    entry.final = { status: decision.o, reason: decision.r };
    if (decision.o === "KEEP") {
      entry.suggestedDifficulty = decision.d;
      entry.suggestedTags = decision.t;
    }
    entry.decidedBy = "product-final-decision";
  }
  return entry;
});
items.sort((a, b) => a.length - b.length || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));

// —— 校验 ——
const finalBy = new Map(items.map((i) => [i.text, i.final.status]));
for (const item of items) {
  if (item.final.status === "KEEP" && !item.suggestedDifficulty) {
    fail(`最终 KEEP 缺少难度：${item.text}`);
  }
  if (item.final.status === "REDUNDANT") {
    const c = item.final.canonical;
    const ok = bankTexts.has(c) || finalBy.get(c) === "KEEP";
    if (!ok) fail(`"${item.text}" 的 canonical "${c}" 无效`);
  }
  if (item.final.status === "REVIEW" && !REVIEW_CATEGORIES.includes(item.final.reviewCategory)) {
    fail(`REVIEW "${item.text}" reviewCategory 无效：${item.final.reviewCategory}`);
  }
}

// —— 统计 ——
const finalCount = {};
for (const item of items) finalCount[item.final.status] = (finalCount[item.final.status] || 0) + 1;
const transitions = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
const stageClosure = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
const stageFinal = { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
const transitionsByLength = {};
for (const item of items) {
  if (item.transitionFrom !== "REVIEW") continue;
  transitions[item.final.status] += 1;
  const overlay = closure[item.text];
  stageClosure[overlay.o] += 1;
  if (finalDecisions[item.text]) stageFinal[finalDecisions[item.text].o] += 1;
  const key = `${item.length}char`;
  transitionsByLength[key] ||= { KEEP: 0, REJECT: 0, REDUNDANT: 0, REVIEW: 0 };
  transitionsByLength[key][item.final.status] += 1;
}
const finalReview = items.filter((i) => i.final.status === "REVIEW");
const categoryCount = {};
for (const item of finalReview) {
  categoryCount[item.final.reviewCategory] = (categoryCount[item.final.reviewCategory] || 0) + 1;
}

// —— 新增消解簇（本次 closure 产生的 REDUNDANT）——
const newClusters = [];
for (const item of items) {
  if (item.final.status !== "REDUNDANT" || item.transitionFrom !== "REVIEW") continue;
  const overlay = closure[item.text];
  newClusters.push({
    type: overlay.type,
    canonical: overlay.c,
    redundant: [item.text],
    note: overlay.note,
  });
}

// —— 写产物 ——
writeFileSync(
  join(ROOT, "curation/generated/gameability-curation-v1.1-closure.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-curation",
    version: "1.1.1-closure",
    scope: {
      source: "curation/generated/gameability-curation-v1.1.json + curation/authored/curation-closure-v1.1.mjs",
      rubric: "gameability-rubric-v1.1",
      candidateCount: items.length,
      note: "v1.1 终结复核：225 个 REVIEW 全部显式处理；REVIEW 仅保留带 reviewCategory 的真实产品取舍。v1.1 原产物保留以供追溯。",
    },
    summary: {
      KEEP: finalCount.KEEP || 0,
      REJECT: finalCount.REJECT || 0,
      REDUNDANT: finalCount.REDUNDANT || 0,
      REVIEW: finalCount.REVIEW || 0,
    },
    transitions: {
      from: "REVIEW(225)",
      overall: transitions,
      stage1Closure: stageClosure,
      stage2ProductDecisions: stageFinal,
    },
    newClusters,
    items,
  }, null, 2)}\n`,
);
writeFileSync(
  join(ROOT, "curation/gameability-review-queue-v1.1-closure.json"),
  `${JSON.stringify({
    schema: "cn-primary-gameability-review-queue",
    version: "1.1.1-closure",
    scope: {
      note: "终结复核 + 产品方最终裁定后的剩余队列：全部裁定完毕，队列为空。",
      total: finalReview.length,
      byCategory: categoryCount,
    },
    items: finalReview.map((item) => ({
      text: item.text,
      length: item.length,
      grades: item.grades,
      occurrences: item.occurrences,
      from: item.from,
      reviewCategory: item.final.reviewCategory,
      currentAssessment: { status: "REVIEW", reason: item.final.reason },
      recommendedDefault: reviewNotes[item.text]?.default,
    })),
  }, null, 2)}\n`,
);

// —— 汇总 md ——
const lines = [];
lines.push("# Gameability 策展汇总 v1.1 · 终结复核（closure）");
lines.push("");
lines.push("对 v1.1 队列中全部 225 个 REVIEW 项按 rubric v1.1 逐词显式处理：独立价值不足者终结为 REJECT，同画者并入消解簇，仅保留带类别的真实产品取舍。");
lines.push("");
lines.push("## REVIEW 225 迁移");
lines.push("");
lines.push(`- → KEEP：${transitions.KEEP}`);
lines.push(`- → REJECT：${transitions.REJECT}`);
lines.push(`- → REDUNDANT：${transitions.REDUNDANT}`);
lines.push(`- → REVIEW（保留）：${transitions.REVIEW}`);
lines.push("");
lines.push("分两阶段：");
lines.push("");
lines.push(`- 阶段一（终结复核）：KEEP ${stageClosure.KEEP} / REJECT ${stageClosure.REJECT} / REDUNDANT ${stageClosure.REDUNDANT} / REVIEW ${stageClosure.REVIEW}`);
lines.push(`- 阶段二（产品方裁定 29 项）：KEEP ${stageFinal.KEEP} / REJECT ${stageFinal.REJECT}（队列清零）`);
lines.push("");
lines.push("按词长：");
lines.push("");
for (const [len, t] of Object.entries(transitionsByLength)) {
  lines.push(`- ${len}：KEEP ${t.KEEP} / REJECT ${t.REJECT} / REDUNDANT ${t.REDUNDANT} / REVIEW ${t.REVIEW}`);
}
lines.push("");
lines.push("## 最终总数（1825）");
lines.push("");
lines.push(`- KEEP：${finalCount.KEEP}`);
lines.push(`- REJECT：${finalCount.REJECT}`);
lines.push(`- REDUNDANT：${finalCount.REDUNDANT}`);
lines.push(`- REVIEW：${finalCount.REVIEW}`);
lines.push("");
lines.push("## 剩余 REVIEW 分类");
lines.push("");
for (const [cat, n] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
  lines.push(`- ${cat}：${n}`);
}
lines.push("");
lines.push("## 四字词复核要点");
lines.push("");
lines.push("- 升 KEEP：不动声色、争奇斗艳、半信半疑、哭笑不得、居高临下、应接不暇、引人注目、恋恋不舍、津津有味、空空如也、跃跃欲试、重见天日（强场景/强表情成语）。");
lines.push("- 并入消解簇：一丝不苟→认真、一声不吭→安静、一本正经→严肃、严严实实→遮盖、半夜三更→夜晚、兴致勃勃/热血沸腾→兴奋、同心协力→合力、成千上万→人山人海、念念有词→念叨、无价之宝→奇珍异宝、碧空如洗→天空、胸有成竹→自信、风景名胜→风景。");
lines.push("- REJECT：万象更新、五湖四海、反反复复、天南海北、完好无缺、心旷神怡、心满意足、愤愤不平、斩钉截铁、断断续续、无穷无尽、相依为命（抽象/属性/频次/沉重，无独立场景）。");
lines.push("");
lines.push(`复核队列：${finalReview.length} 项（此前 225 项）。人工复核文档见 [gameability-human-review-v1.1.md](gameability-human-review-v1.1.md)。`);
lines.push("");
lines.push("---");
lines.push("");
lines.push("由 `scripts/build-curation-closure.mjs` 生成；重新运行即可复现。");
writeFileSync(join(ROOT, "curation/gameability-summary-v1.1-closure.md"), lines.join("\n") + "\n");

// —— 人工复核文档 ——
const doc = [];
doc.push("# 词语画猜 · 剩余人工复核清单（v1.1 closure）");
doc.push("");
doc.push(`本清单所列 ${items.filter((i) => finalDecisions[i.text]).length} 项已由产品方于 2026-09 裁定完毕（赶集 KEEP，其余 REJECT），仅作决策记录留存。`);
doc.push("");
const decidedItems = items.filter((i) => finalDecisions[i.text]);
for (const [cat, title] of Object.entries(CATEGORY_TITLES)) {
  const group = decidedItems.filter((i) => closure[i.text].rc === cat);
  if (group.length === 0) continue;
  doc.push(`## ${title}（${group.length} 项）`);
  doc.push("");
  for (const item of group) {
    const note = reviewNotes[item.text];
    doc.push(`### ${item.text}`);
    doc.push("");
    doc.push(`- 来源：${item.from}，年级 ${item.grades.join("、")}`);
    doc.push("");
    doc.push("Why KEEP:");
    for (const k of note.keep) doc.push(`- ${k}；`);
    doc.push("");
    doc.push("Why REJECT:");
    for (const r of note.reject) doc.push(`- ${r}；`);
    doc.push("");
    doc.push(`Recommended default: ${note.default}`);
    doc.push("");
    const decision = finalDecisions[item.text];
    doc.push(`Applied decision: ${decision ? decision.o : "—"}`);
    doc.push("");
  }
}
writeFileSync(join(ROOT, "curation/gameability-human-review-v1.1.md"), doc.join("\n") + "\n");

console.log(`closure: REVIEW 225 → KEEP ${transitions.KEEP} / REJECT ${transitions.REJECT} / REDUNDANT ${transitions.REDUNDANT} / REVIEW ${transitions.REVIEW}`);
console.log(`by length:`, JSON.stringify(transitionsByLength));
console.log(`final: KEEP ${finalCount.KEEP || 0} / REJECT ${finalCount.REJECT || 0} / REDUNDANT ${finalCount.REDUNDANT || 0} / REVIEW ${finalCount.REVIEW || 0}`);
console.log(`categories:`, JSON.stringify(categoryCount));
console.log(`new clusters: ${newClusters.length}`);
