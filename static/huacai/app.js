const SETTINGS_KEY = "cyhc-settings";

const DEFAULT_SETTINGS = {
  mode: "color",
  source: "primary",
  range: "all",
  allowFour: true,
};

const WORD_BANK_SOURCES = {
  primary: "./data/words.json",
  imagenet: "./data/imagenet-words.json",
};

// 兜底词库：words.json 加载失败时仍可开局
const FALLBACK_BANK = {
  version: "0.0.0",
  groups: [
    {
      id: "fallback",
      label: "示例",
      difficulty: "easy",
      words: [
        { text: "太阳", length: 2, tags: [] },
        { text: "月亮", length: 2, tags: [] },
        { text: "小鸟", length: 2, tags: [] },
        { text: "雨伞", length: 2, tags: [] },
        { text: "彩虹", length: 2, tags: [] },
        { text: "书包", length: 2, tags: [] },
      ],
    },
  ],
};

const state = {
  settings: loadSettings(),
  bank: FALLBACK_BANK,
};

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const wordText = document.getElementById("wordText");
const startBtn = document.getElementById("startBtn");
const bankStatus = document.getElementById("bankStatus");
const nextBtn = document.getElementById("nextBtn");
const exitBtn = document.getElementById("exitBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsBackdrop = document.getElementById("settingsBackdrop");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const resetBtn = document.getElementById("resetBtn");
const modeButtons = Array.from(document.querySelectorAll("[data-mode-option]"));
const sourceButtons = Array.from(
  document.querySelectorAll("#sourceSeg [data-source]"),
);
const rangeButtons = Array.from(
  document.querySelectorAll("#rangeSeg [data-range]"),
);
const fourButtons = Array.from(
  document.querySelectorAll("#fourSeg [data-four]"),
);

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    const settings = { ...DEFAULT_SETTINGS, ...(saved || {}) };
    if (!WORD_BANK_SOURCES[settings.source]) {
      settings.source = DEFAULT_SETTINGS.source;
    }
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    // Storage restrictions should not block the game.
  }
}

function isValidWord(word) {
  return (
    Boolean(word) &&
    typeof word.text === "string" &&
    word.text.trim() !== "" &&
    typeof word.length === "number" &&
    Number.isFinite(word.length) &&
    Array.isArray(word.tags) &&
    (word.difficulty === undefined || ["easy", "normal", "hard"].includes(word.difficulty))
  );
}

// 词库整体可用：结构完整，且至少有一个能玩的词
function isValidWordBank(bank) {
  return (
    Boolean(bank) &&
    Array.isArray(bank.groups) &&
    bank.groups.length > 0 &&
    bank.groups.some(
      (group) => Array.isArray(group.words) && group.words.some(isValidWord),
    )
  );
}

// 单个坏词条直接忽略，不让整个词库不可用；返回清理后的词库和忽略数量
function sanitizeWordBank(bank) {
  let skipped = 0;
  const groups = bank.groups.map((group) => {
    const words = Array.isArray(group.words) ? group.words : [];
    const validWords = words.filter((word) => {
      if (isValidWord(word)) {
        return true;
      }
      skipped += 1;
      return false;
    });
    return { ...group, words: validWords };
  });
  return { bank: { ...bank, groups }, skipped };
}

function countBankWords(bank) {
  return bank.groups.reduce((sum, group) => sum + group.words.length, 0);
}

// Group stays as provenance; a word may override its group's gameplay difficulty.
function candidateWords() {
  return CyhcWords.candidates(state.bank, state.settings);
}

// 袋子身份：换词库 / 换范围 / 换四字开关 / 词库升版都会用新袋子
function getBagKey() {
  return CyhcBag.bagKey({
    source: state.settings.source,
    range: state.settings.range,
    allowFour: state.settings.allowFour,
    version: state.bank.version,
  });
}

function nextWordFromBag() {
  const candidates = candidateWords();
  if (candidates.length === 0) {
    return "";
  }
  return CyhcBag.nextFromStore(localStorage, getBagKey(), candidates, {
    source: state.settings.source,
    version: state.bank.version,
  });
}

function applyMode() {
  document.body.dataset.mode = state.settings.mode;
  modeButtons.forEach((button) => {
    const selected = button.dataset.modeOption === state.settings.mode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function applySettingsUI() {
  sourceButtons.forEach((button) => {
    const selected = button.dataset.source === state.settings.source;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  rangeButtons.forEach((button) => {
    const selected = button.dataset.range === state.settings.range;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  fourButtons.forEach((button) => {
    const selected = (button.dataset.four === "on") === state.settings.allowFour;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function wordBankPath() {
  return WORD_BANK_SOURCES[state.settings.source] || WORD_BANK_SOURCES.primary;
}

let latestBankRequest = 0;

async function loadWordBank() {
  const requestId = ++latestBankRequest;
  const path = wordBankPath();
  startBtn.disabled = true;
  startBtn.textContent = "正在准备…";
  bankStatus.hidden = true;
  let nextBank = FALLBACK_BANK;
  let failure = null;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const bank = await response.json();
    if (!isValidWordBank(bank)) throw new Error("结构不符合预期");
    const { bank: cleanBank, skipped } = sanitizeWordBank(bank);
    nextBank = cleanBank;
    console.log(`[${path}] 加载成功，词条数:`, countBankWords(cleanBank));
    if (skipped > 0) console.warn(`[${path}] 忽略 ${skipped} 个无效词条`);
  } catch (err) {
    failure = err;
  }
  // Ignore responses from superseded source requests.
  if (requestId !== latestBankRequest) return;
  state.bank = nextBank;
  startBtn.disabled = false;
  startBtn.textContent = "开始玩";
  if (failure) {
    console.error(`[${path}] 加载失败，使用示例词库:`, failure);
    bankStatus.textContent = "词库暂时没加载成功，正在使用示例词语。";
    bankStatus.hidden = false;
  }
  if (gameScreen.classList.contains("active")) nextWord();
}

function showHome() {
  releaseWakeLock();
  gameScreen.classList.remove("active");
  homeScreen.classList.add("active");
}

function showGame() {
  homeScreen.classList.remove("active");
  gameScreen.classList.add("active");
}

function startGame() {
  if (startBtn.disabled) return;
  showGame();
  nextWord();
  requestWakeLock();
}

function nextWord() {
  const word = nextWordFromBag();
  if (!word) {
    return;
  }
  wordText.textContent = word;
  // 1–5 字各给一档字号；更长的词共用第 5 档，CSS 会按实际字数收缩
  const wordLength = Array.from(word).length;
  wordText.dataset.len = String(Math.min(wordLength, 5));
  wordText.style.setProperty("--word-chars", String(wordLength));
}

let settingsReturnFocus = null;
function openSettings() {
  settingsReturnFocus = document.activeElement;
  applySettingsUI();
  settingsBackdrop.hidden = false;
  sourceButtons[0].focus();
}

function closeSettings() {
  settingsBackdrop.hidden = true;
  if (settingsReturnFocus?.isConnected) settingsReturnFocus.focus();
  settingsReturnFocus = null;
}

settingsBackdrop.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusables = Array.from(settingsBackdrop.querySelectorAll("button:not(:disabled)"));
  const first = focusables[0], last = focusables[focusables.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

function isGameScreenTapTarget(target) {
  if (!target) {
    return false;
  }
  if (
    target.closest(
      "button, [role=button], a, input, select, textarea, .settings-panel, .settings-backdrop, .portrait-hint",
    )
  ) {
    return false;
  }
  return true;
}

function installGamePageTapHandler() {
  let down = null;
  gameScreen.addEventListener("pointerdown", (event) => {
    down = isGameScreenTapTarget(event.target) && event.isPrimary
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : null;
  });
  gameScreen.addEventListener("pointercancel", () => { down = null; });
  gameScreen.addEventListener("pointerup", (event) => {
    const start = down;
    down = null;
    if (!start || event.pointerId !== start.id) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 14) return;
    if (!gameScreen.classList.contains("active") || !settingsBackdrop.hidden) return;
    if (!isGameScreenTapTarget(event.target)) return;
    nextWord();
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.settings.mode = button.dataset.modeOption;
    applyMode();
    saveSettings();
  });
});

sourceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.settings.source = button.dataset.source;
    applySettingsUI();
    saveSettings();
    loadWordBank();
  });
});

rangeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.settings.range = button.dataset.range;
    applySettingsUI();
    saveSettings();
  });
});

fourButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.settings.allowFour = button.dataset.four === "on";
    applySettingsUI();
    saveSettings();
  });
});

resetBtn.addEventListener("click", () => {
  state.settings = { ...DEFAULT_SETTINGS };
  saveSettings();
  applyMode();
  applySettingsUI();
  loadWordBank();
});

document.getElementById("portraitDismissBtn").addEventListener("click", () => {
  document.body.dataset.portraitOk = "1";
});

settingsBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  openSettings();
});

closeSettingsBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  closeSettings();
});

settingsBackdrop.addEventListener("click", (event) => {
  if (event.target === settingsBackdrop) {
    closeSettings();
  }
});

function stopPointerEvent(event) {
  event.stopPropagation();
}

startBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  startGame();
});
startBtn.addEventListener("pointerup", stopPointerEvent);

nextBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  nextWord();
});
nextBtn.addEventListener("pointerup", stopPointerEvent);

exitBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  showHome();
});
exitBtn.addEventListener("pointerup", stopPointerEvent);

installGamePageTapHandler();

document.addEventListener("keydown", (event) => {
  if (!settingsBackdrop.hidden) {
    if (event.key === "Escape") closeSettings();
    return;
  }
  if (!gameScreen.classList.contains("active") || event.repeat || event.isComposing) return;
  // Focused buttons natively activate on Enter/Space: do not consume two cards.
  if (event.target?.closest?.("button, a, input, select, textarea, [role='button'], [contenteditable='true']")) return;
  if (["ArrowRight", " ", "Enter"].includes(event.key)) {
    event.preventDefault();
    nextWord();
  } else if (event.key === "Escape") {
    showHome();
  }
});

let wakeLock = null;
let wakeLockPending = false;

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.hidden ||
      !gameScreen.classList.contains("active") || wakeLock || wakeLockPending) return;
  wakeLockPending = true;
  try {
    const lock = await navigator.wakeLock.request("screen");
    if (document.hidden || !gameScreen.classList.contains("active")) {
      await lock.release();
      return;
    }
    wakeLock = lock;
    lock.addEventListener("release", () => {
      if (wakeLock === lock) wakeLock = null;
    });
  } catch {
    // Unsupported or denied wake locks must not interrupt play.
  } finally {
    wakeLockPending = false;
  }
}

function releaseWakeLock() {
  const lock = wakeLock;
  wakeLock = null;
  if (lock) lock.release().catch(() => {});
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseWakeLock();
  else requestWakeLock();
});

applyMode();
applySettingsUI();
loadWordBank();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
