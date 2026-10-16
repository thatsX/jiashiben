/* ============================================================
   systems/save.js —— 字符串存档（无本地存储）
   ============================================================ */

// ============================================================
//   收集 / 应用 存档数据
// ============================================================
function collectSaveData() {
  const stateCopy = { ...state };
  delete stateCopy.customers;

  return {
    version: 1,
    timestamp: Date.now(),
    state: stateCopy,
    characters: characters.map(c => ({
      id: c.id,
      energy: c.current.energy,
      affinity: c.current.affinity,
      task: c.current.task,
      workShop: c.current.workShop,
      talkedThisWeek: c.current.talkedThisWeek,
    })),
    shops: SHOPS.map(s => ({
      id: s.id,
      workCount: s.workCount,
      affinity: s.affinity,
    })),
  };
}

function applySaveData(data) {
  if (!data || !data.state) return false;

  Object.keys(data.state).forEach(k => {
    state[k] = data.state[k];
  });

  if (data.characters) {
    data.characters.forEach(sc => {
      const c = characters.find(x => x.id === sc.id);
      if (!c) return;
      c.current.energy = sc.energy;
      c.current.affinity = sc.affinity;
      c.current.task = sc.task;
      c.current.workShop = sc.workShop;
      c.current.talkedThisWeek = sc.talkedThisWeek;
    });
  }

  if (data.shops) {
    data.shops.forEach(ss => {
      const s = SHOPS.find(x => x.id === ss.id);
      if (!s) return;
      s.workCount = ss.workCount;
      s.affinity = ss.affinity;
    });
  }

  if (typeof updateWorkPositions === 'function') updateWorkPositions();
  if (typeof initHomePositions === 'function') initHomePositions();

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
//   字符串导出 / 导入
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
    return applySaveData(data);
  } catch (e) {
    console.error('导入失败:', e);
    return false;
  }
}