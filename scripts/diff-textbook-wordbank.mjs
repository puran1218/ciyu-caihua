#!/usr/bin/env node
// 教材词语池 vs 当前游戏词库的事实性 diff（仅精确文本匹配，无任何主观判断）。
// 读取：
//   curation/sources/textbook-words-2-6.source.json   教材源词池（纯 provenance，不进 PWA）
//   static/huacai/data/words.json                      当前可玩词库（只读，不修改）
// 生成：
//   curation/textbook-diff.json                        diff 结果（alreadyInBank / newCandidates）
//   curation/textbook-diff-report.md                   人类可读报告
// 用法：
//   node scripts/diff-textbook-wordbank.mjs           重新生成两个产物并打印摘要
//   node scripts/diff-textbook-wordbank.mjs --check   只校验产物与计算结果一致，不写入
// 仅用 Node 内置模块，结果确定可复现。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_PATH = join(ROOT, "curation/sources/textbook-words-2-6.source.json");
const BANK_PATH = join(ROOT, "static/huacai/data/words.json");
const DIFF_PATH = join(ROOT, "curation/textbook-diff.json");
const REPORT_PATH = join(ROOT, "curation/textbook-diff-report.md");
const GRADES = [2, 3, 4, 5, 6];
const CHECK_MODE = process.argv.includes("--check");

function fail(message) {
  console.error(`不变量校验失败：${message}`);
  process.exit(1);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function byText(a, b) {
  return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
}

function pct(part, total) {
  return total === 0 ? "0.0%" : `${((part / total) * 100).toFixed(1)}%`;
}

// —— 1. 读取教材源词池 ——
const source = readJson(SOURCE_PATH);
const sourceWords = source.words;

// —— 2. 当前游戏词库：拍平 + 精确去重 ——
const bank = readJson(BANK_PATH);
const bankTextsRaw = bank.groups.flatMap((group) =>
  group.words.map((word) => word.text),
);
const bankDuplicates = [...new Set(bankTextsRaw.filter((t, i) => bankTextsRaw.indexOf(t) !== i))];
const bankSet = new Set(bankTextsRaw);

// —— 3. 精确文本 diff ——
const alreadyInBank = [];
const newCandidates = [];
for (const word of sourceWords) {
  (bankSet.has(word.text) ? alreadyInBank : newCandidates).push({
    text: word.text,
    length: word.length,
    grades: [...word.grades].sort((a, b) => a - b),
    occurrences: word.occurrences,
  });
}
alreadyInBank.sort(byText);
newCandidates.sort(byText);

// —— 4. 年级分布：一个词出现在几个年级就在几行各计一次 ——
const byGrade = {};
for (const grade of GRADES) {
  const inGrade = sourceWords.filter((word) => word.grades.includes(grade));
  byGrade[String(grade)] = {
    sourceUnique: inGrade.length,
    alreadyInBank: inGrade.filter((word) => bankSet.has(word.text)).length,
    newCandidates: inGrade.filter((word) => !bankSet.has(word.text)).length,
  };
}

const lengthDistribution = (words) => {
  const dist = {};
  for (const word of words) {
    dist[word.length] = (dist[word.length] || 0) + 1;
  }
  return dist;
};

const summary = {
  sourceUnique: sourceWords.length,
  currentBankUnique: bankSet.size,
  alreadyInBank: alreadyInBank.length,
  newCandidates: newCandidates.length,
};

// —— 5. 不变量校验（任一失败即退出码 1）——
if (new Set(sourceWords.map((w) => w.text)).size !== sourceWords.length) {
  fail("教材源词池中存在重复 text");
}
if (bankDuplicates.length > 0) {
  fail(`游戏词库中存在重复 text：${bankDuplicates.join("、")}`);
}
const alreadyTexts = new Set(alreadyInBank.map((w) => w.text));
const newTexts = new Set(newCandidates.map((w) => w.text));
if (alreadyTexts.size !== alreadyInBank.length) fail("alreadyInBank 内部有重复 text");
if (newTexts.size !== newCandidates.length) fail("newCandidates 内部有重复 text");
for (const text of alreadyTexts) {
  if (newTexts.has(text)) fail(`"${text}" 同时出现在两个列表中`);
}
if (alreadyInBank.length + newCandidates.length !== summary.sourceUnique) {
  fail("alreadyInBank + newCandidates != sourceUnique");
}
const union = new Set([...alreadyTexts, ...newTexts]);
const sourceTexts = new Set(sourceWords.map((w) => w.text));
if (union.size !== sourceTexts.size || sourceTexts.size !== union.size) {
  fail("两列表的并集不等于教材源词集合");
}
for (const text of sourceTexts) {
  if (!union.has(text)) fail(`源词 "${text}" 未落入任一列表`);
}
// 溯源完整：输出条目必须逐字保留源词池的 text/length/grades/occurrences
const sourceByText = new Map(sourceWords.map((w) => [w.text, w]));
for (const entry of [...alreadyInBank, ...newCandidates]) {
  const origin = sourceByText.get(entry.text);
  if (!origin) fail(`"${entry.text}" 缺少源记录`);
  if (
    entry.length !== origin.length ||
    JSON.stringify(entry.grades) !== JSON.stringify([...origin.grades].sort((a, b) => a - b)) ||
    JSON.stringify(entry.occurrences) !== JSON.stringify(origin.occurrences)
  ) {
    fail(`"${entry.text}" 的源 provenance 与输出不一致`);
  }
}

// 源文件自带 audit 的交叉核对（不一致只警告，不修改源数据）
const warnings = [];
const audit = source.audit || {};
if (audit.parsedUniqueWords !== undefined && audit.parsedUniqueWords !== sourceWords.length) {
  warnings.push(`audit.parsedUniqueWords=${audit.parsedUniqueWords} 与实际词条数 ${sourceWords.length} 不一致`);
}
const occurrenceTotal = sourceWords.reduce((sum, w) => sum + w.occurrences.length, 0);
if (audit.parsedOccurrences !== undefined && audit.parsedOccurrences !== occurrenceTotal) {
  warnings.push(`audit.parsedOccurrences=${audit.parsedOccurrences} 与实际出现次数 ${occurrenceTotal} 不一致`);
}

// —— 6. 生成产物 ——
const diff = {
  schema: "cn-primary-textbook-gamebank-diff",
  version: "0.1.0",
  generatedFrom: {
    source: "curation/sources/textbook-words-2-6.source.json",
    gameBank: "static/huacai/data/words.json",
  },
  summary,
  byGrade,
  alreadyInBank,
  newCandidates,
};

const multiGradeWords = sourceWords
  .filter((word) => word.grades.length > 1)
  .sort(byText)
  .map((word) => `${word.text}（${word.grades.join("、")}年级）`);

function gradeNote() {
  const gradeTotal = GRADES.reduce((sum, g) => sum + byGrade[String(g)].sourceUnique, 0);
  return [
    "年级计数口径：一个教材词出现在几个年级，就在几个年级各计一次。",
    `因此各年级行合计为 ${gradeTotal}，不等于全局去重总数 ${summary.sourceUnique}；`,
    `差额 ${gradeTotal - summary.sourceUnique} 来自出现在多个年级的 ${multiGradeWords.length} 个词。`,
  ].join("\n");
}

function renderReport() {
  const lines = [];
  lines.push("# 教材词池 × 当前游戏词库事实 diff 报告");
  lines.push("");
  lines.push("纯事实比对：按 `text` 精确字符串相等判定，不做模糊/语义/繁简转换/子串匹配，不做任何可玩性判断。");
  lines.push("");
  lines.push("## Overall");
  lines.push("");
  lines.push("```text");
  lines.push(`Textbook source unique:     ${summary.sourceUnique}`);
  lines.push(`Current game bank unique:    ${summary.currentBankUnique}`);
  lines.push(`Already represented:         ${summary.alreadyInBank}`);
  lines.push(`New textbook candidates:     ${summary.newCandidates}`);
  lines.push(`Overlap percentage:          ${pct(summary.alreadyInBank, summary.sourceUnique)}`);
  lines.push("```");
  lines.push("");
  lines.push("## By grade");
  lines.push("");
  lines.push(gradeNote());
  lines.push("");
  for (const grade of GRADES) {
    const row = byGrade[String(grade)];
    lines.push(`Grade ${grade}`);
    lines.push(`  textbook unique: ${row.sourceUnique}`);
    lines.push(`  already in bank: ${row.alreadyInBank}`);
    lines.push(`  new candidates: ${row.newCandidates}`);
    lines.push("");
  }
  lines.push("## New candidates by text length");
  lines.push("");
  lines.push("```text");
  for (const [len, count] of Object.entries(lengthDistribution(newCandidates)).sort((a, b) => a[0] - b[0])) {
    lines.push(`${len} 字  ${count}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Overlap by text length");
  lines.push("");
  lines.push("```text");
  for (const [len, count] of Object.entries(lengthDistribution(alreadyInBank)).sort((a, b) => a[0] - b[0])) {
    lines.push(`${len} 字  ${count}`);
  }
  lines.push("```");
  lines.push("");
  lines.push("## Source words occurring in multiple grades");
  lines.push("");
  if (multiGradeWords.length === 0) {
    lines.push("(none)");
  } else {
    lines.push(multiGradeWords.map((w) => `- ${w}`).join("\n"));
  }
  lines.push("");
  lines.push("## Source observations");
  lines.push("");
  lines.push("以下为源数据自带 audit 的事实记录，本 diff 未做任何修正：");
  lines.push("");
  for (const note of (audit.knownCountInconsistencies || [])) {
    lines.push(`- ${note}`);
  }
  const dupCount = (audit.duplicates || []).length;
  lines.push(`- 源 audit 记录了 ${dupCount} 个出现多次的词（共 ${occurrenceTotal} 次出现 vs ${summary.sourceUnique} 个去重词条，差额 ${occurrenceTotal - summary.sourceUnique}）。`);
  if (warnings.length > 0) {
    lines.push("");
    lines.push("交叉核对警告：");
    for (const warning of warnings) {
      lines.push(`- ${warning}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`由 \`scripts/diff-textbook-wordbank.mjs\` 生成；重新运行即可复现。`);
  return lines.join("\n");
}

const diffJson = `${JSON.stringify(diff, null, 2)}\n`;
const reportMd = renderReport();

if (CHECK_MODE) {
  let drifted = false;
  for (const [path, computed, label] of [
    [DIFF_PATH, diffJson, "textbook-diff.json"],
    [REPORT_PATH, reportMd, "textbook-diff-report.md"],
  ]) {
    let existing = null;
    try {
      existing = readFileSync(path, "utf8");
    } catch {
      console.error(`缺少产物：${path}`);
      drifted = true;
      continue;
    }
    if (existing !== computed) {
      console.error(`产物与计算结果不一致：${path}`);
      drifted = true;
    }
  }
  if (drifted) process.exit(1);
  console.log("产物与计算结果一致，无漂移。");
} else {
  mkdirSync(dirname(DIFF_PATH), { recursive: true });
  writeFileSync(DIFF_PATH, diffJson);
  writeFileSync(REPORT_PATH, reportMd);
}

// —— 7. 打印摘要 ——
console.log(`sourceUnique:      ${summary.sourceUnique}`);
console.log(`currentBankUnique: ${summary.currentBankUnique}`);
console.log(`alreadyInBank:     ${summary.alreadyInBank}`);
console.log(`newCandidates:     ${summary.newCandidates}`);
console.log(`overlap:           ${pct(summary.alreadyInBank, summary.sourceUnique)}`);
for (const grade of GRADES) {
  const row = byGrade[String(grade)];
  console.log(
    `grade ${grade}: source=${row.sourceUnique} inBank=${row.alreadyInBank} new=${row.newCandidates}`,
  );
}
console.log("invariants: OK");
