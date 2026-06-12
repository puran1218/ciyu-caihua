const SETTINGS_KEY = "cyhc-settings";

const DEFAULT_SETTINGS = {
  mode: "color",
  range: "all",
  allowFour: true
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
        { "text": "太阳", "length": 2, "tags": [] },
        { "text": "月亮", "length": 2, "tags": [] },
        { "text": "小鸟", "length": 2, "tags": [] },
        { "text": "雨伞", "length": 2, "tags": [] },
        { "text": "彩虹", "length": 2, "tags": [] },
        { "text": "书包", "length": 2, "tags": [] }
      ]
    }
  ]
};

const state = {
  settings: loadSettings(),
  bank: FALLBACK_BANK,
  deck: [],
  index: -1,
  lastWord: ""
};

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const wordText = document.getElementById("wordText");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const exitBtn = document.getElementById("exitBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsBackdrop = document.getElementById("settingsBackdrop");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const resetBtn = document.getElementById("resetBtn");
const modeButtons = Array.from(document.querySelectorAll("[data-mode-option]"));
const rangeButtons = Array.from(document.querySelectorAll("#rangeSeg [data-range]"));
const fourButtons = Array.from(document.querySelectorAll("#fourSeg [data-four]"));

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return { ...DEFAULT_SETTINGS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function candidateWords() {
  const { range, allowFour } = state.settings;
  const groups = state.bank.groups.filter(
    group => range === "all" || group.difficulty === range
  );
  const words = groups
    .flatMap(group => group.words)
    .filter(word => allowFour || word.length < 4)
    .map(word => word.text);
  // 设置组合筛不出词时退回全量，保证总能开局
  if (words.length === 0) {
    return state.bank.groups.flatMap(group => group.words.map(word => word.text));
  }
  return words;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rebuildDeck() {
  state.deck = shuffle(candidateWords());
  state.index = -1;
  // 新一轮第一个词避免和上一个词相同
  if (state.deck.length > 1 && state.deck[0] === state.lastWord) {
    const swap = 1 + Math.floor(Math.random() * (state.deck.length - 1));
    [state.deck[0], state.deck[swap]] = [state.deck[swap], state.deck[0]];
  }
}

function applyMode() {
  document.body.dataset.mode = state.settings.mode;
  modeButtons.forEach(button => {
    button.classList.toggle("selected", button.dataset.modeOption === state.settings.mode);
  });
}

function applySettingsUI() {
  rangeButtons.forEach(button => {
    button.classList.toggle("selected", button.dataset.range === state.settings.range);
  });
  fourButtons.forEach(button => {
    button.classList.toggle("selected", (button.dataset.four === "on") === state.settings.allowFour);
  });
}

function showHome() {
  gameScreen.classList.remove("active");
  homeScreen.classList.add("active");
}

function showGame() {
  homeScreen.classList.remove("active");
  gameScreen.classList.add("active");
}

function startGame() {
  rebuildDeck();
  showGame();
  nextWord();
}

function nextWord() {
  state.index += 1;
  if (state.index >= state.deck.length) {
    rebuildDeck();
    state.index = 0;
  }
  const word = state.deck[state.index];
  state.lastWord = word;
  wordText.textContent = word;
  wordText.classList.toggle("four", word.length >= 4);
}

function openSettings() {
  applySettingsUI();
  settingsBackdrop.hidden = false;
}

function closeSettings() {
  settingsBackdrop.hidden = true;
}

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    state.settings.mode = button.dataset.modeOption;
    applyMode();
    saveSettings();
  });
});

rangeButtons.forEach(button => {
  button.addEventListener("click", () => {
    state.settings.range = button.dataset.range;
    applySettingsUI();
    saveSettings();
  });
});

fourButtons.forEach(button => {
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
});

document.getElementById("portraitDismissBtn").addEventListener("click", () => {
  document.body.dataset.portraitOk = "1";
});

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
settingsBackdrop.addEventListener("click", event => {
  if (event.target === settingsBackdrop) {
    closeSettings();
  }
});

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", nextWord);
exitBtn.addEventListener("click", showHome);

document.addEventListener("keydown", event => {
  if (!settingsBackdrop.hidden) {
    if (event.key === "Escape") {
      closeSettings();
    }
    return;
  }
  if (!gameScreen.classList.contains("active")) {
    return;
  }
  if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
    nextWord();
  }
  if (event.key === "Escape") {
    showHome();
  }
});

applyMode();

fetch("./data/words.json")
  .then(response => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
  .then(bank => {
    if (bank && Array.isArray(bank.groups) && bank.groups.length > 0) {
      state.bank = bank;
    }
  })
  .catch(() => {});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
