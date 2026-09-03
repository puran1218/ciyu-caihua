# Gameability 合并计划 v1.1（修订版，r2）

依据：`curation/generated/gameability-curation-v1.1-closure.json`（终态 KEEP 442 / REJECT 953 / REDUNDANT 430 / REVIEW 0）。
本文件只做计划，不改动 `static/huacai/data/words.json`，不改任何运行时代码。

## 1. 预期最终词量

- 当前词库：840（unique，已验证）；
- KEEP 候选：442（2 字 344 / 3 字 41 / 4 字 57；难度 easy 92 / normal 293 / hard 57）；
- 与库内词产生同卡片体验冲突的 2 个跳过（见 §3）；
- **预计新增 440，合并后 1280 词**。

## 2. 直接新增（无冲突）

**440 个**：与库内 840 词无精确重复（程序校验 0 处）、无同卡片冲突、标签与年级齐备（4 字词标签见 §4）。
示例：冰箱、围巾、公主、发抖、哭笑不得、争奇斗艳、五角星、巧克力、邮递员、理发、无聊、赶集。

## 3. 与现有词库的遗留冲突（20 对，按"同卡片体验"从严复核）

只有当两个词给出基本相同的游戏卡片体验时才跳过；语义相关本身不构成跳过理由。

### 跳过新增（2 个，库内词保留不动，产品方 2026-09 裁定）

| 候选（KEEP） | 库内已有 | 理由 |
|---|---|---|
| 中秋 | 中秋赏月 | 同一张节日卡片（圆月+月饼+赏月），语义相关且画面重合，选库内词 |
| 笑嘻嘻 | 笑容、笑脸 | 微笑卡片库内已有两个代表，第三张同卡片 |

### 共存（18 对，画面语义可区分，正常新增）

产品方明示共存：太空↔宇宙、过年↔春节贴福、庙会↔庙会舞狮、暴风雨↔雷雨、电灯泡↔灯、鹅卵石↔石头。
从严复核后共存：乌云↔白云（明暗可分）、叔叔↔爷爷（辈分年龄可分）、墙壁↔城墙（平墙/垛墙）、整理↔扫地（归置/清扫）、方向↔指南针（箭头/仪器）、星空↔星星（全景/单体，库内另有星空帐篷备案）、炎热↔夏天（烈日汗下/季节活动）、美食↔吃饭（满桌菜/进餐动作）、茅屋↔房子（草顶/砖房）、蔬菜↔白菜萝卜（总类/具体）、蜡烛↔烛台（烛/台）、醒来↔睡觉（醒/睡）。

> 若未来想以候选词换库内词，必须显式列出"删除库内词"的替换动作；本次不删任何库内词。

### 新增内部已接受的成对代表（无需处理，仅备案）

火烧云+晚霞（红云漫天/暮色霞光）、桃花+梅花（春桃/寒梅）。

## 4. 年级分组 / 难度 / 标签策略（r2 修订：按 provenance 落组）

- **落组只看教材出处**：每个新词放入其来源年级组；跨年级词取最早（最小）来源年级。组的难度字段（一/二年级 easy，三/四年级 normal，五/六年级 hard）保持现状不动。
- **`suggestedDifficulty` 仅作 sidecar 策展元数据保留**在 curation 产物中，不参与本次落组，也不改运行时 schema（本任务不解耦词级难度）。
- **标签**：直接使用策展产物的 `suggestedTags`（均已在现有 tagCatalog 内）。**例外**：4 字 KEEP（57 个）沿用的已复核文件没有标签，合并时按语义补：动作/表情类 → `drawable, action` / `drawable, emotion`；场景类 → `drawable, nature` / `drawable, place`；文化/成语场景 → `drawable, culture`。
- **词条结构**：沿用 `{ text, length, tags }`，length 为实际字数（合并后由 validate-wordbanks 核对）。

## 5. 合并时将改动的文件

| 文件 | 改动 |
|---|---|
| `static/huacai/data/words.json` | 唯一运行时数据改动：grade-2~6 组追加 440 词；`version` 0.1.0 → **0.2.0** |
| `curation/gameability-merge-log-v1.1.md`（新） | 记录实际落表清单与跳过清单 |

不改动：`app.js`、`shuffle-bag.js`、`index.html`、`styles.css`、`service-worker.js`（数据文件属 network-first 缓存，无新增资源，无需 bump `CACHE_NAME`）。`version` 升位即可让所有玩家的洗牌袋自动作废重建（bag key 含 version）。

## 6. 合并后验证

1. `node scripts/validate-wordbanks.mjs` —— 结构/字数/tag/组内与跨组重复全部通过（重点：新增 434 词不得与库内 840 词跨组重复）；
2. `node scripts/report-wordbanks.mjs` —— 覆盖报告刷新，确认各分类增量；
3. `node scripts/diff-textbook-wordbank.mjs` —— diff 重跑：alreadyInBank 应增加约 434，验证无遗漏；
4. `node scripts/validate-curation.mjs` —— 策展链路完整性不回退；
5. `git diff --check` + 人工 diff 审阅（确认只动 words.json/README/merge-log）；
6. 浏览器冒烟（`/huacai/`）：开局出词、新袋 key `primary:*:*:0.2.0` 生效、长词排版正常。

## 7. 明确不做

- 不自动删除/替换任何库内词（§3 的替换仅当产品方显式确认后手工执行）；
- 不引入 REDUNDANT 词（430 个仅留档 sidecar）；
- 不动运行时代码与 PWA 结构；
- 本计划本身不改任何文件内容。
