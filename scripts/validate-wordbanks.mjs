#!/usr/bin/env node
// 词库校验：检查 JSON 结构、词条字段、字数、tag、重复词。
// 用法：node scripts/validate-wordbanks.mjs [词库路径...]
// 校验失败时退出码为 1。
import { resolveBankPaths, loadBankFile, validateBank, DIFFICULTIES } from "./wordbank-lib.mjs";

function printBlock(text) {
  for (const line of text.split("\n")) {
    console.error(`  ${line}`);
  }
}

function printSummary(path, stats) {
  console.log(path);
  console.log(`  total: ${stats.total}`);
  console.log(`  unique: ${stats.unique}`);
  for (const difficulty of DIFFICULTIES) {
    console.log(`  ${difficulty}: ${stats.byDifficulty[difficulty] || 0}`);
  }
}

const paths = resolveBankPaths(process.argv.slice(2));
let failed = false;

for (const path of paths) {
  let bank;
  try {
    bank = loadBankFile(path);
  } catch (err) {
    console.error(path);
    printBlock(err.message);
    failed = true;
    continue;
  }
  const { errors, stats } = validateBank(bank);
  if (errors.length > 0) {
    failed = true;
    console.error(path);
    for (const error of errors) {
      printBlock(error);
    }
  } else {
    printSummary(path, stats);
  }
}

if (failed) {
  console.error("\nValidation failed.");
  process.exit(1);
}
console.log("\nValidation passed.");
