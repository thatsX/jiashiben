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
  lastWeekSpecials: [],   // 上周来过的特殊客人 id

  // 心玖家务消耗（好感 80 时从 5 降到 2）
  houseworkCost: 5,
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