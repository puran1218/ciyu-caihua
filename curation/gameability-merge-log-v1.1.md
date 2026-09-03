# Gameability 合并日志 v1.1（2026-09-04 执行，2026-09-04 复核收口）

- 来源：curation/generated/gameability-curation-v1.1-closure.json 终态 KEEP 442
- 跳过：2（同卡片真冗余，见下）
- 实际新增：440（按教材 provenance 年级落组，跨年级取最早）
- 词库词量：840 → 1280；version 0.1.0 → 0.2.0（洗牌袋自动作废重建）
- Gameability REVIEW 剩余：0（225 项全部终结：终结复核 + 产品方裁定）

## 跳过清单

- 中秋：与库内『中秋赏月』同一张节日卡片，选库内词（产品方裁定）。
- 笑嘻嘻：微笑卡片库内已有『笑容』『笑脸』两个代表（产品方裁定）。

## 分组统计（新增）

- grade-2：+77
- grade-3：+115
- grade-4：+91
- grade-5：+84
- grade-6：+73

## 字长统计（新增）

- 2 字：343
- 3 字：40
- 4 字：57

## 备注

- `suggestedDifficulty` 仅保留在 curation sidecar，未参与落组；组的 difficulty 字段未改动。
- 四字词标签为合并时按语义补全（见 scripts/merge-gameability-v1.1.mjs 的 TAGS4）。
- 合并后 textbook-diff 产物已按新词库重新生成（alreadyInBand 561 / newCandidates 1385）；
  curation 系列产物保持合并前快照，validate-curation 已改为对照来源池并集校验。
- 本次不重新运行 build-curation-* 构建脚本（其输入为合并前 diff 快照）。

## 收口复核（2026-09-04）

- 全套校验通过：validate-wordbanks（1280 unique）、diff --check、validate-curation（含 v1/v1.1/closure/裁定全链）、report-wordbanks、洗牌袋行为测试、`git diff --check`。
- 幂等性：重复运行 merge 脚本会在“词已存在于词库”处中止，words.json 哈希不变（实测确认）。
- 运行时/PWA 代码零改动：相较上一提交仅 `static/huacai/data/words.json` 一个文件变化。
- 浏览器冒烟：合并后首次重载页面时，一次取词曾返回旧版 0.1.0 词库，强制刷新缓存后
  稳定获取 0.2.0。**原因未定位**（service worker 与 HTTP 缓存均有可能），未改任何代码；
  该表现与 network-first 的缓存回退路径一致，属可观察事实，非结论。


