// 词语画猜 — 持久化洗牌袋
// 纯逻辑，不碰 DOM：app.js 负责筛选候选词并提供 localStorage，
// scripts/test-shuffle-bag.mjs 可以在 Node 里直接加载本文件验证行为。
//
// 玩法模型：每个「来源 + 范围 + 四字开关 + 词库版本」组合对应一个袋子。
// 袋子里是洗好的剩余词，按顺序消费；全部消耗完才重新洗一整轮，
// 因此退出重开不会立刻重玩没玩过的词，一轮之内也不会出现重复词。
const CyhcBag = {
  // 所有袋子集中存这一个 key，值为 { 袋子key: { bag, recent } }
  BAGS_KEY: "cyhc-shuffle-bags",
  // 循环交界处的「最近玩过」窗口大小
  RECENT_WINDOW: 8,

  // 袋子身份：四项配置任一变化都会得到一个全新袋子
  bagKey({ source, range, allowFour, version }) {
    return `${source}:${range}:${allowFour}:${version}`;
  },

  // 候选池按 text 去重，保留首次出现的顺序
  uniqueTexts(texts) {
    const seen = new Set();
    return texts.filter((text) => {
      if (seen.has(text)) {
        return false;
      }
      seen.add(text);
      return true;
    });
  },

  // Fisher-Yates 洗牌，返回新数组
  shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  // 生成新一轮袋子：整副洗牌后做一次确定性微调，
  // 让开头一段避开最近玩过的词（只交换位置，不重排，不破坏均匀性），
  // 并保证第一个词不与上一轮最后一个词相同。
  createBag(candidates, recentWords) {
    const bag = CyhcBag.shuffle(candidates);
    const recent = new Set(recentWords.slice(-CyhcBag.RECENT_WINDOW));
    if (recent.size > 0) {
      const headSize = Math.min(bag.length, recent.size);
      let j = headSize;
      for (let i = 0; i < headSize; i += 1) {
        if (!recent.has(bag[i])) {
          continue;
        }
        while (j < bag.length && recent.has(bag[j])) {
          j += 1;
        }
        if (j >= bag.length) {
          break;
        }
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // 词太少导致开头避不开时，兜底换掉与上一个词相同的开头
      if (bag.length > 1 && bag[0] === recentWords[recentWords.length - 1]) {
        [bag[0], bag[1]] = [bag[1], bag[0]];
      }
    }
    return bag;
  },

  // 校验持久化的袋子：丢弃已不在当前候选池里的词；
  // 剩余袋出现重复词说明数据异常，整袋作废等待重建。
  restoreBag(saved, candidates) {
    const candidateSet = new Set(candidates);
    let bag = [];
    let recent = [];
    if (saved && typeof saved === "object") {
      if (Array.isArray(saved.bag)) {
        bag = saved.bag.filter((text) => candidateSet.has(text));
      }
      if (Array.isArray(saved.recent)) {
        recent = saved.recent
          .filter((text) => candidateSet.has(text))
          .slice(-CyhcBag.RECENT_WINDOW);
      }
    }
    if (new Set(bag).size !== bag.length) {
      bag = [];
    }
    return { bag, recent };
  },

  // 从袋子里取下一个词；袋空时自动开新一轮。返回 null 表示候选池为空。
  takeFromBag(bagState, candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return null;
    }
    const saved = bagState && typeof bagState === "object" ? bagState : {};
    let bag = Array.isArray(saved.bag) ? saved.bag : [];
    const recent = Array.isArray(saved.recent) ? saved.recent : [];
    if (bag.length === 0) {
      bag = CyhcBag.createBag(candidates, recent);
    }
    const word = bag[0];
    return {
      word,
      bagState: {
        bag: bag.slice(1),
        recent: [...recent, word].slice(-CyhcBag.RECENT_WINDOW),
      },
    };
  },

  // 读取全部袋子；存储缺失或损坏时按无袋子处理
  loadBags(storage) {
    try {
      const saved = JSON.parse(storage.getItem(CyhcBag.BAGS_KEY));
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        return saved;
      }
    } catch {
      // 忽略损坏数据
    }
    return {};
  },

  // 同一词库旧版本的袋子已经失效，直接清掉，避免残留堆积
  pruneBags(bags, { source = "", version = "" } = {}) {
    const prefix = `${source}:`;
    const suffix = `:${version}`;
    const kept = {};
    for (const [key, value] of Object.entries(bags)) {
      if (key.startsWith(prefix) && !key.endsWith(suffix)) {
        continue;
      }
      kept[key] = value;
    }
    return kept;
  },

  // 完整的一次取词流程：读取 → 校验 → 取词 → 清理 → 写回。
  // identity 传 { source, version }，用于清理同词库旧版本的袋子。
  nextFromStore(storage, key, candidates, identity) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return "";
    }
    const bags = CyhcBag.loadBags(storage);
    const restored = CyhcBag.restoreBag(bags[key], candidates);
    const result = CyhcBag.takeFromBag(restored, candidates);
    if (!result) {
      return "";
    }
    bags[key] = result.bagState;
    try {
      storage.setItem(
        CyhcBag.BAGS_KEY,
        JSON.stringify(CyhcBag.pruneBags(bags, identity)),
      );
    } catch {
      // 存储不可用时游戏继续，只是下次无法接续
    }
    return result.word;
  },
};
