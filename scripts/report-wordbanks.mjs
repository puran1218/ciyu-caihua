#!/usr/bin/env node
// 词库覆盖报告：帮助人工扩充词库时发现薄弱分类。
// 用法：node scripts/report-wordbanks.mjs [词库路径...]
// 只做信息展示，不改变退出码（除非文件读不了）。
import {
  resolveBankPaths,
  loadBankFile,
  validateBank,
  tagCoverage,
  DIFFICULTIES,
} from "./wordbank-lib.mjs";

function pad(text, width) {
  return String(text).padEnd(width);
}

function align(text, width) {
  return String(text).padStart(width);
}

function printReport(path, bank, stats) {
  console.log(`${path}  (version ${stats.version || "缺失"})`);
  console.log(
    `  total ${stats.total} | unique ${stats.unique} | duplicates ${stats.duplicates} | unknown tags ${stats.unknownTags}`,
  );

  console.log("\n  words per group");
  for (const group of stats.byGroup) {
    console.log(
      `    ${pad(group.id, 16)} ${pad(group.label, 10)} ${pad(group.difficulty, 8)} ${align(group.count, 5)}`,
    );
  }

  console.log("\n  words per difficulty");
  for (const difficulty of DIFFICULTIES) {
    console.log(`    ${pad(difficulty, 10)} ${align(stats.byDifficulty[difficulty] || 0, 5)}`);
  }

  console.log("\n  words by length");
  const lengths = Object.keys(stats.byLength).map(Number).sort((a, b) => a - b);
  for (const len of lengths) {
    console.log(`    ${pad(`${len} 字`, 10)} ${align(stats.byLength[len], 5)}`);
  }

  console.log("\n  tag coverage");
  for (const { tag, count, known } of tagCoverage(stats, bank)) {
    console.log(`    ${pad(known ? tag : `${tag}（未知）`, 16)} ${align(count, 5)}`);
  }
  console.log();
}

const paths = resolveBankPaths(process.argv.slice(2));
let failed = false;

for (const path of paths) {
  try {
    const bank = loadBankFile(path);
    const { stats } = validateBank(bank);
    printReport(path, bank, stats);
  } catch (err) {
    console.error(`${path}\n  ${err.message}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
