# Gameability 策展汇总 v1

针对 textbook-diff 的 1825 个新增教材词：131 四字已复核、69 三字完成策展、1625 两字完成保守首轮过滤。年级只作来源记录，不代表游戏难度。

## 4-character reviewed set

- total：131
- KEEP：45
- MAYBE：45
- REJECT：41

## 3-character set

- total：69
- KEEP：20
- MAYBE：38
- REJECT：11

## 2-character first pass

- total：1625
- KEEP_CANDIDATE：118
- REJECT_CANDIDATE：700
- REVIEW：807

## By source grade

年级是教材 provenance，不是游戏难度；一个词出现在多个年级就在多个年级各计一次。

### Grade 2（去重 230）

- 4字：KEEP 5 / MAYBE 5 / REJECT 0
- 3字：KEEP 5 / MAYBE 3 / REJECT 0
- 2字：KEEP_CANDIDATE 21 / REJECT_CANDIDATE 71 / REVIEW 120

### Grade 3（去重 458）

- 4字：KEEP 8 / MAYBE 3 / REJECT 1
- 3字：KEEP 7 / MAYBE 12 / REJECT 2
- 2字：KEEP_CANDIDATE 36 / REJECT_CANDIDATE 158 / REVIEW 231

### Grade 4（去重 413）

- 4字：KEEP 14 / MAYBE 6 / REJECT 7
- 3字：KEEP 4 / MAYBE 10 / REJECT 1
- 2字：KEEP_CANDIDATE 24 / REJECT_CANDIDATE 168 / REVIEW 179

### Grade 5（去重 359）

- 4字：KEEP 11 / MAYBE 18 / REJECT 18
- 3字：KEEP 2 / MAYBE 7 / REJECT 4
- 2字：KEEP_CANDIDATE 20 / REJECT_CANDIDATE 130 / REVIEW 149

### Grade 6（去重 375）

- 4字：KEEP 7 / MAYBE 13 / REJECT 15
- 3字：KEEP 2 / MAYBE 6 / REJECT 4
- 2字：KEEP_CANDIDATE 19 / REJECT_CANDIDATE 174 / REVIEW 135

## By suggested tag（KEEP / KEEP_CANDIDATE）

标签只用现有 tagCatalog；展示未来可能新增到各分类的词量。

- drawable：138
- action：33
- object：22
- person：18
- body：14
- nature：14
- food：13
- festival：11
- animal：9
- home：9
- place：7
- plant：7
- tool：6
- school：5
- sports：5
- weather：5
- science：4
- transport：4
- space：3
- culture：2
- emotion：2
- color：1
- safety：1

## Conflict summary

- near-synonym groups：7
- same-drawing groups：83
- granularity groups：27
- phrase-variant groups：4

- 冲突组总数：121
- 复核队列（4字 MAYBE + 3字 MAYBE + 2字 REVIEW + 冲突组成员，去重）：924

---

由 `scripts/build-curation-artifacts.mjs` 从 `curation/authored/*` 与 `curation/textbook-diff.json` 生成；重新运行即可复现。