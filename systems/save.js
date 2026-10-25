/* ============================================================
   systems/save.js —— 字符串存档（全量深度版）
   ============================================================ */

// ============================================================
//   收集存档数据
// ============================================================
function collectSaveData() {
  // 1. 深度拷贝整个 state
  const stateCopy = JSON.parse(JSON.stringify(state));
  
  // 2. 移除不需要保存的动态数据（客人每次读档时重新生成）
  delete stateCopy.customers;
  delete stateCopy.night;  // ★ 夜间经营只在当前会话内有效

  // 3. 角色状态
  const charsData = characters.map(c => ({
    id: c.id,
    energy: c.current.energy,
    affinity: c.current.affinity,
    task: c.current.task,
    workShop: c.current.workShop,
    talkedThisWeek: c.current.talkedThisWeek,
    skills: [...c.skills],
    traits: { ...c.traits }, 
    positionBonus: { ...c.positionBonus }
  }));

  // 4. 普通商店数据
  const shopsData = SHOPS.map(s => ({
    id: s.id,
    workCount: s.workCount,
    affinity: s.affinity
  }));

  // 5. 极道商店数据（如果有）
  let mafiaShopsData = [];
  if (typeof MAFIA_SHOPS !== 'undefined') {
    mafiaShopsData = MAFIA_SHOPS.map(s => ({
      id: s.id,
      workCount: s.workCount,
      affinity: s.affinity
    }));
  }

  return {
    version: 2,
    timestamp: Date.now(),
    state: stateCopy,
    characters: charsData,
    shops: shopsData,
    mafiaShops: mafiaShopsData,
    mafiaQuests: (typeof MAFIA_QUESTS !== 'undefined')
      ? MAFIA_QUESTS.map(q => ({
          id: q.id,
          current: q.current || 0,
          liveDone: q.liveDone || false,
        }))
      : [],
  };
}

// ============================================================
//   应用存档数据
// ============================================================
function applySaveData(data) {
  if (!data || !data.state) return false;

  // 1. 恢复 state
  Object.keys(data.state).forEach(k => {
    state[k] = data.state[k];
  });

  // 确保某些数组/对象有默认值，防止老存档报错
  state.microLoans = state.microLoans || [];
  state.betting = state.betting || [];
  state.seenAffinityStories = state.seenAffinityStories || [];
  state.learnedRecipes = state.learnedRecipes || [];
  state.unlockedPremium = state.unlockedPremium || [];
  state.stationUpgrades = state.stationUpgrades || { kitchen: 0, wash: 0, front: 0 };
  state.unlockedMafiaRecipes = state.unlockedMafiaRecipes || [];  // ★ 老存档兼容
  state.mafiaCharWorkCount = state.mafiaCharWorkCount || {};  // ★ 老存档兼容
  state.night = null;  // ★ 读档重置夜间经营（懒初始化）
  state.endlessMode = state.endlessMode || false;

  // 2. 恢复角色状态
  if (data.characters) {
    data.characters.forEach(sc => {
      const c = characters.find(x => x.id === sc.id);
      if (!c) return;
      c.current.energy = sc.energy;
      c.current.affinity = sc.affinity;
      c.current.task = sc.task;
      c.current.workShop = sc.workShop;
      c.current.talkedThisWeek = sc.talkedThisWeek;
      if (sc.skills) c.skills = [...sc.skills];
      if (sc.traits) c.traits = { ...sc.traits };
      if (sc.positionBonus) c.positionBonus = { ...sc.positionBonus };
    });
  }

  // 3. 恢复普通商店状态
  if (data.shops) {
    data.shops.forEach(ss => {
      const s = SHOPS.find(x => x.id === ss.id);
      if (!s) return;
      s.workCount = ss.workCount;
      s.affinity = ss.affinity;
    });
  }

  // 4. 恢复极道商店状态
  if (data.mafiaShops && typeof MAFIA_SHOPS !== 'undefined') {
    data.mafiaShops.forEach(ss => {
      const s = MAFIA_SHOPS.find(x => x.id === ss.id);
      if (!s) return;
      s.workCount = ss.workCount;
      s.affinity = ss.affinity;
    });
  }

  // 4.5. 恢复极道任务进度
  if (data.mafiaQuests && typeof MAFIA_QUESTS !== 'undefined') {
    data.mafiaQuests.forEach(sq => {
      const q = MAFIA_QUESTS.find(x => x.id === sq.id);
      if (!q) return;
      q.current = sq.current;
      if (sq.liveDone !== undefined) q.liveDone = sq.liveDone;
    });
  }

  // 5. 刷新 UI 和主题
  if (typeof updateWorkPositions === 'function') updateWorkPositions();
  if (typeof initHomePositions === 'function') initHomePositions();

  // 恢复极道 UI 主题
  const appEl = document.getElementById('app');
  if (state.isMafia) {
    appEl.classList.add('theme-mafia');
  } else {
    appEl.classList.remove('theme-mafia');
  }

  // 重新生成场景客人
  state.customers = [];
  if (typeof spawnNormalCustomer === 'function') {
    spawnNormalCustomer();
    spawnNormalCustomer();
  }
  if (typeof generateSpecialCustomers === 'function') {
    generateSpecialCustomers();
  }

  return true;
}

// ============================================================
//   导出 / 导入字符串
// ============================================================
function exportSaveString() {
  try {
    const data = collectSaveData();
    const json = JSON.stringify(data);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64;
  } catch (e) {
    console.error('导出失败:', e);
    return '';
  }
}

function importSaveString(str) {
  try {
    if (!str || typeof str !== 'string') return false;
    const cleaned = str.replace(/\s+/g, '');
    const json = decodeURIComponent(escape(atob(cleaned)));
    const data = JSON.parse(json);
    
    // 简单的版本校验（如果是旧版存档可能会出问题）
    if (data.version !== 2) {
      console.warn('正在导入旧版存档，部分新增内容可能丢失。');
    }
    
    return applySaveData(data);
  } catch (e) {
    console.error('导入失败:', e);
    return false;
  }
}