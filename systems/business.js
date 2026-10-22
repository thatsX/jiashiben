/* ============================================================
   systems/business.js —— 经营计算
   ============================================================ */

function combineRestaurantBonus(mults) {
  if (!mults || mults.length === 0) return 1;
  let sum = 0;
  mults.forEach(m => { sum += (m - 1); });
  return Math.max(0, 1 + sum);
}

function getPositionEnergyMultiplier(taskId) {
  const inPosition = characters.filter(c => c.current.task === taskId);
  if (inPosition.length < 2) return 1;

  if (taskId === 'kitchen' || taskId === 'wash' || taskId === 'front') {
    return 2 / 3;
  }
  if (taskId === 'buy') {
    return 1 / 3;
  }
  return 1;
}

// ============================================================
//   岗位承载力
// ============================================================
function getStationCapacity(stationId) {
  const chars = characters.filter(c =>
    c.current.task === stationId && !isExhausted(c)
  );

  if (chars.length === 0) return 0;

  const base = STATION_CAPACITY[stationId] || 300;
  let total = 0;
  chars.forEach(c => {
    total += base * getEffectivePositionBonus(c, stationId);
  });

  // 设备升级加成
  const upgradeLv = state.stationUpgrades[stationId] || 0;
  total *= (1 + upgradeLv * 0.3);

  return Math.round(total);
}

// ============================================================
//   经营计算
// ============================================================
function calculateBusiness(restaurantOpen) {
  // ============ 未营业 ============
  if (!restaurantOpen) {
    const fixedCost = CONFIG.rent + CONFIG.utility + state.loan * CONFIG.loanRate;

    let purchaseMul;
    if (state.purchaseWeeks >= CONFIG.purchaseGraceWeeks) {
      purchaseMul = 1 + CONFIG.purchasePenalty;
    } else {
      purchaseMul = 1 + state.lastPurchaseMul;
    }
    const familyCost = CONFIG.familyCost * purchaseMul;

    let workIncome = 0;
    characters.forEach(c => {
      if (c.current.task === 'work' && c.current.workShop && !isExhausted(c)) {
      let shop = SHOPS.find(s => s.id === c.current.workShop);
      if (!shop && typeof MAFIA_SHOPS !== 'undefined') {
        shop = MAFIA_SHOPS.find(s => s.id === c.current.workShop);
      }
        if (shop) workIncome += shop.baseWage * getEffectiveWorkMultiplier(c);
      }
    });

    const profit = -fixedCost;
    const cashChange = profit - familyCost + workIncome;

    return {
      traffic: 0, unitPrice: 0, revenue: 0,
      foodCost: 0, fixedCost, familyCost,
      workIncome, profit, cashChange,
      purchaseMul, kitchenMul: 1, washMul: 1, frontMul: 1,
      repCoeff: 1, priceCoeff: 1, menuTrafficCoeff: 1, menuPriceCoeff: 1, musicMul: 1,
      tempTraffic: 0, unitPriceBonus: 0,
      overloadPenalty: 0, overloadedStation: null, overloadRatio: 0,
      capKitchen: 0, capWash: 0, capFront: 0, capBottleneck: 0,
    };
  }

  // ============ 正常营业 ============
  const menuRecipes = state.menu
    .map(id => RECIPES.find(r => r.id === id))
    .filter(Boolean);

  const kitchenChars = characters.filter(c => c.current.task === 'kitchen' && !isExhausted(c));
  const kitchenMul = combineRestaurantBonus(kitchenChars.map(c => getEffectivePositionBonus(c, 'kitchen')));

  const washChars = characters.filter(c => c.current.task === 'wash' && !isExhausted(c));
  const washMul = combineRestaurantBonus(washChars.map(c => getEffectivePositionBonus(c, 'wash')));

  const frontChars = characters.filter(c => c.current.task === 'front' && !isExhausted(c));
  const frontMul = combineRestaurantBonus(frontChars.map(c => getEffectivePositionBonus(c, 'front')));

  const avgPrice = menuRecipes.length > 0
    ? menuRecipes.reduce((s, r) => s + r.price, 0) / menuRecipes.length
    : 0;

  const repCoeff = 1 + (state.reputation - 50) * 0.006;

  const priceCoeff = Math.max(
    CONFIG.priceCoeffMin,
    1 - (avgPrice - CONFIG.priceCoeffBase) * CONFIG.priceCoeffRate
  );

  const menuCount = menuRecipes.length;
  const menuTrafficCoeff = 1 + (menuCount - 1) * CONFIG.menuCountTrafficRate;
  const menuPriceCoeff   = 1 + (menuCount - 1) * CONFIG.menuCountPriceRate;

  const musicMul = getMusicMultiplier();

  const tempTraffic = state.tempTrafficBonus || 0;
  const tempPrice   = state.tempUnitPriceBonus || 0;

  // 季节事件：客流
  let eventTraffic = 0;
  if (state.seasonalEvent && state.seasonalEvent.type === 'traffic') {
    eventTraffic = state.seasonalEvent.value;
  }

  // 客流
  let traffic = CONFIG.baseTraffic;
  traffic *= repCoeff;
  traffic *= washMul;
  traffic *= priceCoeff;
  traffic *= menuTrafficCoeff;
  traffic *= musicMul;
  traffic *= (1 + tempTraffic);
  traffic *= (1 + eventTraffic);

  // ============ 承载力检查（超载扣营收）============
  const capKitchen = getStationCapacity('kitchen');
  const capWash = getStationCapacity('wash');
  const capFront = getStationCapacity('front');

  const capBottleneck = Math.min(capKitchen, capWash, capFront);

  let overloadPenalty = 0;
  let overloadedStation = null;
  let overloadRatio = 0;

  if (capBottleneck > 0 && traffic > capBottleneck) {
    overloadRatio = (traffic - capBottleneck) / capBottleneck;

    if (overloadRatio > 0.5) overloadPenalty = 0.30;
    else if (overloadRatio > 0.2) overloadPenalty = 0.15;
    else overloadPenalty = 0.05;

    if (capKitchen === capBottleneck) overloadedStation = '后厨';
    else if (capWash === capBottleneck) overloadedStation = '洗碗';
    else overloadedStation = '前台';
  }

  // 客单价
  const unitPrice = avgPrice * frontMul * menuPriceCoeff * (1 + tempPrice);

  // 营业额（超载扣减直接作用在营收上）
  const revenue = traffic * unitPrice * (1 - overloadPenalty);

  // 成本率
  const avgCostRate = menuRecipes.length > 0
    ? menuRecipes.reduce((s, r) => s + r.cost, 0)
      / menuRecipes.reduce((s, r) => s + r.price, 0)
    : 0;

  // 采购倍率
  let purchaseMul;
  if (state.purchaseWeeks >= CONFIG.purchaseGraceWeeks) {
    purchaseMul = 1 + CONFIG.purchasePenalty;
  } else {
    purchaseMul = 1 + state.lastPurchaseMul;
  }

  // 季节事件：食材成本
  let eventCost = 0;
  if (state.seasonalEvent && state.seasonalEvent.type === 'cost') {
    eventCost = state.seasonalEvent.value;
  }

  const foodCost = revenue * avgCostRate * purchaseMul * (1 + eventCost);

  const fixedCost = CONFIG.rent + CONFIG.utility + state.loan * CONFIG.loanRate;
  const familyCost = CONFIG.familyCost * purchaseMul;

  let workIncome = 0;
  characters.forEach(c => {
    if (c.current.task === 'work' && c.current.workShop && !isExhausted(c)) {
      // ★ 修改这里：找不到日常商店，就去极道商店找
      let shop = SHOPS.find(s => s.id === c.current.workShop);
      if (!shop && typeof MAFIA_SHOPS !== 'undefined') {
        shop = MAFIA_SHOPS.find(s => s.id === c.current.workShop);
      }
      if (shop) workIncome += shop.baseWage * getEffectiveWorkMultiplier(c);
    }
  });

  const profit = revenue - foodCost - fixedCost;
  const cashChange = profit - familyCost + workIncome;

  return {
    traffic, unitPrice, revenue,
    foodCost, fixedCost, familyCost,
    workIncome, profit, cashChange,
    purchaseMul, kitchenMul, washMul, frontMul,
    repCoeff, priceCoeff, menuTrafficCoeff, menuPriceCoeff, musicMul,
    tempTraffic, unitPriceBonus: tempPrice,
    overloadPenalty, overloadedStation, overloadRatio,
    capKitchen, capWash, capFront, capBottleneck,
  };
}