# 词语画猜

面向亲子场景的极简词语画猜 PWA。产品需求见 [docs/prd.md](docs/prd.md)。

## 目录结构

```text
static/huacai/    可直接发布的完整应用（源码即产物，无构建步骤）
  index.html      唯一入口，首页/游戏页/设置面板都在这一页内
  styles.css      样式（彩色卡片 + 大字黑白两种风格）
  app.js          交互逻辑、洗牌随机、localStorage 偏好
  service-worker.js  离线缓存（network-first，联网时自动更新）
  manifest.webmanifest
  data/words.json 词库（独立维护，可整体替换）
  icons/          PWA 图标
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
简单 / 普通 / 难一点；`words[].text` 为词语本身，`length` 为字数。
