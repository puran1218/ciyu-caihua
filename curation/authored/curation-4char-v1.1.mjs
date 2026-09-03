// 四字词 v1.1 复核决策（仅冲突消解产生的 REDUNDANT；其余沿用已复核状态）。
export default {
  "一望无际": { o: "REDUNDANT", c: "一望无边" },
  "精疲力竭": { o: "REDUNDANT", c: "筋疲力尽" },
  "震天动地": { o: "REDUNDANT", c: "惊天动地" },
  "哄堂大笑": { o: "REDUNDANT", c: "哈哈大笑" },
  "心惊胆战": { o: "REDUNDANT", c: "心惊肉跳" },
  "威风凛凛": { o: "REDUNDANT", c: "威武" },
  "全神贯注": { o: "REDUNDANT", c: "认真" },
  // —— 消解代表词提升：v1 MAYBE → v1.1 KEEP（作为簇代表保留）——
  "一望无边": { o: "KEEP", d: "hard", t: ["drawable", "nature"], r: "极目远眺的天际线画面明确，作为该簇代表词保留（一望无际记 REDUNDANT）。" },
  "惊天动地": { o: "KEEP", d: "hard", t: ["drawable", "action"], r: "巨响震动的夸张场景可画可猜，作为该簇代表词保留（震天动地记 REDUNDANT）。" },
};
