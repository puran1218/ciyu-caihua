# Gameability 策展汇总 v1.1

维度修订：`Guess Specificity` → `Semantic Guessability`（语义邻域即可，不要求命中词面）；近义歧义从个体 REVIEW 移入冲突消解（canonical + REDUNDANT）；新增 REDUNDANT 终态。对照 [gameability-rubric-v1.1.md](rubric/gameability-rubric-v1.1.md)。

## 总体

- KEEP：428
- REJECT：757
- REDUNDANT：415
- REVIEW（剩余队列）：225
- 合计：1825

## 按词长

- 4char：KEEP 45 / REJECT 41 / REDUNDANT 7 / REVIEW 38
- 3char：KEEP 41 / REJECT 12 / REDUNDANT 14 / REVIEW 2
- 2char：KEEP 342 / REJECT 704 / REDUNDANT 394 / REVIEW 185

## 冲突消解

- v1 冲突组：121
- v1.1 消解簇（含 REDUNDANT 成员）：265
- 词库共存说明（无候选成员的消解说明）：3
- 未覆盖的 v1 冲突组：1（打猎/猎人）

## 与 v1 相比的主要变化（示例）

- 发抖：REVIEW(v1 邻居歧义) → KEEP；颤抖/发颤/抖动 → REDUNDANT_WITH 发抖。
- 暴风雨：v1 按 rubric 校准压为 MAYBE → KEEP（邻域即命中）。
- 幸福/休息/寻找/假装/拒绝/停泊/搬运/排练/探望/尖叫/吓唬/屏息/倒霉：REVIEW → KEEP。
- 打猎/猎人/猎物/坦克/勇猛/敌人：KEEP/REVIEW 维持 REVIEW，按 v1.1 暴力邻域规则收紧。
- 匪徒/攻击/搏斗/恐怖：收紧为 REJECT。
- 一望无际/精疲力竭/震天动地/哄堂大笑/心惊胆战/威风凛凛/全神贯注（四字）：→ REDUNDANT，指向代表词。

## 剩余 REVIEW 的构成（真实产品判断）

暴力/惊悚程度（打猎、搏斗类）、双关词（杜鹃、画眉、结实）、上位词体验（动物、生物）、负面基调（绝望、辛酸）、地图/符号依赖（东北、日本、长江）、元概念（角色、游戏、提示）、熟悉度存疑（海参、藤萝、染缸）等。

复核队列：225 项（v1 为 924 项）。

---

由 `scripts/build-curation-v1-1.mjs` 生成；重新运行即可复现。
