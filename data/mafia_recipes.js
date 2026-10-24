/* ============================================================
   data/mafia_recipes.js —— 夜间经营配表（数值先随便填，测试用）
   ============================================================ */

// ============================================================
//   1. 黑道菜谱
//   attribute 最多两种：front / kitchen / wash / buy
//   unlock = { shopId, count }（无 unlock = 预设，直接可用）
// ============================================================
const MAFIA_RECIPES = [
  // ---- 须贺蕾叶（全属性，中庸倍率） ----
  { id: 'mf_leye_bar_1',      name: '关东煮',     owner: 'leye',    attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_leye_bar_2',      name: '卤肉饭',     owner: 'leye',    attribute: ['front'],             source: 'bar',    poolId: 'bar_front',      unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_leye_casino_1',   name: '三文鱼寿司', owner: 'leye',    attribute: ['front'],             source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_leye_casino_2',   name: '紫菜饭团',   owner: 'leye',    attribute: ['buy'],               source: 'casino', poolId: 'casino_buy',     unlock: { shopId: 'casino', count: 3 } },

  // ---- 马桥心玖（后厨/洗碗为主，精力效率高） ----
  { id: 'mf_kokono_bar_1',    name: '味噌汤',     owner: 'kokono',  attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_kokono_bar_2',    name: '凉拌黄瓜',   owner: 'kokono',  attribute: ['wash'],              source: 'bar',    poolId: 'bar_wash',       unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_kokono_casino_1', name: '蛋炒饭',     owner: 'kokono',  attribute: ['kitchen', 'wash'],   source: 'casino', poolId: 'casino_kitchen', unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_kokono_casino_2', name: '烤串',       owner: 'kokono',  attribute: ['buy'],               source: 'casino', poolId: 'casino_buy',     unlock: { shopId: 'casino', count: 3 } },

  // ---- 矢仓蓬咲（预设，洗碗为主 + 1 道弱属性） ----
  { id: 'mf_housaki_preset_1', name: '腌萝卜',    owner: 'housaki', attribute: ['wash'],              source: 'preset', poolId: 'preset_wash' },
  { id: 'mf_housaki_preset_2', name: '毛豆',      owner: 'housaki', attribute: ['kitchen'],           source: 'preset', poolId: 'preset_kitchen' },

  // ---- 梅里千樱梨（后厨/前台为主，成功率与收入高，惩罚抗性低） ----
  { id: 'mf_chisato_bar_1',    name: '柠檬汽水',  owner: 'chisato', attribute: ['front'],             source: 'bar',    poolId: 'bar_front',      unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_chisato_bar_2',    name: '豚骨拉面',  owner: 'chisato', attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_chisato_casino_1', name: '炸鸡定食',  owner: 'chisato', attribute: ['front'],             source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_chisato_casino_2', name: '咖喱饭',    owner: 'chisato', attribute: ['kitchen', 'front'],  source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 3 } },

  // ---- 四宫宁月：无 ----
];

// ============================================================
//   2. 委托池（每池 4 条）—— 赤裸裸的黑道事务
// ============================================================
const COMMISSION_POOLS = {
  // ---- 酒吧 · 后厨岗：料理事务（收保护费、摆平麻烦、处理欠债的） ----
  bar_kitchen: [
    { title: '东街的店没交钱',   desc: '这个月又拖。去把该拿的拿回来。',           base: { successRate: 0.75, income: 6000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 0    } } },
    { title: '欠债的跑了',       desc: '人躲起来了。找到他，让他明白躲没用。',     base: { successRate: 0.65, income: 8000,  energyCost: 25, failPenalty: { reputationDelta: -5, energyPenalty: 20, moneyPenalty: 500  } } },
    { title: '有人在店里闹事',   desc: '砸了两张桌子。你进去处理。',               base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '不听话的供应商',   desc: '货价坐地起价。去让他重新考虑。',           base: { successRate: 0.60, income: 12000, energyCost: 30, failPenalty: { reputationDelta: -8, energyPenalty: 25, moneyPenalty: 1000 } } },
  ],
  // ---- 酒吧 · 前台岗：接待、谈判、挡人 ----
  bar_front: [
    { title: '对家来谈地盘',     desc: '隔壁堂口的人坐在包厢。去谈，别丢面子。',   base: { successRate: 0.70, income: 7000,  energyCost: 18, failPenalty: { reputationDelta: -4, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '条子来问话',       desc: '两个便衣坐在吧台。别让他们看出什么。',     base: { successRate: 0.55, income: 10000, energyCost: 22, failPenalty: { reputationDelta: -6, energyPenalty: 18, moneyPenalty: 800  } } },
    { title: '有人在门口踩点',   desc: '同一辆车经过三次了。出去问清楚。',         base: { successRate: 0.78, income: 5500,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '来路不明的客人',   desc: '没介绍人，直接要见管事的。你去接待。',     base: { successRate: 0.68, income: 7500,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 300  } } },
  ],
  // ---- 酒吧 · 洗碗岗：善后、清理、封口 ----
  bar_wash: [
    { title: '后巷有人倒了',     desc: '别问是谁。清干净，别留东西。',             base: { successRate: 0.72, income: 6000,  energyCost: 18, failPenalty: { reputationDelta: -4, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '地上有不该有的',   desc: '拖把和漂白水。天亮前弄完。',               base: { successRate: 0.50, income: 14000, energyCost: 25, failPenalty: { reputationDelta: -10, energyPenalty: 25, moneyPenalty: 1500 } } },
    { title: '包厢要恢复原样',   desc: '客人走了，东西也碎了。当没发生过。',       base: { successRate: 0.85, income: 4500,  energyCost: 14, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '有人多嘴了',       desc: '让他把话咽回去。别用太明显的方式。',       base: { successRate: 0.62, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -6, energyPenalty: 20, moneyPenalty: 800  } } },
  ],

  // ---- 赌场 · 后厨岗：稳住赌桌、处理出千、看管贵宾 ----
  casino_kitchen: [
    { title: '通宵的赌桌',       desc: '客人不肯走。送点吃的，稳住他。',           base: { successRate: 0.76, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 0    } } },
    { title: 'VIP 输光了',       desc: '包厢里在砸东西。进去让他冷静。',           base: { successRate: 0.58, income: 15000, energyCost: 28, failPenalty: { reputationDelta: -8, energyPenalty: 25, moneyPenalty: 1200 } } },
    { title: '拿筹码结账',       desc: '有人拿筹码换东西。别让他知道不值钱。',     base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '桌上有人出千',     desc: '手法很脏。让他把赢的吐出来。',             base: { successRate: 0.66, income: 9500,  energyCost: 24, failPenalty: { reputationDelta: -5, energyPenalty: 20, moneyPenalty: 500  } } },
  ],
  // ---- 赌场 · 前台岗：看场、镇场、接待大客户 ----
  casino_front: [
    { title: '生面孔进场',       desc: '没介绍人，直接坐下来。去探探底。',         base: { successRate: 0.70, income: 8000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 400  } } },
    { title: '有人在闹场',       desc: '输不起，掀了桌子。把人带出去。',           base: { successRate: 0.55, income: 12000, energyCost: 25, failPenalty: { reputationDelta: -7, energyPenalty: 22, moneyPenalty: 1000 } } },
    { title: '贵客要走内部通道', desc: '不能让人看见。带路，别多话。',             base: { successRate: 0.82, income: 5500,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '桌上有人不规矩',   desc: '手不干净，眼也不老实。去警告。',           base: { successRate: 0.64, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -5, energyPenalty: 18, moneyPenalty: 600  } } },
  ],
  // ---- 赌场 · 采购岗：接货、走私、黑市交割 ----
  casino_buy: [
    { title: '后巷接货',         desc: '车到了。别让人看见。搬完就走。',           base: { successRate: 0.68, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 300  } } },
    { title: '黑市交割',         desc: '一手钱一手货。对方不一定守规矩。',         base: { successRate: 0.50, income: 14000, energyCost: 28, failPenalty: { reputationDelta: -9, energyPenalty: 25, moneyPenalty: 1500 } } },
    { title: '大批货要过街',     desc: '不能太显眼。分批走，别走大路。',           base: { successRate: 0.85, income: 5000,  energyCost: 16, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '有人指定要的',     desc: '来路不明。别问，送到就行。',               base: { successRate: 0.74, income: 8000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 400  } } },
  ],

  // ---- 蓬咲预设 · 洗碗岗：一个人也能搞定的善后 ----
  preset_wash: [
    { title: '一个人清场',       desc: '没人帮忙。天亮前必须干净。',               base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -3, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '角落里的东西',     desc: '别让任何人看到你碰它。',                   base: { successRate: 0.60, income: 10000, energyCost: 22, failPenalty: { reputationDelta: -7, energyPenalty: 18, moneyPenalty: 800  } } },
    { title: '静默收尾',         desc: '不能有声音。不能有痕迹。',                 base: { successRate: 0.85, income: 4500,  energyCost: 12, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '让话止住',         desc: '有人知道太多了。让他闭嘴。',               base: { successRate: 0.55, income: 12000, energyCost: 25, failPenalty: { reputationDelta: -9, energyPenalty: 22, moneyPenalty: 1000 } } },
  ],
  // ---- 蓬咲预设 · 后厨岗：给帮派的人做吃的、稳住场面 ----
  preset_kitchen: [
    { title: '给小弟们弄点吃的', desc: '一帮人蹲在后巷。别让他们饿着闹事。',       base: { successRate: 0.70, income: 6000,  energyCost: 18, failPenalty: { reputationDelta: -3, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '冷盘稳住人',       desc: '包厢里在等消息。上点东西，拖住。',         base: { successRate: 0.78, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '最后一单',         desc: '打烊前还有人要。做完就收。',               base: { successRate: 0.85, income: 4500,  energyCost: 14, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '有人嫌不够',       desc: '客人不满意。别让他把话说大。',             base: { successRate: 0.60, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -5, energyPenalty: 18, moneyPenalty: 400  } } },
  ],
};

// ============================================================
//   3. 声望（黑道声誉）→ 总委托数
// ============================================================
const COMMISSION_COUNT_TABLE = [
  { minRep: 0,   count: 2 },
  { minRep: 50,  count: 3 },
  { minRep: 100, count: 4 },
  { minRep: 150, count: 5 },
  { minRep: 200, count: 6 },
  { minRep: 300, count: 8 },
];

// ============================================================
//   4. 角色四倍率
// ============================================================
const CHARACTER_MAFIA_MODIFIERS = {
  leye:     { successBonus:  0.00, incomeBonus:  0.00, energyEfficiency:  0.00, penaltyResistance:  0.00 },
  kokono:   { successBonus:  0.05, incomeBonus:  0.00, energyEfficiency:  0.30, penaltyResistance:  0.10 },
  housaki:  { successBonus: -0.05, incomeBonus:  0.10, energyEfficiency:  0.10, penaltyResistance:  0.20 },
  chisato:  { successBonus:  0.10, incomeBonus:  0.15, energyEfficiency: -0.10, penaltyResistance: -0.20 },
  ningetsu: { successBonus:  0.00, incomeBonus:  0.00, energyEfficiency:  0.00, penaltyResistance:  0.00 },
};

// ============================================================
//   5. 失败痕迹 → 后续事件钩子
// ============================================================
const FAIL_TRACE_TABLE = {
  bar_kitchen:    { nextEvent: 'revenge_bar_kitchen',    desc: '有人在打听昨晚做饭的人。' },
  bar_front:      { nextEvent: 'revenge_bar_front',      desc: '有人在追查是谁挡的那一下。' },
  bar_wash:       { nextEvent: 'revenge_bar_wash',       desc: '后巷地面上留下了不该有的味道。' },
  casino_kitchen: { nextEvent: 'revenge_casino_kitchen', desc: '贵宾席里有人不满。' },
  casino_front:   { nextEvent: 'revenge_casino_front',   desc: '赌场的人开始留意你们。' },
  casino_buy:     { nextEvent: 'revenge_casino_buy',     desc: '黑市上有笔账没有结清。' },
  preset_wash:    { nextEvent: 'revenge_preset_wash',    desc: '看起来平静，但不太对劲。' },
  preset_kitchen: { nextEvent: 'revenge_preset_kitchen', desc: '一单普通的委托，却出了问题。' },
};