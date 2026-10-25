let state = {
  week: 1,
  tutorialDone: false,
  cash: CONFIG.startCash,
  loan: CONFIG.startLoan,
  totalProfit: 0,
  reputation: 50,
  bankruptCount: 0,
  customers: [],
  seenCustomers: [],
  ledger: [],
  menu: [],
  learnedRecipes: [],
  lastTraffic: 0,
  lastProfit: 0,
  purchaseWeeks: 0,
  lastPurchaseMul: 0,
  currentMusic: 'none',

  tempTrafficBonus: 0,
  tempUnitPriceBonus: 0,
  pendingRecipes: [],

  // 好感度剧情
  seenAffinityStories: [],    // ['leye_20', 'kokono_40', ...]
  unlockedMusic: [],          // 通过剧情解锁的音乐 id
  unlockedMafiaRecipes: [],   // ★ 夜间经营：已解锁的黑道菜谱 id（存档持久化）
  mafiaCharWorkCount: {}, 
  lastWeekSpecials: [],   // 上周来过的特殊客人 id

  // 心玖家务消耗（好感 80 时从 5 降到 2）
  houseworkCost: 5,

    // 数值成长
  seasonalEvent: null,           // 本周季节事件
  achievements: [],              // 已达成的成就 id
  totalRepaid: 0,                // 累计还款金额（成就用）
  earlyLoanWeek: null,           // 提前还清贷款的周数（成就用）

  stationUpgrades: {
  kitchen: 0,
  wash: 0,
  front: 0,

  microLoans: [],
  mafiaBribePending: false, // 是否等待警察退还保护费

    // 研发系统
  researchProject: {
    recipeId: null,      // 正在研发的菜谱 id
    progress: 0,         // 当前进度 0-100/150/200
    assignedChar: null,  // 指派的角色 id
  },
  unlockedPremium: [],   // 已解锁的高级菜谱 id 数组

  // 宴席系统
  banquet: null,         // { level, requiredRecipeId, quote, deadlineWeek, prepAssignedChar }

    // 极道系统
  isMafia: false,
  mafiaRep: 0,
  mafiaQuestIdx: 0,
  mafiaEventDone: false,
  mafiaDeadline: 0,       // 当前极道任务的截止周数
  mafiaFailMsg: '',       // 失败原因

  // 地下拳场
  betting: [],            // 押注记录：{ fighterId, amount }
  weeklyBets: 0,          // 本周已押注次数
  liveCooldown: 0,        // 地下Live冷却周数

  endlessMode: false,
  },
};

function createCharacterEntity(data) {
  return {
    id: data.id,
    name: data.name,
    traits: { ...data.traits },
    skills: [...(data.skills || [])],
    positionBonus: { ...data.positionBonus },
    defaultState: { ...data.defaultState },
    current: {
      task: data.defaultState.task,
      visual: data.defaultState.visual,
      energy: data.traits.energyMax,
      affinity: 0,
      position: { x: 50, y: 70 },
      moveTimer: 0,
      workShop: null,
      talkedThisWeek: false,
    },
  };
}

let characters = CHARACTERS.map(createCharacterEntity);