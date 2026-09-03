// 三字词 v1.1 复核决策（相对 v1 的变化项；未列出的词沿用 v1 状态）。
// 变化类型：MAYBE→KEEP（语义邻域可达）；MAYBE→REDUNDANT（冲突消解）；
// MAYBE→REJECT / REVIEW；KEEP 不降级（除非硬拒绝复查，本批无）。
// D = REDUNDANT，c = canonical。
export default {
  // —— 升为 KEEP：语义邻域可达，v1 的扣分只是"可能猜成近义词" ——
  "暴风雨": { o: "KEEP", d: "normal", t: ["drawable", "weather"], r: "风雨大作画面直达『暴雨/雷雨』邻域，v1.1 下邻域即命中。" },
  "催眠曲": { o: "KEEP", d: "normal", t: ["drawable", "home"], r: "哄睡唱歌场景直观，进入『摇篮曲/哄睡』邻域即算命中。" },
  "台湾岛": { o: "KEEP", d: "normal", t: ["drawable", "place"], r: "岛屿+海图画法可行，『岛/台湾』邻域可达，教材地理词认知度高。" },
  "天然气": { o: "KEEP", d: "normal", t: ["drawable", "science"], r: "灶台蓝火场景进入『燃气/煤气灶』邻域。" },
  "慢吞吞": { o: "KEEP", d: "normal", t: ["drawable", "action"], r: "乌龟慢走憨态可掬，『慢/慢悠悠』邻域即命中。" },
  "毛茸茸": { o: "KEEP", d: "easy", t: ["drawable", "animal"], r: "绒毛小动物画面可爱，『软毛/蓬松』邻域直达。" },
  "圆滚滚": { o: "KEEP", d: "easy", t: ["drawable", "animal"], r: "圆胖形象趣味强，『胖乎乎/圆』邻域即命中。" },
  "湿淋淋": { o: "KEEP", d: "normal", t: ["drawable", "weather"], r: "落汤鸡形象鲜明，『淋湿/湿透』邻域直达。" },
  "白茫茫": { o: "KEEP", d: "normal", t: ["drawable", "weather"], r: "雪原雾海一片白，『一片白/大雪』邻域可达。" },
  "软绵绵": { o: "KEEP", d: "easy", t: ["drawable", "nature"], r: "云朵棉絮触感画面，『软/蓬松』邻域即命中。" },
  "眼巴巴": { o: "KEEP", d: "normal", t: ["drawable", "emotion"], r: "渴望眼神生动，『盼着/盯着看』邻域直达。" },
  "眼睁睁": { o: "KEEP", d: "normal", t: ["drawable", "emotion"], r: "眼睁睁看着的神态可画，『看着/干着急』邻域可达。" },
  "瞧不起": { o: "KEEP", d: "normal", t: ["drawable", "emotion"], r: "斜眼俯视表情明确，『看不起/蔑视』邻域命中。" },
  "笑嘻嘻": { o: "KEEP", d: "easy", t: ["drawable", "emotion"], r: "咧嘴嬉笑表情鲜明，作为笑簇代表词。" },
  "脚腕子": { o: "KEEP", d: "easy", t: ["drawable", "body"], r: "脚踝特写直观，『脚踝/脚脖子』邻域即命中。" },
  "腊八粥": { o: "KEEP", d: "normal", t: ["drawable", "festival"], r: "腊八熬粥场景节令感强，『粥/腊八』邻域可达。" },
  "难为情": { o: "KEEP", d: "normal", t: ["drawable", "emotion"], r: "脸红低头神态明确，『害羞/不好意思』邻域命中。" },
  "露馅儿": { o: "KEEP", d: "hard", t: ["drawable", "food"], r: "破皮流馅的画面有趣，『露馅/被发现了』邻域可达。" },
  "造纸术": { o: "KEEP", d: "hard", t: ["drawable", "culture"], r: "抄纸晾浆流程可画，『造纸/四大发明』邻域可达。" },
  "原子核": { o: "KEEP", d: "hard", t: ["drawable", "science"], r: "原子模型进入『原子』邻域即命中，科普画法成立。" },
  "目的地": { o: "KEEP", d: "normal", t: ["drawable", "place"], r: "地图插旗+路线直观，『终点/要去的地方』邻域可达。" },

  // —— 冲突消解：REDUNDANT，指向代表词 ——
  "静悄悄": { o: "REDUNDANT", c: "安静" },
  "暖洋洋": { o: "REDUNDANT", c: "温暖" },
  "亮晶晶": { o: "REDUNDANT", c: "闪闪发光" },
  "明晃晃": { o: "REDUNDANT", c: "闪闪发光" },
  "雾蒙蒙": { o: "REDUNDANT", c: "雾气" },
  "黑乎乎": { o: "REDUNDANT", c: "黑暗" },
  "金灿灿": { o: "REDUNDANT", c: "黄色" },
  "热乎乎": { o: "REDUNDANT", c: "炎热" },
  "热辣辣": { o: "REDUNDANT", c: "炎热" },
  "外祖父": { o: "REDUNDANT", c: "爷爷" },
  "驾驶员": { o: "REDUNDANT", c: "司机" },
  "农作物": { o: "REDUNDANT", c: "庄稼" },
  "大自然": { o: "REDUNDANT", c: "自然" },
  "笑呵呵": { o: "REDUNDANT", c: "笑嘻嘻" },

  // —— 其它调整 ——
  "万寿菊": { o: "REJECT", r: "v1 的歧义扣分掩盖了真问题：品种词儿童熟悉度不足（too-niche），画面只能落到『花/菊花』且无从指向该品种。" },
  "反推力": { o: "REVIEW", r: "力本身不可见，火箭反冲示意是否适合小学生作画，需人工判断。" },
  "轻悠悠": { o: "REVIEW", r: "书面化状态词，儿童熟悉度存疑，漂浮画面与『飘』难以区分出独立游戏体验。" },
};
