# 词库级冲突分析 v1

冲突组总数：121

- near-synonym：7 组
- same-drawing：83 组
- granularity：27 组
- phrase-variant：4 组

每组给出成员来源与当前判定；只标记不删词，由下一轮人工取舍。

## near-synonym：一望无边 / 一望无际

- 建议：review-one-or-both
- 原因：四字近义，画面同为极目远眺的天际线，建议二选一。
- 成员：一望无边（4char-reviewed，MAYBE）、一望无际（4char-reviewed，MAYBE）

## near-synonym：筋疲力尽 / 精疲力竭

- 建议：review-one-or-both
- 原因：同为瘫坐喘息的疲惫画面，已复核文件倾向保留前者。
- 成员：筋疲力尽（4char-reviewed，KEEP）、精疲力竭（4char-reviewed，MAYBE）

## near-synonym：惊天动地 / 震天动地

- 建议：review-one-or-both
- 原因：同为巨响震动的夸张画面，几乎不可区分。
- 成员：惊天动地（4char-reviewed，MAYBE）、震天动地（4char-reviewed，MAYBE）

## same-drawing：哄堂大笑 / 哈哈大笑

- 建议：review-one-or-both
- 原因：同为众人大笑场面，画出来无法区分。
- 成员：哄堂大笑（4char-reviewed，KEEP）、哈哈大笑（4char-reviewed，KEEP）

## same-drawing：心惊肉跳 / 心惊胆战

- 建议：review-one-or-both
- 原因：同为受惊捂胸表情，画面高度重合。
- 成员：心惊肉跳（4char-reviewed，KEEP）、心惊胆战（4char-reviewed，KEEP）

## same-drawing：威风凛凛 / 威武

- 建议：review-one-or-both
- 原因：同为昂首挺立的威风形象。
- 成员：威风凛凛（4char-reviewed，MAYBE）、威武（2char-prefilter，REVIEW）

## granularity：大吃一惊 / 吃惊 / 惊奇 / 惊叹

- 建议：review-one-or-both
- 原因：惊讶表情家族：四字/双字并存会互相抢答，需控制数量。
- 成员：大吃一惊（4char-reviewed，KEEP）、吃惊（2char-prefilter，REVIEW）、惊奇（2char-prefilter，REVIEW）、惊叹（2char-prefilter，REVIEW）

## phrase-variant：急急忙忙 / 慌忙 / 赶紧

- 建议：review-one-or-both
- 原因：匆忙奔走画面相同，词形长短不同。
- 成员：急急忙忙（4char-reviewed，KEEP）、慌忙（2char-prefilter，REVIEW）、赶紧（2char-prefilter，REVIEW）

## same-drawing：闪闪发光 / 闪烁 / 亮晶晶 / 晶莹

- 建议：review-one-or-both
- 原因：发光/闪亮视觉符号相同，状态词扎堆。
- 成员：闪闪发光（4char-reviewed，KEEP）、闪烁（2char-prefilter，REVIEW）、亮晶晶（3char-curation，MAYBE）、晶莹（2char-prefilter，REVIEW）

## near-synonym：司机 / 驾驶员

- 建议：review-one-or-both
- 原因：开车画面完全相同，儿童更常答『司机』。
- 成员：司机（words.json(当前词库)，已在游戏中）、驾驶员（3char-curation，MAYBE）

## near-synonym：渔夫 / 渔民

- 建议：review-one-or-both
- 原因：撒网捕鱼画面相同。
- 成员：渔夫（words.json(当前词库)，已在游戏中）、渔民（2char-prefilter，REVIEW）

## granularity：灯 / 电灯泡

- 建议：review-one-or-both
- 原因：灯泡即灯的具体化，画面高度重合。
- 成员：灯（words.json(当前词库)，已在游戏中）、电灯泡（3char-curation，KEEP）

## same-drawing：火烧云 / 朝霞 / 晚霞

- 建议：review-one-or-both
- 原因：同为天空红霞，早晚方向难以画分。
- 成员：火烧云（3char-curation，KEEP）、朝霞（2char-prefilter，REVIEW）、晚霞（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：暴风雨 / 雷雨 / 阵雨 / 风暴

- 建议：review-one-or-both
- 原因：风雨大作画面相同，天气词需控制粒度。
- 成员：暴风雨（3char-curation，MAYBE）、雷雨（words.json(当前词库)，已在游戏中）、阵雨（2char-prefilter，REVIEW）、风暴（2char-prefilter，REVIEW）

## near-synonym：丹顶鹤 / 白鹤

- 建议：review-one-or-both
- 原因：白色鹤类形象几乎一致。
- 成员：丹顶鹤（words.json(当前词库)，已在游戏中）、白鹤（2char-prefilter，REVIEW）

## granularity：石头 / 鹅卵石

- 建议：review-one-or-both
- 原因：卵石是石头的具体化，溪边场景重合。
- 成员：石头（words.json(当前词库)，已在游戏中）、鹅卵石（3char-curation，KEEP）

## same-drawing：石钟乳 / 石笋

- 建议：review-one-or-both
- 原因：同为溶洞场景，一垂一立，儿童难以区分。
- 成员：石钟乳（3char-curation，KEEP）、石笋（2char-prefilter，REVIEW）

## same-drawing：荷花 / 睡莲

- 建议：review-one-or-both
- 原因：浮水莲花与荷花在儿童画中无法区分。
- 成员：荷花（words.json(当前词库)，已在游戏中）、睡莲（2char-prefilter，REVIEW）

## same-drawing：暖和 / 温暖 / 温和 / 暖洋洋

- 建议：review-one-or-both
- 原因：暖意场景（晒太阳/围炉）高度重合。
- 成员：暖和（2char-prefilter，REVIEW）、温暖（2char-prefilter，REVIEW）、温和（2char-prefilter，REVIEW）、暖洋洋（3char-curation，MAYBE）

## same-drawing：安静 / 宁静 / 寂静 / 肃静 / 清静 / 静悄悄

- 建议：review-one-or-both
- 原因：无声场景家族，六词一画，建议最多留一两个。
- 成员：安静（2char-prefilter，REVIEW）、宁静（2char-prefilter，REVIEW）、寂静（2char-prefilter，REVIEW）、肃静（2char-prefilter，REVIEW）、清静（2char-prefilter，REVIEW）、静悄悄（3char-curation，MAYBE）

## near-synonym：宇宙 / 太空

- 建议：review-one-or-both
- 原因：星空星球画面相同，语义近同。
- 成员：宇宙（words.json(当前词库)，已在游戏中）、太空（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：星星 / 星空 / 繁星 / 群星

- 建议：review-one-or-both
- 原因：满天星斗画面一致。
- 成员：星星（words.json(当前词库)，已在游戏中）、星空（2char-prefilter，KEEP_CANDIDATE）、繁星（2char-prefilter，REVIEW）、群星（2char-prefilter，REVIEW）

## granularity：白云 / 乌云 / 云彩

- 建议：review-one-or-both
- 原因：云的三种表达，乌云有明暗对比尚可区分，云彩与白云重合。
- 成员：白云（words.json(当前词库)，已在游戏中）、乌云（2char-prefilter，KEEP_CANDIDATE）、云彩（2char-prefilter，REVIEW）

## granularity：天空 / 蓝天

- 建议：review-one-or-both
- 原因：晴空画面相同。
- 成员：天空（words.json(当前词库)，已在游戏中）、蓝天（2char-prefilter，REVIEW）

## same-drawing：春天 / 春光 / 春日

- 建议：review-one-or-both
- 原因：春日花开画面相同。
- 成员：春天（words.json(当前词库)，已在游戏中）、春光（2char-prefilter，REVIEW）、春日（2char-prefilter，REVIEW）

## same-drawing：夏天 / 炎夏 / 炎热 / 酷暑

- 建议：review-one-or-both
- 原因：烈日场景家族重合。
- 成员：夏天（words.json(当前词库)，已在游戏中）、炎夏（2char-prefilter，REVIEW）、炎热（2char-prefilter，REVIEW）、酷暑（2char-prefilter，REVIEW）

## same-drawing：冬天 / 严寒

- 建议：review-one-or-both
- 原因：冰雪场景重合。
- 成员：冬天（words.json(当前词库)，已在游戏中）、严寒（2char-prefilter，REVIEW）

## same-drawing：夜晚 / 黑夜 / 深夜

- 建议：review-one-or-both
- 原因：夜景画面一致，仅程度不同。
- 成员：夜晚（2char-prefilter，REVIEW）、黑夜（2char-prefilter，REVIEW）、深夜（2char-prefilter，REVIEW）

## same-drawing：黄昏 / 黎明

- 建议：review-one-or-both
- 原因：天际霞光方向难以画分。
- 成员：黄昏（2char-prefilter，REVIEW）、黎明（2char-prefilter，REVIEW）

## same-drawing：早晨 / 清晨 / 晌午

- 建议：review-one-or-both
- 原因：日升时段画面相近。
- 成员：早晨（2char-prefilter，REVIEW）、清晨（2char-prefilter，REVIEW）、晌午（2char-prefilter，REVIEW）

## granularity：太阳 / 阳光 / 光芒

- 建议：review-one-or-both
- 原因：发光太阳画面重合。
- 成员：太阳（words.json(当前词库)，已在游戏中）、阳光（words.json(当前词库)，已在游戏中）、光芒（2char-prefilter，REVIEW）

## granularity：月亮 / 满月

- 建议：review-one-or-both
- 原因：圆月画面相同。
- 成员：月亮（words.json(当前词库)，已在游戏中）、满月（2char-prefilter，REVIEW）

## granularity：房子 / 住宅 / 宅院 / 茅屋 / 院墙

- 建议：review-one-or-both
- 原因：房屋居所家族，画面以『一座房』为主。
- 成员：房子（words.json(当前词库)，已在游戏中）、住宅（2char-prefilter，REVIEW）、宅院（2char-prefilter，REVIEW）、茅屋（2char-prefilter，REVIEW）、院墙（2char-prefilter，REVIEW）

## granularity：草地 / 草坪 / 草丛

- 建议：review-one-or-both
- 原因：草地质画面重合。
- 成员：草地（words.json(当前词库)，已在游戏中）、草坪（2char-prefilter，REVIEW）、草丛（2char-prefilter，REVIEW）

## same-drawing：沙滩 / 河滩 / 海滨

- 建议：review-one-or-both
- 原因：水岸沙地画面相同。
- 成员：沙滩（words.json(当前词库)，已在游戏中）、河滩（2char-prefilter，REVIEW）、海滨（2char-prefilter，REVIEW）

## granularity：花朵 / 花瓣 / 鲜花 / 野花 / 花丛 / 盛开

- 建议：review-one-or-both
- 原因：花的泛称家族，建议以具体花种为主。
- 成员：花朵（words.json(当前词库)，已在游戏中）、花瓣（words.json(当前词库)，已在游戏中）、鲜花（2char-prefilter，REVIEW）、野花（2char-prefilter，REVIEW）、花丛（2char-prefilter，REVIEW）、盛开（2char-prefilter，REVIEW）

## granularity：床 / 床铺

- 建议：review-one-or-both
- 原因：床铺画面与床重合。
- 成员：床（words.json(当前词库)，已在游戏中）、床铺（2char-prefilter，REVIEW）

## granularity：椅子 / 板凳 / 座位

- 建议：review-one-or-both
- 原因：坐具家族画面重合。
- 成员：椅子（words.json(当前词库)，已在游戏中）、板凳（2char-prefilter，REVIEW）、座位（2char-prefilter，REVIEW）

## granularity：书包 / 背包

- 建议：review-one-or-both
- 原因：双肩包画面重合。
- 成员：书包（words.json(当前词库)，已在游戏中）、背包（2char-prefilter，REVIEW）

## granularity：台阶 / 梯子 / 楼梯

- 建议：review-one-or-both
- 原因：台阶踏步画面重合。
- 成员：台阶（words.json(当前词库)，已在游戏中）、梯子（words.json(当前词库)，已在游戏中）、楼梯（2char-prefilter，REVIEW）

## granularity：马路 / 公路 / 道路 / 街道

- 建议：review-one-or-both
- 原因：道路家族，画面均为一条路。
- 成员：马路（words.json(当前词库)，已在游戏中）、公路（words.json(当前词库)，已在游戏中）、道路（2char-prefilter，REVIEW）、街道（2char-prefilter，REVIEW）

## phrase-variant：唱歌 / 歌唱 / 歌声

- 建议：review-one-or-both
- 原因：引吭高歌画面相同。
- 成员：唱歌（words.json(当前词库)，已在游戏中）、歌唱（2char-prefilter，REVIEW）、歌声（2char-prefilter，REVIEW）

## phrase-variant：跳舞 / 舞蹈

- 建议：review-one-or-both
- 原因：翩翩起舞画面相同。
- 成员：跳舞（words.json(当前词库)，已在游戏中）、舞蹈（2char-prefilter，REVIEW）

## same-drawing：吃饭 / 晚饭 / 饭菜 / 美食 / 美餐

- 建议：review-one-or-both
- 原因：满桌饭菜画面相同。
- 成员：吃饭（words.json(当前词库)，已在游戏中）、晚饭（2char-prefilter，REVIEW）、饭菜（2char-prefilter，REVIEW）、美食（2char-prefilter，KEEP_CANDIDATE）、美餐（2char-prefilter，REVIEW）

## same-drawing：睡觉 / 沉睡 / 苏醒 / 醒来

- 建议：review-one-or-both
- 原因：睡眠家族画面重合。
- 成员：睡觉（words.json(当前词库)，已在游戏中）、沉睡（2char-prefilter，REVIEW）、苏醒（2char-prefilter，REVIEW）、醒来（2char-prefilter，REVIEW）

## same-drawing：拍手 / 掌声

- 建议：review-one-or-both
- 原因：鼓掌画面相同。
- 成员：拍手（words.json(当前词库)，已在游戏中）、掌声（2char-prefilter，REVIEW）

## same-drawing：拥抱 / 依偎 / 亲密

- 建议：review-one-or-both
- 原因：相依相拥画面相同。
- 成员：拥抱（words.json(当前词库)，已在游戏中）、依偎（2char-prefilter，REVIEW）、亲密（2char-prefilter，REVIEW）

## same-drawing：哭泣 / 眼泪 / 泪水

- 建议：review-one-or-both
- 原因：落泪画面相同。
- 成员：哭泣（words.json(当前词库)，已在游戏中）、眼泪（2char-prefilter，REVIEW）、泪水（2char-prefilter，REVIEW）

## same-drawing：笑容 / 笑脸 / 微笑 / 含笑 / 笑呵呵 / 笑嘻嘻

- 建议：review-one-or-both
- 原因：笑的表情家族，画面高度重合。
- 成员：笑容（words.json(当前词库)，已在游戏中）、笑脸（words.json(当前词库)，已在游戏中）、微笑（2char-prefilter，REVIEW）、含笑（2char-prefilter，REVIEW）、笑呵呵（3char-curation，MAYBE）、笑嘻嘻（3char-curation，MAYBE）

## same-drawing：画画 / 图画 / 画册

- 建议：review-one-or-both
- 原因：绘画场景重合。
- 成员：画画（words.json(当前词库)，已在游戏中）、图画（2char-prefilter，REVIEW）、画册（2char-prefilter，REVIEW）

## same-drawing：看书 / 读书 / 学习 / 功课

- 建议：review-one-or-both
- 原因：伏案读书画面相同。
- 成员：看书（words.json(当前词库)，已在游戏中）、读书（words.json(当前词库)，已在游戏中）、学习（2char-prefilter，REVIEW）、功课（2char-prefilter，REVIEW）

## same-drawing：弹琴 / 演奏 / 琴键

- 建议：review-one-or-both
- 原因：演奏乐器画面重合。
- 成员：弹琴（words.json(当前词库)，已在游戏中）、演奏（2char-prefilter，REVIEW）、琴键（2char-prefilter，REVIEW）

## same-drawing：跑步 / 赛跑 / 锻炼

- 建议：review-one-or-both
- 原因：奔跑锻炼画面相同。
- 成员：跑步（words.json(当前词库)，已在游戏中）、赛跑（2char-prefilter，REVIEW）、锻炼（2char-prefilter，REVIEW）

## same-drawing：扫地 / 整理 / 整洁 / 清洁

- 建议：review-one-or-both
- 原因：打扫收纳画面重合。
- 成员：扫地（words.json(当前词库)，已在游戏中）、整理（2char-prefilter，REVIEW）、整洁（2char-prefilter，REVIEW）、清洁（2char-prefilter，REVIEW）

## same-drawing：拍照 / 摄影 / 拍摄

- 建议：review-one-or-both
- 原因：举相机取景画面相同。
- 成员：拍照（words.json(当前词库)，已在游戏中）、摄影（words.json(当前词库)，已在游戏中）、拍摄（2char-prefilter，REVIEW）

## same-drawing：观察 / 审视 / 观赏 / 欣赏

- 建议：review-one-or-both
- 原因：驻足观看画面重合。
- 成员：观察（words.json(当前词库)，已在游戏中）、审视（2char-prefilter，REVIEW）、观赏（2char-prefilter，REVIEW）、欣赏（2char-prefilter，REVIEW）

## same-drawing：钓鱼 / 钓竿

- 建议：review-one-or-both
- 原因：垂钓画面相同。
- 成员：钓鱼（words.json(当前词库)，已在游戏中）、钓竿（2char-prefilter，REVIEW）

## same-drawing：收割 / 收成 / 丰收

- 建议：review-one-or-both
- 原因：秋收场景重合。
- 成员：收割（words.json(当前词库)，已在游戏中）、收成（2char-prefilter，REVIEW）、丰收（2char-prefilter，REVIEW）

## same-drawing：种树 / 植树 / 树苗

- 建议：review-one-or-both
- 原因：植苗栽树画面相同。
- 成员：种树（words.json(当前词库)，已在游戏中）、植树（2char-prefilter，REVIEW）、树苗（2char-prefilter，REVIEW）

## same-drawing：山洞 / 洞穴 / 窟窿

- 建议：review-one-or-both
- 原因：洞穴黑影画面重合。
- 成员：山洞（words.json(当前词库)，已在游戏中）、洞穴（2char-prefilter，REVIEW）、窟窿（2char-prefilter，REVIEW）

## same-drawing：荒漠 / 荒野 / 荒凉

- 建议：review-one-or-both
- 原因：荒芜场景重合。
- 成员：荒漠（words.json(当前词库)，已在游戏中）、荒野（2char-prefilter，REVIEW）、荒凉（2char-prefilter，REVIEW）

## granularity：小河 / 河水 / 河流

- 建议：review-one-or-both
- 原因：河流画面相同。
- 成员：小河（words.json(当前词库)，已在游戏中）、河水（2char-prefilter，REVIEW）、河流（2char-prefilter，REVIEW）

## same-drawing：救援 / 救命

- 建议：review-one-or-both
- 原因：呼救施救画面重合。
- 成员：救援（words.json(当前词库)，已在游戏中）、救命（2char-prefilter，REVIEW）

## granularity：温度计 / 摄氏度

- 建议：review-one-or-both
- 原因：画温度计只能猜温度计，单位无法表达。
- 成员：温度计（words.json(当前词库)，已在游戏中）、摄氏度（3char-curation，REJECT）

## same-drawing：烛台 / 蜡烛 / 烛光

- 建议：review-one-or-both
- 原因：烛火画面重合。
- 成员：烛台（words.json(当前词库)，已在游戏中）、蜡烛（2char-prefilter，KEEP_CANDIDATE）、烛光（2char-prefilter，REVIEW）

## same-drawing：灯笼 / 花灯

- 建议：review-one-or-both
- 原因：节庆花灯画面相同。
- 成员：灯笼（words.json(当前词库)，已在游戏中）、花灯（2char-prefilter，REVIEW）

## same-drawing：医生看病 / 治疗 / 养病

- 建议：review-one-or-both
- 原因：诊疗画面重合。
- 成员：医生看病（words.json(当前词库)，已在游戏中）、治疗（2char-prefilter，REVIEW）、养病（2char-prefilter，REVIEW）

## same-drawing：老师讲课 / 讲座 / 讲桌

- 建议：review-one-or-both
- 原因：讲授课场景重合。
- 成员：老师讲课（words.json(当前词库)，已在游戏中）、讲座（2char-prefilter，REVIEW）、讲桌（2char-prefilter，REVIEW）

## phrase-variant：旅行 / 周游 / 漫游

- 建议：review-one-or-both
- 原因：远游画面相同。
- 成员：旅行（words.json(当前词库)，已在游戏中）、周游（2char-prefilter，REVIEW）、漫游（2char-prefilter，REVIEW）

## same-drawing：采访 / 访问

- 建议：review-one-or-both
- 原因：采访问答画面重合。
- 成员：采访（words.json(当前词库)，已在游戏中）、访问（2char-prefilter，REVIEW）

## same-drawing：演员 / 表演

- 建议：review-one-or-both
- 原因：登台表演画面重合。
- 成员：演员（words.json(当前词库)，已在游戏中）、表演（2char-prefilter，REVIEW）

## same-drawing：爷爷 / 伯伯 / 叔叔 / 舅父 / 姑父 / 外祖父

- 建议：review-one-or-both
- 原因：男性长辈亲属称谓，画面无法区分到具体称呼。
- 成员：爷爷（words.json(当前词库)，已在游戏中）、伯伯（2char-prefilter，REVIEW）、叔叔（2char-prefilter，REVIEW）、舅父（2char-prefilter，REVIEW）、姑父（2char-prefilter，REVIEW）、外祖父（3char-curation，MAYBE）

## same-drawing：妈妈 / 母亲

- 建议：review-one-or-both
- 原因：母子画面相同，保留口语词即可。
- 成员：妈妈（words.json(当前词库)，已在游戏中）、母亲（2char-prefilter，REVIEW）

## same-drawing：爸爸 / 父亲

- 建议：review-one-or-both
- 原因：父子画面相同。
- 成员：爸爸（words.json(当前词库)，已在游戏中）、父亲（2char-prefilter，REVIEW）

## same-drawing：婴儿 / 幼儿

- 建议：review-one-or-both
- 原因：婴幼画面重合。
- 成员：婴儿（2char-prefilter，KEEP_CANDIDATE）、幼儿（2char-prefilter，REVIEW）

## same-drawing：新娘 / 结婚 / 妻子 / 媳妇

- 建议：review-one-or-both
- 原因：婚礼场景家族，画面高度重合。
- 成员：新娘（2char-prefilter，KEEP_CANDIDATE）、结婚（2char-prefilter，KEEP_CANDIDATE）、妻子（2char-prefilter，REVIEW）、媳妇（2char-prefilter，REVIEW）

## granularity：毛毛虫 / 毛虫

- 建议：review-one-or-both
- 原因：毛虫画面相同，保留叠词更口语。
- 成员：毛毛虫（words.json(当前词库)，已在游戏中）、毛虫（2char-prefilter，REVIEW）

## granularity：小鱼 / 鲫鱼

- 建议：review-one-or-both
- 原因：画鲫鱼只能猜鱼。
- 成员：小鱼（words.json(当前词库)，已在游戏中）、鲫鱼（2char-prefilter，REVIEW）

## granularity：老虎 / 狮子 / 猛兽

- 建议：review-one-or-both
- 原因：猛兽为上位词，画出来必然是具体猛兽。
- 成员：老虎（words.json(当前词库)，已在游戏中）、狮子（words.json(当前词库)，已在游戏中）、猛兽（2char-prefilter，REVIEW）

## granularity：虫子 / 昆虫

- 建议：review-one-or-both
- 原因：昆虫上位词，画面必然落到具体虫。
- 成员：虫子（words.json(当前词库)，已在游戏中）、昆虫（2char-prefilter，REVIEW）

## same-drawing：麦田 / 麦穗 / 麦浪 / 麦子

- 建议：review-one-or-both
- 原因：麦作画面重合。
- 成员：麦田（words.json(当前词库)，已在游戏中）、麦穗（words.json(当前词库)，已在游戏中）、麦浪（words.json(当前词库)，已在游戏中）、麦子（2char-prefilter，REVIEW）

## same-drawing：稻谷 / 粮食 / 谷粒

- 建议：review-one-or-both
- 原因：谷物画面重合。
- 成员：稻谷（words.json(当前词库)，已在游戏中）、粮食（2char-prefilter，REVIEW）、谷粒（2char-prefilter，REVIEW）

## same-drawing：白菜 / 萝卜 / 蔬菜

- 建议：review-one-or-both
- 原因：蔬菜上位词与具体菜并存，画面多为具体菜。
- 成员：白菜（words.json(当前词库)，已在游戏中）、萝卜（words.json(当前词库)，已在游戏中）、蔬菜（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：果园 / 果树

- 建议：review-one-or-both
- 原因：挂果之树画面重合。
- 成员：果园（words.json(当前词库)，已在游戏中）、果树（2char-prefilter，REVIEW）

## same-drawing：松树 / 雪松 / 松针 / 松脂

- 建议：review-one-or-both
- 原因：松树家族画面重合。
- 成员：松树（words.json(当前词库)，已在游戏中）、雪松（2char-prefilter，REVIEW）、松针（2char-prefilter，REVIEW）、松脂（2char-prefilter，REVIEW）

## same-drawing：芦苇 / 芦花

- 建议：review-one-or-both
- 原因：芦花即芦苇之花，画面重合。
- 成员：芦苇（words.json(当前词库)，已在游戏中）、芦花（2char-prefilter，REVIEW）

## same-drawing：闹钟 / 钟表 / 滴答

- 建议：review-one-or-both
- 原因：钟表滴答画面重合。
- 成员：闹钟（words.json(当前词库)，已在游戏中）、钟表（words.json(当前词库)，已在游戏中）、滴答（2char-prefilter，REVIEW）

## same-drawing：电视 / 广播 / 收音机

- 建议：review-one-or-both
- 原因：影音设备画面相近。
- 成员：电视（words.json(当前词库)，已在游戏中）、广播（2char-prefilter，REVIEW）、收音机（words.json(当前词库)，已在游戏中）

## granularity：指南针 / 方向

- 建议：review-one-or-both
- 原因：方向箭头与指南针画面可区分但语义近同。
- 成员：指南针（words.json(当前词库)，已在游戏中）、方向（2char-prefilter，KEEP_CANDIDATE）

## granularity：磁铁 / 磁场

- 建议：review-one-or-both
- 原因：磁场示意必然画磁铁。
- 成员：磁铁（words.json(当前词库)，已在游戏中）、磁场（2char-prefilter，REVIEW）

## same-drawing：帐篷 / 帐子

- 建议：review-one-or-both
- 原因：床帐帐篷画面相近。
- 成员：帐篷（words.json(当前词库)，已在游戏中）、帐子（2char-prefilter，REVIEW）

## granularity：城墙 / 墙壁

- 建议：review-one-or-both
- 原因：砖墙画面重合。
- 成员：城墙（words.json(当前词库)，已在游戏中）、墙壁（2char-prefilter，REVIEW）

## granularity：窗户 / 窗前

- 建议：review-one-or-both
- 原因：窗景画面重合。
- 成员：窗户（words.json(当前词库)，已在游戏中）、窗前（2char-prefilter，REVIEW）

## granularity：门 / 门板

- 建议：review-one-or-both
- 原因：门板画面与门重合。
- 成员：门（words.json(当前词库)，已在游戏中）、门板（2char-prefilter，REVIEW）

## same-drawing：中秋赏月 / 中秋 / 团圆

- 建议：review-one-or-both
- 原因：中秋团圆场景家族重合。
- 成员：中秋赏月（words.json(当前词库)，已在游戏中）、中秋（2char-prefilter，KEEP_CANDIDATE）、团圆（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：春节贴福 / 春节 / 过年

- 建议：review-one-or-both
- 原因：过年场景家族重合。
- 成员：春节贴福（words.json(当前词库)，已在游戏中）、春节（2char-prefilter，KEEP_CANDIDATE）、过年（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：元宵看灯 / 花灯 / 灯笼

- 建议：review-one-or-both
- 原因：灯会场景重合。
- 成员：元宵看灯（words.json(当前词库)，已在游戏中）、花灯（2char-prefilter，REVIEW）、灯笼（words.json(当前词库)，已在游戏中）

## same-drawing：庙会舞狮 / 庙会

- 建议：review-one-or-both
- 原因：庙会场景重合。
- 成员：庙会舞狮（words.json(当前词库)，已在游戏中）、庙会（2char-prefilter，KEEP_CANDIDATE）

## granularity：红色 / 绿色 / 黄色 / 蓝色 / 彩色 / 金黄 / 翠绿 / 墨绿 / 碧绿 / 嫩绿 / 浓绿 / 瓦蓝

- 建议：review-one-or-both
- 原因：色彩家族：深浅色词画面全部落到基础色，新增彩色/金黄等几乎无法区分。
- 成员：红色（words.json(当前词库)，已在游戏中）、绿色（words.json(当前词库)，已在游戏中）、黄色（words.json(当前词库)，已在游戏中）、蓝色（words.json(当前词库)，已在游戏中）、彩色（2char-prefilter，REVIEW）、金黄（2char-prefilter，REVIEW）、翠绿（2char-prefilter，REVIEW）、墨绿（2char-prefilter，REVIEW）、碧绿（2char-prefilter，REVIEW）、嫩绿（2char-prefilter，REVIEW）、浓绿（2char-prefilter，REVIEW）、瓦蓝（2char-prefilter，REVIEW）

## same-drawing：发抖 / 颤抖 / 发颤

- 建议：review-one-or-both
- 原因：哆嗦画面相同。
- 成员：发抖（2char-prefilter，KEEP_CANDIDATE）、颤抖（2char-prefilter，REVIEW）、发颤（2char-prefilter，REVIEW）

## same-drawing：骄傲 / 傲慢 / 高傲 / 自豪

- 建议：review-one-or-both
- 原因：昂首得意表情家族。
- 成员：骄傲（2char-prefilter，REVIEW）、傲慢（2char-prefilter，REVIEW）、高傲（2char-prefilter，REVIEW）、自豪（2char-prefilter，REVIEW）

## same-drawing：使劲 / 用力 / 奋力

- 建议：review-one-or-both
- 原因：用力画面相同。
- 成员：使劲（2char-prefilter，REVIEW）、用力（2char-prefilter，REVIEW）、奋力（2char-prefilter，REVIEW）

## same-drawing：偷偷 / 悄悄 / 轻声

- 建议：review-one-or-both
- 原因：蹑手蹑脚画面相同。
- 成员：偷偷（2char-prefilter，REVIEW）、悄悄（2char-prefilter，REVIEW）、轻声（2char-prefilter，REVIEW）

## same-drawing：回忆 / 记忆

- 建议：review-one-or-both
- 原因：回忆泡泡画面相同。
- 成员：回忆（2char-prefilter，REVIEW）、记忆（2char-prefilter，REVIEW）

## same-drawing：朦胧 / 模糊 / 迷蒙

- 建议：review-one-or-both
- 原因：模糊视觉效果相同。
- 成员：朦胧（2char-prefilter，REVIEW）、模糊（2char-prefilter，REVIEW）、迷蒙（2char-prefilter，REVIEW）

## same-drawing：灰尘 / 尘土

- 建议：review-one-or-both
- 原因：扬尘画面相同。
- 成员：灰尘（2char-prefilter，REVIEW）、尘土（2char-prefilter，REVIEW）

## same-drawing：微风 / 轻风

- 建议：review-one-or-both
- 原因：微风拂叶画面相同。
- 成员：微风（2char-prefilter，REVIEW）、轻风（2char-prefilter，REVIEW）

## same-drawing：盼望 / 期待 / 希望

- 建议：review-one-or-both
- 原因：盼望神情画面相同。
- 成员：盼望（2char-prefilter，REVIEW）、期待（2char-prefilter，REVIEW）、希望（2char-prefilter，REVIEW）

## same-drawing：喜悦 / 愉快 / 快活

- 建议：review-one-or-both
- 原因：开心情绪画面相同。
- 成员：喜悦（2char-prefilter，REVIEW）、愉快（2char-prefilter，REVIEW）、快活（2char-prefilter，REVIEW）

## same-drawing：忧伤 / 悲痛 / 沮丧

- 建议：review-one-or-both
- 原因：悲伤情绪画面相同。
- 成员：忧伤（2char-prefilter，REVIEW）、悲痛（2char-prefilter，REVIEW）、沮丧（2char-prefilter，REVIEW）

## same-drawing：害怕 / 恐惧 / 惊慌 / 惊惶

- 建议：review-one-or-both
- 原因：惊恐表情家族。
- 成员：害怕（2char-prefilter，REVIEW）、恐惧（2char-prefilter，REVIEW）、惊慌（2char-prefilter，REVIEW）、惊惶（2char-prefilter，REVIEW）

## same-drawing：淘气 / 顽皮

- 建议：review-one-or-both
- 原因：调皮捣蛋画面相同。
- 成员：淘气（2char-prefilter，REVIEW）、顽皮（2char-prefilter，REVIEW）

## same-drawing：胆小 / 胆怯 / 懦弱

- 建议：review-one-or-both
- 原因：畏缩画面相同。
- 成员：胆小（2char-prefilter，REVIEW）、胆怯（2char-prefilter，REVIEW）、懦弱（2char-prefilter，REVIEW）

## same-drawing：疲倦 / 疲劳 / 筋疲力尽 / 精疲力竭

- 建议：review-one-or-both
- 原因：疲惫画面家族，横跨双字与四字。
- 成员：疲倦（2char-prefilter，REVIEW）、疲劳（2char-prefilter，REVIEW）、筋疲力尽（4char-reviewed，KEEP）、精疲力竭（4char-reviewed，MAYBE）

## same-drawing：遮盖 / 遮掩

- 建议：review-one-or-both
- 原因：遮蔽画面相同。
- 成员：遮盖（2char-prefilter，REVIEW）、遮掩（2char-prefilter，REVIEW）

## same-drawing：聚集 / 聚拢 / 汇集

- 建议：review-one-or-both
- 原因：聚拢画面相同。
- 成员：聚集（2char-prefilter，REVIEW）、聚拢（2char-prefilter，REVIEW）、汇集（2char-prefilter，REVIEW）

## same-drawing：轮流 / 轮换

- 建议：review-one-or-both
- 原因：轮替画面相同。
- 成员：轮流（2char-prefilter，REVIEW）、轮换（2char-prefilter，REVIEW）

## same-drawing：迷路 / 迷失

- 建议：review-one-or-both
- 原因：迷途画面相同。
- 成员：迷路（2char-prefilter，KEEP_CANDIDATE）、迷失（2char-prefilter，REVIEW）

## same-drawing：舒服 / 舒适

- 建议：review-one-or-both
- 原因：惬意瘫坐画面相同。
- 成员：舒服（2char-prefilter，REVIEW）、舒适（2char-prefilter，REVIEW）

## same-drawing：打猎 / 猎人

- 建议：review-one-or-both
- 原因：持械狩猎画面相同，一个是动作一个是人物。
- 成员：打猎（2char-prefilter，KEEP_CANDIDATE）、猎人（2char-prefilter，KEEP_CANDIDATE）

## same-drawing：欢迎 / 迎接

- 建议：review-one-or-both
- 原因：迎宾画面相同。
- 成员：欢迎（2char-prefilter，KEEP_CANDIDATE）、迎接（2char-prefilter，REVIEW）
