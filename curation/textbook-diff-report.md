# 教材词池 × 当前游戏词库事实 diff 报告

纯事实比对：按 `text` 精确字符串相等判定，不做模糊/语义/繁简转换/子串匹配，不做任何可玩性判断。

## Overall

```text
Textbook source unique:     1946
Current game bank unique:    1280
Already represented:         561
New textbook candidates:     1385
Overlap percentage:          28.8%
```

## By grade

年级计数口径：一个教材词出现在几个年级，就在几个年级各计一次。
因此各年级行合计为 1956，不等于全局去重总数 1946；
差额 10 来自出现在多个年级的 10 个词。

Grade 2
  textbook unique: 266
  already in bank: 113
  new candidates: 153

Grade 3
  textbook unique: 494
  already in bank: 151
  new candidates: 343

Grade 4
  textbook unique: 429
  already in bank: 108
  new candidates: 321

Grade 5
  textbook unique: 378
  already in bank: 104
  new candidates: 274

Grade 6
  textbook unique: 389
  already in bank: 89
  new candidates: 300

## New candidates by text length

```text
2 字  1282
3 字  29
4 字  74
```

## Overlap by text length

```text
2 字  457
3 字  47
4 字  57
```

## Source words occurring in multiple grades

- 乐趣（3、6年级）
- 抬头（3、4年级）
- 搬家（3、5年级）
- 暖和（3、4年级）
- 楼梯（3、6年级）
- 沉思（3、6年级）
- 清晨（3、5年级）
- 温和（3、4年级）
- 烛光（3、6年级）
- 粉碎（5、6年级）

## Source observations

以下为源数据自带 audit 的事实记录，本 diff 未做任何修正：

- 文章开头声称总计 1770 个词语，但正文各年级标注数及实际粘贴文本均与此不一致。
- 四年级正文标注 430（上册 239、下册 191），当前粘贴文本实际解析 429（上册 238、下册 191）。
- 六年级正文标注总计 389，但小节标题写上册 230、下册 160；当前粘贴文本实际解析 389（上册 229、下册 160）。
- 源文本中可能存在粘连或排版问题，例如“眨眼通宵”；未自动拆分。
- 源 audit 记录了 13 个出现多次的词（共 1959 次出现 vs 1946 个去重词条，差额 13）。

---

由 `scripts/diff-textbook-wordbank.mjs` 生成；重新运行即可复现。