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

function calculateBusiness(restaurantOpen) {
  // ============ 未营业：只算固定支出 ============
  if (!restaurantOpen) {
    const rentMult = 1 + Math.floor(state.week / CONFIG.rentWeekThreshold) * CONFIG.rentIncreaseRate;
    const baseFixed = CONFIG.rent * rentMult + CONFIG.utility;

    let fixedMul = 1;
    if (state.seasonalEvent && state.seasonalEvent.type === 'fixed') {
      fixedMul += state.seasonalEvent.value;
    }

    const fixedCost = baseFixed * fixedMul + state.loan * CONFIG.loanRate;

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
        const shop = SHOPS.find(s => s.id === c.current.workShop);
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

  // 声誉客流加成（原有公式）
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

  let eventTraffic = 0;
  if (state.seasonalEvent && state.seasonalEvent.type === 'traffic') {
    eventTraffic = state.seasonalEvent.value;
  }

  let traffic = CONFIG.baseTraffic;
  traffic *= repCoeff;
  traffic *= washMul;
  traffic *= priceCoeff;
  traffic *= menuTrafficCoeff;
  traffic *= musicMul;
  traffic *= (1 + tempTraffic);
  traffic *= (1 + eventTraffic);

  const unitPrice = avgPrice * frontMul * menuPriceCoeff * (1 + tempPrice);
  const revenue = traffic * unitPrice;

  const avgCostRate = menuRecipes.length > 0
    ? menuRecipes.reduce((s, r) => s + r.cost, 0)
      / menuRecipes.reduce((s, r) => s + r.price, 0)
    : 0;

  let purchaseMul;
  if (state.purchaseWeeks >= CONFIG.purchaseGraceWeeks) {
    purchaseMul = 1 + CONFIG.purchasePenalty;
  } else {
    purchaseMul = 1 + state.lastPurchaseMul;
  }

  let eventCost = 0;
  if (state.seasonalEvent && state.seasonalEvent.type === 'cost') {
    eventCost = state.seasonalEvent.value;
  }

  const foodCost = revenue * avgCostRate * purchaseMul * (1 + eventCost);

  const rentMult = 1 + Math.floor(state.week / CONFIG.rentWeekThreshold) * CONFIG.rentIncreaseRate;
  const baseFixed = CONFIG.rent * rentMult + CONFIG.utility;

  let fixedMul = 1;
  if (state.seasonalEvent && state.seasonalEvent.type === 'fixed') {
    fixedMul += state.seasonalEvent.value;
  }

  const fixedCost = baseFixed * fixedMul + state.loan * CONFIG.loanRate;
  const familyCost = CONFIG.familyCost * purchaseMul;

  let workIncome = 0;
  characters.forEach(c => {
    if (c.current.task === 'work' && c.current.workShop && !isExhausted(c)) {
      const shop = SHOPS.find(s => s.id === c.current.workShop);
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
    eventTraffic, eventCost, rentMult,
  };
}