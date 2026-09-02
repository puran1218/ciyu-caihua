#!/usr/bin/env node
// 洗牌袋行为测试：node scripts/test-shuffle-bag.mjs
// 在 Node 里直接加载 static/huacai/shuffle-bag.js（纯逻辑、无 DOM 依赖），
// 用与 app.js 相同的 nextFromStore 流程驱动，不依赖任何测试框架。
import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = readFileSync(
  new URL("../static/huacai/shuffle-bag.js", import.meta.url),
  "utf8",
);
const CyhcBag = vm.runInNewContext(`${source}\n;CyhcBag;`, undefined, {
  filename: "shuffle-bag.js",
});

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function savedBags(storage) {
  return JSON.parse(storage.getItem(CyhcBag.BAGS_KEY));
}

// 与 app.js 的 nextWordFromBag 相同的调用方式
function play(storage, key, candidates, identity) {
  return CyhcBag.nextFromStore(storage, key, candidates, identity);
}

function poolOf(size, prefix = "词") {
  return Array.from({ length: size }, (_, i) => `${prefix}${i}`);
}

const IDENTITY = { source: "primary", version: "0.1.0" };

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`通过  ${name}`);
  } catch (err) {
    failures.push(name);
    console.error(`失败  ${name}\n${err.message}`);
  }
}

test("去重：跨组重复词在候选池里只保留一次，且保持顺序", () => {
  assert.deepEqual(CyhcBag.uniqueTexts(["太阳", "月亮", "太阳"]), ["太阳", "月亮"]);
  assert.deepEqual(CyhcBag.uniqueTexts([]), []);
});

test("袋子身份：key 包含来源/范围/四字开关/词库版本", () => {
  assert.equal(
    CyhcBag.bagKey({ source: "primary", range: "all", allowFour: true, version: "0.1.0" }),
    "primary:all:true:0.1.0",
  );
});

test("一轮完整循环：N 个候选词各出现且只出现一次", () => {
  const storage = fakeStorage();
  const pool = poolOf(25);
  const drawn = [];
  for (let i = 0; i < pool.length; i += 1) {
    drawn.push(play(storage, "k", pool, IDENTITY));
  }
  assert.equal(new Set(drawn).size, pool.length);
  assert.deepEqual([...drawn].sort(), [...pool].sort());
});

test("会话接续：重启后继续消费剩余袋子，而不是重新洗牌", () => {
  const storage = fakeStorage();
  const pool = poolOf(10);
  for (let i = 0; i < 3; i += 1) {
    play(storage, "k", pool, IDENTITY);
  }
  const saved = savedBags(storage)["k"];
  assert.equal(saved.bag.length, 7);
  assert.equal(saved.recent.length, 3);
  // 模拟退出重开：同一个 storage 再取 7 个词，顺序必须与剩余袋子完全一致
  const resumed = [];
  for (let i = 0; i < 7; i += 1) {
    resumed.push(play(storage, "k", pool, IDENTITY));
  }
  assert.deepEqual(resumed, saved.bag);
  // 已玩过的 3 个词不应在剩余部分再次出现
  for (const word of saved.recent) {
    assert.ok(!resumed.includes(word));
  }
});

test("耗尽重洗：新一轮第一个词不等于上一个词，且开头避开最近窗口", () => {
  const storage = fakeStorage();
  const pool = poolOf(12);
  const drawn = [];
  for (let i = 0; i < 48; i += 1) {
    drawn.push(play(storage, "k", pool, IDENTITY));
  }
  // 4 轮循环，每个循环边界上都不出现上一个词
  for (let cycle = 1; cycle < 4; cycle += 1) {
    assert.notEqual(drawn[cycle * 12], drawn[cycle * 12 - 1]);
  }
  // 每一轮都是全量词各出现一次
  for (let cycle = 0; cycle < 4; cycle += 1) {
    const words = drawn.slice(cycle * 12, cycle * 12 + 12);
    assert.equal(new Set(words).size, 12);
  }
  // 新一轮开头（前 RECENT_WINDOW 个位置）应包含所有「非最近」词
  const recentTail = drawn.slice(4, 12);
  const freshWords = pool.filter((word) => !recentTail.includes(word));
  const newHead = drawn.slice(12, 12 + CyhcBag.RECENT_WINDOW);
  for (const word of freshWords) {
    assert.ok(newHead.includes(word), `新循环开头应避开最近窗口：${word}`);
  }
  // 最近窗口截断到 8 个
  assert.equal(savedBags(storage)["k"].recent.length, CyhcBag.RECENT_WINDOW);
});

test("配置隔离：不同来源/范围/四字开关的袋子互不覆盖", () => {
  const storage = fakeStorage();
  const keys = [
    "primary:all:true:0.1.0",
    "primary:easy:true:0.1.0",
    "primary:all:false:0.1.0",
    "imagenet:all:true:0.1.0",
  ];
  const pool = poolOf(15);
  for (const key of keys) {
    play(storage, key, pool, IDENTITY);
    play(storage, key, pool, IDENTITY);
  }
  const saved = savedBags(storage);
  assert.deepEqual(Object.keys(saved).sort(), [...keys].sort());
  for (const key of keys) {
    assert.equal(saved[key].recent.length, 2);
  }
  // 在其中一个袋子上取词，其余袋子保持不变
  const snapshot = JSON.stringify(saved);
  play(storage, keys[0], pool, IDENTITY);
  const after = savedBags(storage);
  for (const key of keys.slice(1)) {
    assert.equal(JSON.stringify(after[key]), JSON.stringify(JSON.parse(snapshot)[key]));
  }
});

test("版本失效：词库升版得到全新袋子，旧版本袋子被清理，其他来源保留", () => {
  assert.notEqual(
    CyhcBag.bagKey({ source: "primary", range: "all", allowFour: true, version: "0.1.0" }),
    CyhcBag.bagKey({ source: "primary", range: "all", allowFour: true, version: "0.2.0" }),
  );
  const storage = fakeStorage();
  const pool = poolOf(8);
  play(storage, "primary:all:true:0.1.0", pool, { source: "primary", version: "0.1.0" });
  play(storage, "imagenet:all:true:0.1.0", pool, { source: "imagenet", version: "0.1.0" });
  play(storage, "primary:all:true:0.2.0", pool, { source: "primary", version: "0.2.0" });
  const saved = savedBags(storage);
  assert.ok(saved["primary:all:true:0.2.0"]);
  assert.equal(saved["primary:all:true:0.1.0"], undefined);
  assert.ok(saved["imagenet:all:true:0.1.0"]);
});

test("小词库：0/1/2 个候选词都不崩溃、不死循环、不连续重复", () => {
  const storage = fakeStorage();
  assert.equal(play(storage, "k", [], IDENTITY), "");
  const single = ["唯一"];
  for (let i = 0; i < 5; i += 1) {
    assert.equal(play(storage, "k", single, IDENTITY), "唯一");
  }
  const pair = ["甲", "乙"];
  let prev = "";
  for (let i = 0; i < 12; i += 1) {
    const word = play(storage, "k", pair, IDENTITY);
    assert.notEqual(word, prev);
    prev = word;
  }
});

test("过期数据：不在候选池里的词被丢弃；全失效或损坏时干净重建", () => {
  const storage = fakeStorage();
  const pool = ["甲", "乙", "丙", "丁"];
  // 部分失效：有效词保留顺序
  storage.setItem(
    CyhcBag.BAGS_KEY,
    JSON.stringify({ k: { bag: ["甲", "已删除", "乙"], recent: ["丙", "也不在"] } }),
  );
  assert.equal(play(storage, "k", pool, IDENTITY), "甲");
  assert.deepEqual(savedBags(storage)["k"].bag, ["乙"]);
  // 全部失效：从当前候选池重建
  storage.setItem(CyhcBag.BAGS_KEY, JSON.stringify({ k: { bag: ["x", "y"], recent: ["z"] } }));
  assert.ok(pool.includes(play(storage, "k", pool, IDENTITY)));
  // 剩余袋出现重复词：视为损坏，整袋重建且不输出重复
  storage.setItem(
    CyhcBag.BAGS_KEY,
    JSON.stringify({ k: { bag: ["甲", "甲", "乙"], recent: [] } }),
  );
  const rebuilt = play(storage, "k", pool, IDENTITY);
  assert.ok(pool.includes(rebuilt));
  assert.equal(savedBags(storage)["k"].bag.filter((w) => w === rebuilt).length, 0);
  // 损坏的存储内容
  storage.setItem(CyhcBag.BAGS_KEY, "not-json{");
  assert.ok(pool.includes(play(storage, "k", pool, IDENTITY)));
  storage.setItem(CyhcBag.BAGS_KEY, JSON.stringify({ k: "oops" }));
  assert.ok(pool.includes(play(storage, "k", pool, IDENTITY)));
});

test("存储异常：写入/读取失败不影响游戏继续", () => {
  const pool = ["甲", "乙", "丙"];
  const writeFail = fakeStorage();
  writeFail.setItem = () => {
    throw new Error("QuotaExceededError");
  };
  for (let i = 0; i < 5; i += 1) {
    assert.ok(pool.includes(play(writeFail, "k", pool, IDENTITY)));
  }
  const readFail = fakeStorage();
  readFail.getItem = () => {
    throw new Error("SecurityError");
  };
  for (let i = 0; i < 5; i += 1) {
    assert.ok(pool.includes(play(readFail, "k", pool, IDENTITY)));
  }
});

if (failures.length > 0) {
  console.error(`\n${failures.length} 个测试失败`);
  process.exit(1);
}
console.log(`\n全部 ${passed} 个测试通过`);
