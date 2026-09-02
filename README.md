# 词语画猜

面向亲子场景的极简词语画猜 PWA。产品需求见 [docs/prd.md](docs/prd.md)。

## 目录结构

```text
static/huacai/    可直接发布的完整应用（源码即产物，无构建步骤）
  index.html      唯一入口，首页/游戏页/设置面板都在这一页内
  styles.css      样式（彩色卡片 + 大字黑白两种风格）
  shuffle-bag.js  持久化洗牌袋的纯逻辑模块（无 DOM 依赖）
  app.js          交互逻辑、候选词筛选、localStorage 偏好
  service-worker.js  离线缓存（network-first，联网时自动更新）
  manifest.webmanifest
  data/words.json 词库（独立维护，可整体替换）
  icons/          PWA 图标
scripts/          开发脚本（不参与发布）
  validate-wordbanks.mjs  词库校验
  report-wordbanks.mjs    词库覆盖报告
  test-shuffle-bag.mjs    洗牌袋行为测试
  wordbank-lib.mjs        上面三个脚本共用的工具
```

## 本地预览

```sh
python3 -m http.server 8765 --directory static
# 打开 http://localhost:8765/huacai/
```

注意：必须通过 `/huacai/` 子路径访问，模拟 Micro.blog 部署路径。

## 发布到 Micro.blog

把 `static/huacai/` 整个目录上传到 Micro.blog 静态文件目录，最终通过
`https://你的域名/huacai/` 访问。所有资源都是相对路径，无需服务器配置。

## 更新词库

直接替换 `static/huacai/data/words.json`，保持现有结构：
`groups[].difficulty` 取 `easy` / `normal` / `hard`，前台映射为
简单 / 普通 / 难一点；`words[].text` 为词语本身，`length` 为字数
（校验脚本会核对它与实际字数一致）。词库以 1–5 字词为主，主要是 2–4 字；
适合画猜的好词不必为了字数规则删除。

改完词库后运行校验和报告：

```sh
node scripts/validate-wordbanks.mjs   # 结构 / 字数 / tag / 重复词检查，失败退出码为 1
node scripts/report-wordbanks.mjs     # 按组、难度、字数、tag 的覆盖报告
node scripts/test-shuffle-bag.mjs     # 洗牌袋行为测试
```

校验会把重复词（同组或跨组）当作错误报告；运行时同一副牌里也只会出现一次。

## 词语洗牌袋

运行时不是每次开局都重新洗牌：候选词按
`来源:范围:四字开关:词库版本`（例如 `primary:all:true:0.1.0`）组成一个袋子，
洗好后存在 localStorage（`cyhc-shuffle-bags`）里按顺序消费。

* 退出再进会接着玩剩下的词，只有整袋消耗完才重新洗牌；
* 一轮之内不会出现重复词，循环交界处也会避开最近玩过的几个词；
* 换设置或词库升版会自动换新袋子，旧版本袋子会被清理；
* 词库增删词条后，恢复袋子时会先按当前候选池校验，失效词直接丢弃；
* 这些只影响出词顺序，界面不显示任何历史或进度。

给词库加了新词想立刻进入循环，或想让所有玩家重新洗牌，把词库 JSON 的
`version` 升一位即可。
