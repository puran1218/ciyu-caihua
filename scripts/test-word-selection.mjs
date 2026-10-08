#!/usr/bin/env node
// Regression tests for optional word-level difficulty and filter fallback.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { validateBank } from "./wordbank-lib.mjs";

const src = readFileSync(new URL("../static/huacai/word-selection.js", import.meta.url), "utf8");
const CyhcWords = vm.runInNewContext(`${src}\n;CyhcWords;`);
const names = (bank, settings) => Array.from(CyhcWords.candidates(bank, settings));

const sample = {
  groups: [
    { id: "grade-2", difficulty: "easy", words: [
      { text: "太阳", length: 2, tags: [] },
      { text: "亡羊补牢", length: 4, tags: [], difficulty: "hard" },
    ] },
    { id: "grade-6", difficulty: "hard", words: [
      { text: "火箭升空", length: 4, tags: [], difficulty: "easy" },
      { text: "黑洞", length: 2, tags: [] },
      { text: "太阳", length: 2, tags: [], difficulty: "easy" },
    ] },
  ],
};
assert.deepEqual(names(sample, { range: "all", allowFour: true }), ["太阳", "亡羊补牢", "火箭升空", "黑洞"]);
assert.deepEqual(names(sample, { range: "easy", allowFour: true }), ["太阳", "火箭升空"]);
assert.deepEqual(names(sample, { range: "easy", allowFour: false }), ["太阳"]);
assert.deepEqual(names(sample, { range: "hard", allowFour: true }), ["亡羊补牢", "黑洞"]);
assert.deepEqual(names(sample, { range: "hard", allowFour: false }), ["黑洞"]);
assert.deepEqual(names(sample, { range: "normal", allowFour: false }), ["太阳", "黑洞"]);
assert.deepEqual(names(sample, { range: "normal", allowFour: true }), ["太阳", "亡羊补牢", "火箭升空", "黑洞"]);
// When nothing matches the range but four-character words remain, relax range before the length switch.
assert.deepEqual(names({ groups: [{ id: "test", difficulty: "hard", words: [{ text: "长长成语", length: 4 }] }] },
  { range: "easy", allowFour: false }), ["长长成语"]);

const bank = JSON.parse(readFileSync(new URL("../static/huacai/data/words.json", import.meta.url), "utf8"));
const { errors, stats } = validateBank(bank);
assert.deepEqual(errors, []);
assert.equal(bank.version, "0.3.0");
assert.equal(stats.total, 1280);
assert.deepEqual(stats.byDifficulty, { easy: 312, normal: 523, hard: 445 });
const all = bank.groups.flatMap(g => g.words.map(w => ({ ...w, group: g.id })));
assert.equal(all.filter(w => w.difficulty !== undefined).length, 56);
assert.equal(all.find(w => w.text === "亡羊补牢").difficulty, "hard");
assert.equal(all.find(w => w.text === "火箭升空").difficulty, "easy");
assert.equal(all.find(w => w.text === "小猫钓鱼").group, "grade-3");
assert.equal(all.find(w => w.text === "亡羊补牢").group, "grade-2");

// Unknown per-word difficulty must be rejected by the standard validator.
const malformed = structuredClone(bank);
malformed.groups[0].words[0].difficulty = "impossible";
assert.ok(validateBank(malformed).errors.some(e => e.includes("difficulty")));
console.log("Word-selection and calibrated difficulty tests passed.");
