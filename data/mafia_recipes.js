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
  { id: 'mf_leye_bar_1',      name: '关东煮拼盘', owner: 'leye',    attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_leye_bar_2',      name: '深夜便当',   owner: 'leye',    attribute: ['front'],             source: 'bar',    poolId: 'bar_front',      unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_leye_casino_1',   name: '幸运寿司',   owner: 'leye',    attribute: ['front'],             source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_leye_casino_2',   name: '清账饭团',   owner: 'leye',    attribute: ['buy'],               source: 'casino', poolId: 'casino_buy',     unlock: { shopId: 'casino', count: 3 } },

  // ---- 马桥心玖（后厨/洗碗为主，精力效率高） ----
  { id: 'mf_kokono_bar_1',    name: '深夜味噌',   owner: 'kokono',  attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_kokono_bar_2',    name: '静默洗物',   owner: 'kokono',  attribute: ['wash'],              source: 'bar',    poolId: 'bar_wash',       unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_kokono_casino_1', name: '清账宵夜',   owner: 'kokono',  attribute: ['kitchen', 'wash'],   source: 'casino', poolId: 'casino_kitchen', unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_kokono_casino_2', name: '筹码回收',   owner: 'kokono',  attribute: ['buy'],               source: 'casino', poolId: 'casino_buy',     unlock: { shopId: 'casino', count: 3 } },

  // ---- 矢仓蓬咲（预设，洗碗为主 + 1 道弱属性） ----
  { id: 'mf_housaki_preset_1', name: '阴暗洗碗',  owner: 'housaki', attribute: ['wash'],              source: 'preset', poolId: 'preset_wash' },
  { id: 'mf_housaki_preset_2', name: '角落小菜',  owner: 'housaki', attribute: ['kitchen'],           source: 'preset', poolId: 'preset_kitchen' },

  // ---- 梅里千樱梨（后厨/前台为主，成功率与收入高，惩罚抗性低） ----
  { id: 'mf_chisato_bar_1',    name: '联盟特调', owner: 'chisato', attribute: ['front'],             source: 'bar',    poolId: 'bar_front',      unlock: { shopId: 'bar',    count: 1 } },
  { id: 'mf_chisato_bar_2',    name: '热血拉面', owner: 'chisato', attribute: ['kitchen'],           source: 'bar',    poolId: 'bar_kitchen',    unlock: { shopId: 'bar',    count: 3 } },
  { id: 'mf_chisato_casino_1', name: '荷官套餐', owner: 'chisato', attribute: ['front'],             source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 1 } },
  { id: 'mf_chisato_casino_2', name: '清台大餐', owner: 'chisato', attribute: ['kitchen', 'front'],  source: 'casino', poolId: 'casino_front',   unlock: { shopId: 'casino', count: 3 } },

  // ---- 四宫宁月：无 ----
];

// ============================================================
//   2. 委托池（每池 4 条）
// ============================================================
const COMMISSION_POOLS = {
  bar_kitchen: [
    { title: '深夜食堂', desc: '一伙人指名要吃热食。',           base: { successRate: 0.75, income: 6000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 0    } } },
    { title: '温饱的人心', desc: '让讨债的吃点东西再走。',       base: { successRate: 0.65, income: 8000,  energyCost: 25, failPenalty: { reputationDelta: -5, energyPenalty: 20, moneyPenalty: 500  } } },
    { title: '悄悄开火', desc: '别让街口的人注意。',             base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '通宵营业', desc: '有人要在这里待到天亮。',         base: { successRate: 0.60, income: 12000, energyCost: 30, failPenalty: { reputationDelta: -8, energyPenalty: 25, moneyPenalty: 1000 } } },
  ],
  bar_front: [
    { title: '冷脸迎客', desc: '几个来路不明的客人要你亲自接待。', base: { successRate: 0.70, income: 7000,  energyCost: 18, failPenalty: { reputationDelta: -4, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '挡一回', desc: '把不该进来的人挡在外面。',           base: { successRate: 0.55, income: 10000, energyCost: 22, failPenalty: { reputationDelta: -6, energyPenalty: 18, moneyPenalty: 800  } } },
    { title: '包厢账房', desc: '有一桌要求单间结账。',             base: { successRate: 0.78, income: 5500,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '散场整理', desc: '拖到打烊还赖着不走的人。',         base: { successRate: 0.68, income: 7500,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 300  } } },
  ],
  bar_wash: [
    { title: '无声收拾', desc: '后场有人倒下了，需要处理干净。',   base: { successRate: 0.72, income: 6000,  energyCost: 18, failPenalty: { reputationDelta: -4, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '血迹', desc: '地上有些不该出现的东西。',             base: { successRate: 0.50, income: 14000, energyCost: 25, failPenalty: { reputationDelta: -10, energyPenalty: 25, moneyPenalty: 1500 } } },
    { title: '清点酒杯', desc: '收拾得一干二净，不落痕迹。',       base: { successRate: 0.85, income: 4500,  energyCost: 14, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '漂白', desc: '深夜，一大桶可疑的液体。',             base: { successRate: 0.62, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -6, energyPenalty: 20, moneyPenalty: 800  } } },
  ],
  casino_kitchen: [
    { title: '荷官夜食', desc: '通宵赌桌的宵夜。',                 base: { successRate: 0.76, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 15, moneyPenalty: 0    } } },
    { title: '贵宾席', desc: 'VIP 包厢点名要吃特制。',              base: { successRate: 0.58, income: 15000, energyCost: 28, failPenalty: { reputationDelta: -8, energyPenalty: 25, moneyPenalty: 1200 } } },
    { title: '筹码换饭', desc: '用筹码结账的客人。',                base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '连场供应', desc: '赌局还要继续，饭也不能停。',        base: { successRate: 0.66, income: 9500,  energyCost: 24, failPenalty: { reputationDelta: -5, energyPenalty: 20, moneyPenalty: 500  } } },
  ],
  casino_front: [
    { title: '接客', desc: '生面孔，需要有经验的人稳住。',         base: { successRate: 0.70, income: 8000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 400  } } },
    { title: '看场', desc: '有人在闹事，你去“处理”一下。',         base: { successRate: 0.55, income: 12000, energyCost: 25, failPenalty: { reputationDelta: -7, energyPenalty: 22, moneyPenalty: 1000 } } },
    { title: '引路', desc: '带几位贵客走内部通道。',               base: { successRate: 0.82, income: 5500,  energyCost: 15, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '洗牌', desc: '桌上有位不太规矩的玩家。',             base: { successRate: 0.64, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -5, energyPenalty: 18, moneyPenalty: 600  } } },
  ],
  casino_buy: [
    { title: '后巷采购', desc: '要的东西不好明面买。',             base: { successRate: 0.68, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 300  } } },
    { title: '黑市交割', desc: '一手交钱一手交货。',               base: { successRate: 0.50, income: 14000, energyCost: 28, failPenalty: { reputationDelta: -9, energyPenalty: 25, moneyPenalty: 1500 } } },
    { title: '寻常物资', desc: '大批量进货，别惹眼。',             base: { successRate: 0.85, income: 5000,  energyCost: 16, failPenalty: { reputationDelta: -2, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '一箱红酒', desc: '客人指定要某个年份。',             base: { successRate: 0.74, income: 8000,  energyCost: 20, failPenalty: { reputationDelta: -4, energyPenalty: 15, moneyPenalty: 400  } } },
  ],
  preset_wash: [
    { title: '阴暗清场', desc: '一个人也能搞定的事。',             base: { successRate: 0.80, income: 5000,  energyCost: 15, failPenalty: { reputationDelta: -3, energyPenalty: 10, moneyPenalty: 0    } } },
    { title: '角落处理', desc: '别让任何人看到你。',               base: { successRate: 0.60, income: 10000, energyCost: 22, failPenalty: { reputationDelta: -7, energyPenalty: 18, moneyPenalty: 800  } } },
    { title: '静默打理', desc: '一个人，很安静。',                 base: { successRate: 0.85, income: 4500,  energyCost: 12, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '封口', desc: '有些东西不能流出去。',                 base: { successRate: 0.55, income: 12000, energyCost: 25, failPenalty: { reputationDelta: -9, energyPenalty: 22, moneyPenalty: 1000 } } },
  ],
  preset_kitchen: [
    { title: '角落小菜', desc: '给不挑食的人。',                   base: { successRate: 0.70, income: 6000,  energyCost: 18, failPenalty: { reputationDelta: -3, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '冷盘', desc: '不冒热气，不起眼。',                   base: { successRate: 0.78, income: 7000,  energyCost: 20, failPenalty: { reputationDelta: -3, energyPenalty: 12, moneyPenalty: 0    } } },
    { title: '最后一份', desc: '收摊前的最后一单。',               base: { successRate: 0.85, income: 4500,  energyCost: 14, failPenalty: { reputationDelta: -2, energyPenalty: 8,  moneyPenalty: 0    } } },
    { title: '不合口味', desc: '有人嫌菜不够。',                   base: { successRate: 0.60, income: 9000,  energyCost: 22, failPenalty: { reputationDelta: -5, energyPenalty: 18, moneyPenalty: 400  } } },
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