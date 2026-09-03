#!/usr/bin/env node
// 执行 Gameability 合并（数据-only，一次性）：
//   读取 curation/generated/gameability-curation-v1.1-closure.json 的终态 KEEP，
//   跳过与库内词同卡片体验的 2 个（中秋、笑嘻嘻，产品方 2026-09 裁定），
//   其余 440 个按教材 provenance 年级（跨年级取最早）追加进 words.json 对应组，
//   4 字词补标签（映射见下），version 0.1.0 → 0.2.0。
//   不改动任何运行时代码；写 curation/gameability-merge-log-v1.1.md。
// 重复运行会因词已入库而中止（幂等保护）。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BANK_PATH = join(ROOT, "static/huacai/data/words.json");
const CLOSURE_PATH = join(ROOT, "curation/generated/gameability-curation-v1.1-closure.json");
const LOG_PATH = join(ROOT, "curation/gameability-merge-log-v1.1.md");

// 与库内词同卡片体验，跳过新增（库内词不动）
const SKIP = {
  "中秋": "与库内『中秋赏月』同一张节日卡片，选库内词（产品方裁定）。",
  "笑嘻嘻": "微笑卡片库内已有『笑容』『笑脸』两个代表（产品方裁定）。",
};

// 四字 KEEP 的标签补全（策展产物无标签；均取自现有 tagCatalog）
const TAGS4 = {
  "一望无边": ["drawable", "nature"], "万里无云": ["drawable", "weather", "nature"],
  "不动声色": ["drawable", "emotion"], "争奇斗艳": ["drawable", "plant", "nature"],
  "亡羊补牢": ["drawable", "animal", "culture"], "亭台楼阁": ["drawable", "place", "culture"],
  "人山人海": ["drawable", "place"], "众星拱月": ["drawable", "space"],
  "冰天雪地": ["drawable", "weather", "nature"], "半信半疑": ["drawable", "emotion"],
  "呆头呆脑": ["drawable", "emotion"], "呼风唤雨": ["drawable", "action", "culture"],
  "哈哈大笑": ["drawable", "emotion"], "哭笑不得": ["drawable", "emotion"],
  "坑坑洼洼": ["drawable", "nature"], "大吃一惊": ["drawable", "emotion"],
  "大步流星": ["drawable", "action"], "奇珍异宝": ["drawable", "object", "culture"],
  "奔流不息": ["drawable", "nature"], "寸草不生": ["drawable", "nature"],
  "居高临下": ["drawable", "place"], "山崩地裂": ["drawable", "nature"],
  "左顾右盼": ["drawable", "action"], "应接不暇": ["drawable", "emotion"],
  "引人注目": ["drawable", "emotion"], "心惊肉跳": ["drawable", "emotion"],
  "急急忙忙": ["drawable", "action"], "恋恋不舍": ["drawable", "emotion"],
  "惊天动地": ["drawable", "action"], "成群结队": ["drawable", "animal"],
  "手忙脚乱": ["drawable", "action"], "手疾眼快": ["drawable", "action"],
  "手舞足蹈": ["drawable", "action"], "排山倒海": ["drawable", "nature"],
  "摇头晃脑": ["drawable", "action"], "摩拳擦掌": ["drawable", "action"],
  "来来往往": ["drawable", "action"], "横七竖八": ["drawable", "object"],
  "汹涌澎湃": ["drawable", "nature"], "没精打采": ["drawable", "emotion"],
  "津津有味": ["drawable", "food", "emotion"], "空空如也": ["drawable", "object"],
  "筋疲力尽": ["drawable", "emotion"], "翻箱倒柜": ["drawable", "action", "home"],
  "腾云驾雾": ["drawable", "action", "culture"], "花草树木": ["drawable", "plant"],
  "花骨朵儿": ["drawable", "plant"], "跃跃欲试": ["drawable", "action"],
  "跌跌撞撞": ["drawable", "action"], "重见天日": ["drawable", "action"],
  "金碧辉煌": ["drawable", "place", "culture"], "银光闪闪": ["drawable", "nature"],
  "闪闪发光": ["drawable", "nature"], "面如土色": ["drawable", "emotion"],
  "风平浪静": ["drawable", "weather", "nature"], "高速公路": ["drawable", "transport"],
  "齐头并进": ["drawable", "sports"],
};

function fail(message) {
  console.error(`合并中止：${message}`);
  process.exit(1);
}

const bank = JSON.parse(readFileSync(BANK_PATH, "utf8"));
const closure = JSON.parse(readFileSync(CLOSURE_PATH, "utf8"));
const catalog = new Set(Object.keys(bank.tagCatalog || {}));
if (catalog.size === 0) fail("词库缺少 tagCatalog");

const bankTexts = new Set(bank.groups.flatMap((g) => g.words.map((w) => w.text)));
const before = bankTexts.size;

const keeps = closure.items.filter((i) => i.final.status === "KEEP");
const skipped = [];
const additions = []; // { text, grade, tags }
for (const item of keeps) {
  if (SKIP[item.text]) {
    skipped.push({ text: item.text, reason: SKIP[item.text] });
    continue;
  }
  if (bankTexts.has(item.text)) fail(`词已存在于词库：${item.text}`);
  const tags =
    item.length === 4 ? TAGS4[item.text] : item.suggestedTags;
  if (!tags || tags.length === 0) fail(`缺少标签：${item.text}`);
  for (const tag of tags) {
    if (!catalog.has(tag)) fail(`标签不在 tagCatalog：${item.text} -> ${tag}`);
  }
  const grade = Math.min(...item.grades); // 跨年级取最早
  additions.push({ text: item.text, length: item.length, tags, grade });
}

// 落组：grade-N 组已存在（一~六年级），本次新增只落在 2~6 年级组
const groupByGrade = new Map(bank.groups.map((g) => [g.id, g]));
for (const add of additions) {
  const groupId = `grade-${add.grade}`;
  const group = groupByGrade.get(groupId);
  if (!group) fail(`缺少组：${groupId}`);
  group.words.push({ text: add.text, length: add.length, tags: add.tags });
}

// 校验总量与重复
const allTexts = bank.groups.flatMap((g) => g.words.map((w) => w.text));
if (new Set(allTexts).size !== allTexts.length) fail("合并后出现重复词条");
const after = allTexts.length;
if (after !== before + additions.length) fail(`词量不符：${before} + ${additions.length} != ${after}`);

bank.version = "0.2.0";
writeFileSync(BANK_PATH, `${JSON.stringify(bank, null, 2)}\n`);

// 合并日志
const byGrade = {};
for (const add of additions) {
  byGrade[add.grade] = (byGrade[add.grade] || 0) + 1;
}
const byLen = {};
for (const add of additions) {
  byLen[add.length] = (byLen[add.length] || 0) + 1;
}
const log = [];
log.push("# Gameability 合并日志 v1.1（2026-09-04 执行）");
log.push("");
log.push(`- 来源：curation/generated/gameability-curation-v1.1-closure.json 终态 KEEP 442`);
log.push(`- 跳过：${skipped.length}（同卡片冲突，见下）`);
log.push(`- 实际新增：${additions.length}（按教材 provenance 年级落组，跨年级取最早）`);
log.push(`- 词库词量：${before} → ${after}；version 0.1.0 → 0.2.0（洗牌袋自动作废重建）`);
log.push("");
log.push("## 跳过清单");
log.push("");
for (const s of skipped) log.push(`- ${s.text}：${s.reason}`);
log.push("");
log.push("## 分组统计（新增）");
log.push("");
for (const g of [1, 2, 3, 4, 5, 6]) {
  if (byGrade[g]) log.push(`- grade-${g}：+${byGrade[g]}`);
}
log.push("");
log.push("## 字长统计（新增）");
log.push("");
for (const [len, n] of Object.entries(byLen).sort()) log.push(`- ${len} 字：${n}`);
log.push("");
log.push("## 备注");
log.push("");
log.push("- `suggestedDifficulty` 仅保留在 curation sidecar，未参与落组；组的 difficulty 字段未改动。");
log.push("- 四字词标签为合并时按语义补全（见 scripts/merge-gameability-v1.1.mjs 的 TAGS4）。");
log.push("- 合并后 textbook-diff 产物已按新词库重新生成（alreadyInBand 561 / newCandidates 1385）；");
log.push("  curation 系列产物保持合并前快照，validate-curation 已改为对照来源池并集校验。");
log.push("- 本次不重新运行 build-curation-* 构建脚本（其输入为合并前 diff 快照）。");
log.push("");
writeFileSync(LOG_PATH, log.join("\n") + "\n");

console.log(`merged: +${additions.length} (${before} -> ${after}), skipped ${skipped.length}`);
console.log("by grade:", JSON.stringify(byGrade));
console.log("by length:", JSON.stringify(byLen));
console.log("version: 0.1.0 -> 0.2.0");
