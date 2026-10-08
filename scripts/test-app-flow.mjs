#!/usr/bin/env node
// Minimal browserless interaction regression test: no third-party test runner.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = file => readFileSync(new URL(`../static/huacai/${file}`, import.meta.url), "utf8");
const instances = new Map();
let document;
function element(name, dataset = {}) {
  const listeners = {};
  const classes = new Set(name === "homeScreen" ? ["active"] : []);
  const el = {
    name, dataset, hidden: name === "settingsBackdrop", disabled: false,
    textContent: "", isConnected: true,
    style: { setProperty() {} },
    classList: {
      contains: name => classes.has(name),
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
    },
    addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); },
    setAttribute(name, value) { this[name] = value; },
    closest(query) { return query.includes("button") && this.name.includes("Btn") ? this : null; },
    focus() { document.activeElement = this; },
    querySelectorAll() { return [...sources, ...ranges, ...fours, instances.get("resetBtn"), instances.get("closeSettingsBtn")]; },
    emit(name, props = {}) {
      const event = {
        target: this, stopPropagation() {}, preventDefault() { this.defaultPrevented = true; },
        ...props,
      };
      for (const fn of listeners[name] || []) fn(event);
      return event;
    },
  };
  return el;
}

for (const name of ["homeScreen","gameScreen","wordText","startBtn","bankStatus","nextBtn",
  "exitBtn","settingsBtn","settingsBackdrop","closeSettingsBtn","resetBtn","portraitDismissBtn"])
  instances.set(name, element(name));
const modes = ["color","mono"].map(value => element("mode", { modeOption: value }));
const sources = ["primary","imagenet"].map(value => element("source", { source: value }));
const ranges = ["all","easy","normal","hard"].map(value => element("range", { range: value }));
const fours = ["on","off"].map(value => element("four", { four: value }));
const docListeners = {};
document = {
  body: { dataset: {} }, activeElement: instances.get("startBtn"), hidden: false,
  getElementById: id => instances.get(id),
  querySelectorAll(selector) {
    return selector === "[data-mode-option]" ? modes
      : selector.includes("sourceSeg") ? sources
      : selector.includes("rangeSeg") ? ranges : fours;
  },
  addEventListener(name, fn) { (docListeners[name] ||= []).push(fn); },
  emit(name, props = {}) {
    const event = {
      target: instances.get("wordText"), stopPropagation() {},
      preventDefault() { this.defaultPrevented = true; }, ...props,
    };
    for (const fn of docListeners[name] || []) fn(event);
  },
};

const memory = new Map();
const storage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, String(value)),
};
const pending = [];
function fetchMock(path) {
  return new Promise((resolve, reject) => { pending.push({ path, resolve, reject }); });
}
const locks = [];
const navigator = {
  wakeLock: {
    async request() {
      const sentinel = {
        released: false,
        addEventListener() {},
        async release() { this.released = true; },
      };
      locks.push(sentinel);
      return sentinel;
    },
  },
};
const context = vm.createContext({
  document, window: { addEventListener() {} }, navigator, localStorage: storage,
  fetch: fetchMock, console: { log() {}, warn() {}, error() {} },
});
vm.runInContext([read("shuffle-bag.js"), read("word-selection.js"), read("app.js")].join("\n"), context);
const readState = expression => vm.runInContext(expression, context);
const flush = () => new Promise(resolve => setImmediate(resolve));
const bank = (version, texts) => ({
  version, groups: [{ id: "group", difficulty: "easy",
    words: texts.map(text => ({ text, length: [...text].length, tags: [] })) }],
});
const success = (request, wordbank) => request.resolve({ ok: true, json: async () => wordbank });
const bags = () => JSON.parse(memory.get("cyhc-shuffle-bags") || "{}");
const used = () => Object.values(bags()).reduce((n, value) => n + value.recent.length, 0);

assert.equal(pending.length, 1);
assert.equal(instances.get("startBtn").disabled, true);
instances.get("startBtn").emit("click");
assert.equal(instances.get("gameScreen").classList.contains("active"), false);

// The newer Imagenet response wins even if the earlier primary fetch finishes last.
sources[1].emit("click");
assert.equal(pending.length, 2);
success(pending[1], bank("imagenet-v", ["小猫","小狗","小熊","小牛","小鸟"]));
await flush();
assert.equal(instances.get("startBtn").disabled, false);
assert.equal(readState("state.bank.version"), "imagenet-v");
success(pending[0], bank("primary-old", ["太阳","月亮"]));
await flush();
assert.equal(readState("state.bank.version"), "imagenet-v");

instances.get("startBtn").emit("click");
await flush();
assert.equal(instances.get("gameScreen").classList.contains("active"), true);
assert.equal(locks.length, 1);
assert.equal(used(), 1);

// A native button receives keyboard events and then its own click: consume only one card.
document.emit("keydown", { key: "Enter", target: instances.get("nextBtn") });
assert.equal(used(), 1);
instances.get("nextBtn").emit("click");
assert.equal(used(), 2);
// A non-interactive region can use the global shortcut.
document.emit("keydown", { key: " ", target: instances.get("wordText") });
assert.equal(used(), 3);
// Ignore swipes while keeping short taps.
const game = instances.get("gameScreen");
game.emit("pointerdown", { target: instances.get("wordText"), pointerId: 1, isPrimary: true, clientX: 5, clientY: 5 });
game.emit("pointerup", { target: instances.get("wordText"), pointerId: 1, clientX: 50, clientY: 50 });
assert.equal(used(), 3);
game.emit("pointerdown", { target: instances.get("wordText"), pointerId: 2, isPrimary: true, clientX: 5, clientY: 5 });
game.emit("pointerup", { target: instances.get("wordText"), pointerId: 2, clientX: 7, clientY: 7 });
assert.equal(used(), 4);

// Lock is released on background and reacquired on foreground.
document.hidden = true;
document.emit("visibilitychange");
await flush();
assert.equal(locks[0].released, true);
document.hidden = false;
document.emit("visibilitychange");
await flush();
assert.equal(locks.length, 2);
instances.get("exitBtn").emit("click");
await flush();
assert.equal(locks[1].released, true);

// Dialog selection exposes aria-pressed and restores focus when closed.
document.activeElement = instances.get("settingsBtn");
instances.get("settingsBtn").emit("click");
assert.equal(instances.get("settingsBackdrop").hidden, false);
assert.equal(document.activeElement, sources[0]);
assert.equal(sources[1]["aria-pressed"], "true");
instances.get("closeSettingsBtn").emit("click");
assert.equal(document.activeElement, instances.get("settingsBtn"));

// Failure must be visible, but must not disable play.
sources[0].emit("click");
pending.at(-1).reject(new Error("offline"));
await flush();
assert.equal(instances.get("bankStatus").hidden, false);
assert.equal(instances.get("startBtn").disabled, false);
assert.equal(readState("state.bank.version"), "0.0.0");

console.log("App lifecycle, race, input, wake lock, and fallback regression tests passed.");
