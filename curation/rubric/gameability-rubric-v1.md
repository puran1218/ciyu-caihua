# 词语画猜 — Gameability Rubric v1

## 目标

Gameability 用来判断一个小学语文词语是否适合成为「词语画猜」的游戏题目。

它衡量的是“拿出来画、猜、玩是否成立”，而不是词语本身是否重要、是否来自教材、是否值得学习。

教材来源是 provenance，不等于 gameability。

## 四个正向维度

每个候选词按以下维度判断：

### Visualizability（V，0–3）

- 3：能用非常明确的物体、人物、动作或场景直接画出来。
- 2：可以画，但需要组合场景或约定俗成的视觉表达。
- 1：勉强能用画面暗示，但较依赖解释。
- 0：基本无法通过图画表达。

### Guess Specificity（G，0–3）

- 3：看到典型画面后，很有机会猜到这个具体词。
- 2：有一定歧义，但仍能比较自然地猜到。
- 1：容易猜成许多近义词、上位词或相关词。
- 0：即使画出来，也很难锁定这个词。

### Child Familiarity（F，0–2）

- 2：大多数小学生无需解释就知道。
- 1：部分孩子知道，或更适合中高年级。
- 0：明显冷门、专业、时代/文化背景依赖较强。

### Playfulness（P，0–2）

- 2：很容易形成有趣、夸张、好玩的画面/动作。
- 1：能正常玩，但趣味性一般。
- 0：基本没有游戏画面感。

基础分：

`score = V + G + F + P`，满分 10。

## Penalty / Hard Reject

以下问题单独记录，不应靠高分抵消：

- `abstract`：高度抽象、价值判断、心理/逻辑概念。
- `function-word`：连接、指代、语法性或功能性词语。
- `ambiguous-visual`：能画，但无法从画面锁定具体词。
- `context-dependent`：必须依赖课文故事背景才能猜。
- `too-niche`：专业、古旧或文化背景要求过高。
- `sensitive`：不适合轻松亲子游戏的死亡、酷刑、明显暴力等内容。
- `weapon`：以武器本身为题目的词。
- `text-dependent`：通常必须写字、数字、符号才能表达。

`sensitive` / `weapon` 默认直接 REJECT，除非后续明确改变产品策略。

## 最终状态

### KEEP

通常满足：

- V >= 2
- G >= 2
- score >= 7
- 无 hard-reject 问题

是正式游戏词库的高置信候选。

### MAYBE

通常包括：

- score 4–6；
- 或某个维度明显有争议；
- 或很有趣但猜中具体词有难度；
- 或适合高年级/特定家庭，但不一定适合默认混合词库。

MAYBE 应人工看一眼，不自动加入正式词库。

### REJECT

通常包括：

- V = 0 且 G = 0；
- score <= 3；
- function-word / 高度抽象；
- sensitive / weapon；
- 明显依赖课文上下文；
- 很难通过画面猜中具体词。

## 难度和 Gameability 分开

“好不好玩”和“难不难”不是一回事。

例如：

- `雨伞`：高 gameability，easy
- `猫头鹰`：高 gameability，normal
- `亡羊补牢`：高 gameability，hard
- `意义`：低 gameability，不应该因为是六年级词就成为 hard

正式词库的 difficulty 仍使用：

- easy
- normal
- hard

但只对 KEEP 词分配 difficulty。

## Calibration Examples

### KEEP

| 词语 | V | G | F | P | Score | 说明 |
|---|---:|---:|---:|---:|---:|---|
| 雨伞 | 3 | 3 | 2 | 1 | 9 | 形象明确 |
| 指南针 | 3 | 3 | 2 | 1 | 9 | 外形与功能都明显 |
| 北极星 | 2 | 2 | 2 | 1 | 7 | 可用星空+方向表达 |
| 青蛙 | 3 | 3 | 2 | 2 | 10 | 极佳亲子画猜词 |
| 蒲公英 | 3 | 3 | 2 | 2 | 10 | 视觉特征鲜明 |
| 猫头鹰 | 3 | 3 | 2 | 2 | 10 | 视觉辨识度高 |
| 恐龙 | 3 | 3 | 2 | 2 | 10 | 高趣味 |
| 肥皂泡 | 3 | 3 | 2 | 2 | 10 | 场景明确 |
| 萤火虫 | 3 | 3 | 2 | 2 | 10 | 有明显视觉线索 |
| 钢琴 | 3 | 3 | 2 | 2 | 10 | 外形鲜明 |
| 亡羊补牢 | 3 | 2 | 2 | 2 | 9 | 四字词但场景非常明确 |
| 手舞足蹈 | 3 | 2 | 2 | 2 | 9 | 动作型四字词，适合 hard |

### MAYBE

| 词语 | V | G | F | P | Score | 说明 |
|---|---:|---:|---:|---:|---:|---|
| 春天 | 2 | 1 | 2 | 1 | 6 | 能画季节，但具体词歧义大 |
| 丰收 | 2 | 2 | 2 | 1 | 7 | 可以画，但依赖场景组合 |
| 旅行 | 2 | 1 | 2 | 2 | 7 | 有趣，但可能猜成旅游/出发 |
| 公园 | 2 | 2 | 2 | 1 | 7 | 可画，但视觉特征不唯一 |
| 暴风雨 | 3 | 2 | 2 | 2 | 9 | 很好画，但可能猜成雷雨/下雨 |
| 骄傲 | 1 | 1 | 2 | 1 | 5 | 可通过表情动作暗示，歧义较高 |

### REJECT

| 词语 | V | G | F | P | Score | 原因 |
|---|---:|---:|---:|---:|---:|---|
| 原来 | 0 | 0 | 2 | 0 | 2 | function-word / abstract |
| 格外 | 0 | 0 | 1 | 0 | 1 | abstract |
| 难道 | 0 | 0 | 2 | 0 | 2 | function-word |
| 例如 | 0 | 0 | 2 | 0 | 2 | function-word |
| 似乎 | 0 | 0 | 2 | 0 | 2 | abstract |
| 程度 | 0 | 0 | 1 | 0 | 1 | abstract |
| 价值 | 0 | 0 | 2 | 0 | 2 | abstract |
| 意义 | 0 | 0 | 2 | 0 | 2 | abstract |
| 责任 | 1 | 0 | 2 | 0 | 3 | abstract / ambiguous |
| 尸首 | 2 | 2 | 1 | 0 | 5 | sensitive，hard reject |
| 苦刑 | 1 | 1 | 1 | 0 | 3 | sensitive，hard reject |
| 手榴弹 | 3 | 3 | 1 | 0 | 7 | weapon，hard reject |

## Curation 输出字段（sidecar only）

不要把这些字段加入正式 `words.json`。

候选策展文件可以使用：

```json
{
  "text": "蒲公英",
  "gameability": {
    "visualizability": 3,
    "guessSpecificity": 3,
    "childFamiliarity": 2,
    "playfulness": 2,
    "score": 10,
    "status": "KEEP",
    "flags": [],
    "reason": "视觉特征鲜明，儿童熟悉，容易画也容易猜"
  },
  "suggestedDifficulty": "normal",
  "suggestedTags": ["drawable", "plant"]
}
```

正式运行时词库仍保持当前简洁 schema：

`text / length / tags`，难度由 group 表达。
