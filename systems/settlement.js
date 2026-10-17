/* ============================================================
   systems/settlement.js —— 每周结算
   ============================================================ */

// ============================================================
//   计算每个人完成当前任务的精力消耗
// ============================================================
function calcAllEnergyCosts() {
  const taskCount = {};
  characters.forEach(c => {
    taskCount[c.current.task] = (taskCount[c.current.task] || 0) + 1;
  });

  return characters.map(c => {
    let cost = 0;
    const task = c.current.task;

    if (task === 'rest') {
      cost = 0;
    } else if (task === 'work') {
      const shop = SHOPS.find(s => s.id === c.current.workShop);
      cost = shop ? shop.energyCost : 25;
    } else {
      const t = TASKS.find(x => x.id === task);
      if (t) {
        const count = taskCount[task] || 1;
        let mult = 1;
        if (count >= 2) {
          if (task === 'kitchen' || task === 'wash' || task === 'front') mult = 2 / 3;
          else if (task === 'buy') mult = 1 / 3;
        }
        cost = t.energyCost * mult;
      }
    }

    cost = Math.round(cost);
    const remaining = Math.round(c.current.energy) - cost;
    const ok = remaining >= 0;

    return { c, cost, remaining, ok, task };
  });
}

function getTaskDisplayName(c) {
  if (c.current.task === 'work') {
    const shop = SHOPS.find(s => s.id === c.current.workShop);
    return shop ? '打工·' + shop.name : '打工';
  }
  const t = TASKS.find(x => x.id === c.current.task);
  return t ? t.name : '无';
}

// ============================================================
//   结算入口：先弹排班确认表
// ============================================================
function settle() {
  openScheduleConfirm();
}

function openScheduleConfirm() {
  const info = calcAllEnergyCosts();
  const allOk = info.every(x => x.ok);

  const rowsHTML = info.map(x => {
    const c = x.c;
    const taskName = getTaskDisplayName(c);
    const tired = isTired(c);
    const tiredTag = tired ? '<span class="tired-tag">疲惫</span>' : '';

    const rowCls = x.ok ? 'confirm-row' : 'confirm-row not-ok';

    return `
      <div class="${rowCls}">
        <div class="confirm-avatar">${avatarHTML(c.id, 'chars', 36)}</div>
        <div class="confirm-info">
          <div><b>${c.name}</b> ${taskName} ${tiredTag}</div>
          <div style="font-size:11px;color:#666">
            精力 ${Math.round(c.current.energy)}/${c.traits.energyMax}
            · 消耗 ${x.cost}
            → 剩余 <b style="color:${x.ok ? '#4caf50' : '#d32f2f'}">${x.remaining}</b>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const warnHTML = !allOk
    ? '<p style="color:#d32f2f;text-align:center;font-weight:bold;margin-top:10px">⚠ 有角色精力不足，无法确认。请返回修改排班。</p>'
    : '';

  showModal(`
    <h3>📋 排班确认</h3>
    <p style="font-size:12px;color:#666;margin-bottom:12px">
      确认本周排班。精力不足的角色无法安排工作。
    </p>
    ${rowsHTML}
    ${warnHTML}
    <button id="schedule-confirm-btn"
            style="width:100%;margin-top:12px"
            ${!allOk ? 'disabled' : ''}
            onclick="confirmAndSettle()">
      ${allOk ? '确认结算' : '精力不足，请返回调整'}
    </button>
    <button style="width:100%;margin-top:8px;background:#e0e0e0" onclick="closeModal()">
      返回修改
    </button>
  `);

  document.getElementById('modal-btn').style.display = 'none';
}

function confirmAndSettle() {
  closeModal();

  const hasFront = characters.some(c => c.current.task === 'front' && !isExhausted(c));
  const hasKitchen = characters.some(c => c.current.task === 'kitchen' && !isExhausted(c));
  const hasWash = characters.some(c => c.current.task === 'wash' && !isExhausted(c));
  const hasMenu = state.menu.length > 0;
  const restaurantOpen = hasFront && hasKitchen && hasWash && hasMenu;

  if (!restaurantOpen) {
    if (state.banquet) {
      const missing = [];
      if (!hasKitchen) missing.push('后厨');
      if (!hasWash) missing.push('洗碗');
      if (!hasFront) missing.push('前台');
      if (!hasMenu) missing.push('菜单选菜');
      
      // 阻止结算，并告诉玩家缺什么
      alert(`⚠ 本周有宴席任务，必须正常营业！\n请去「家庭」页面排班，并在「菜单」选菜。\n当前缺少：${missing.join('、')}`);
      return; // ★ 核心修复：直接返回，不许结算
    } else {
      showConfirm('本周餐馆未营业，要继续结算吗？', () => doSettle(false), () => {});
      return;
    }
  }

  doSettle(restaurantOpen);
}

// ============================================================
//   正式结算
// ============================================================
function doSettle(restaurantOpen) {
  checkAchievements();

  // ============ 处理到期的紧急小额贷 ============
  let microLoanDue = 0;
  let microLoanInfo = '';
  if (state.microLoans && state.microLoans.length > 0) {
    const stillActive = [];
    state.microLoans.forEach(ml => {
      if (state.week >= ml.dueWeek) {
        microLoanDue += ml.repay;
        microLoanInfo += `到期扣除 ${ml.repay} `;
      } else {
        stillActive.push(ml);
      }
    });
    state.microLoans = stillActive;
    if (microLoanDue > 0) state.cash -= microLoanDue;
  }

  // ============ 检查未对话的特殊客人 ============
  const survivingGuests = [];
  state.customers.forEach(c => {
    if (c.type !== 'special' || c.talked) return;
    const def = CUSTOMERS.find(x => x.id === c.id);
    if (def && def.onSurvive) {
      applyCustomerEffect(def.onSurvive.effect);
      survivingGuests.push(def.onSurvive.effectText);
    }
  });

  state.lastWeekSpecials = state.customers.filter(c => c.type === 'special').map(c => c.id);
  state.customers = [];
  const custLayer = document.getElementById('layer-customers');
  if (custLayer) custLayer.innerHTML = '';

  // ============ 采购追踪 ============
  const buyers = characters.filter(c => c.current.task === 'buy' && !isExhausted(c));
  if (buyers.length > 0) {
    state.purchaseWeeks = 0;
    const bestMul = Math.min.apply(null, buyers.map(c => getEffectivePositionBonus(c, 'buy')));
    state.lastPurchaseMul = bestMul;
  } else {
    state.purchaseWeeks++;
  }

  // ============ 宁月打工特殊事件 ============
  let ningetsuExtraMoney = 0;
  let ningetsuWantRecipe = false;
  let ningetsuEventType = null;

  const ningetsu = characters.find(c => c.id === 'ningetsu');
  if (ningetsu && ningetsu.current.task === 'work' && ningetsu.current.workShop && !isExhausted(ningetsu)) {
    if (Math.random() < 0.5) {
      if (Math.random() < 0.5) {
        ningetsuWantRecipe = true;
        ningetsuEventType = 'recipe';
      } else {
        const shop = SHOPS.find(s => s.id === ningetsu.current.workShop);
        if (shop) {
          ningetsuExtraMoney = shop.baseWage * getEffectiveWorkMultiplier(ningetsu);
          ningetsuEventType = 'money';
        }
      }
    }
  }

  // ============ 判定是否为宴席周 ============
  let isBanquetWeek = false;
  if (state.banquet) {
    state.banquet.weeksLeft--;
    if (state.banquet.weeksLeft <= 0) {
      isBanquetWeek = true;
    }
  }

  // ============ 宴席筹备进度推进 ============
  let banquetPrepMsg = '';
  if (state.banquet && !state.banquet.isPrepDone && state.banquet.prepAssignedChar) {
    const prepChar = characters.find(c => c.id === state.banquet.prepAssignedChar);
    if (prepChar && !isExhausted(prepChar)) {
      const rate = typeof getBanquetPrepRate === 'function' ? getBanquetPrepRate(prepChar.id) : 50;
      state.banquet.prepProgress = Math.min(100, state.banquet.prepProgress + rate);
      banquetPrepMsg = `【筹备】${prepChar.name}推进了 ${rate}% 进度（当前 ${state.banquet.prepProgress}%）。`;
      
      if (state.banquet.prepProgress >= 100) {
        state.banquet.isPrepDone = true;
      }
    } else {
      banquetPrepMsg = `【筹备】${prepChar.name}精力不足，本周筹备无进展。`;
    }
  }

  // ============ 计算经营 ============
  let r = calculateBusiness(restaurantOpen);
  
  // 如果是宴席周，覆盖日常营收为 0
  if (isBanquetWeek) {
    r.traffic = 0;
    r.unitPrice = 0;
    r.revenue = 0;
    r.foodCost = 0;
    r.workIncome = 0;
    r.profit = -r.fixedCost;
    r.cashChange = -r.fixedCost - r.familyCost;
    r.overloadRatio = 0;
    r.overloadPenalty = 0;
  } else {
    r.cashChange += ningetsuExtraMoney;
    r.workIncome += ningetsuExtraMoney;
  }
  r.microLoanDue = microLoanDue;

  state.cash += r.cashChange;
  state.totalProfit += r.profit;
  const settledWeek = state.week;
  state.week++;

  state.lastTraffic = Math.round(r.traffic);
  state.lastProfit = Math.round(r.profit);

  // ============ 声誉变化 ============
  let repChange = 0;
  if (restaurantOpen && !isBanquetWeek) {
    repChange = (r.kitchenMul - 1.0) * CONFIG.repKitchenWeight - CONFIG.repDecay;
    if (r.overloadRatio > 0.5) repChange -= 2;
    else if (r.overloadRatio > 0.2) repChange -= 0.5;

    repChange = Math.round(repChange * 10) / 10;
    state.reputation += repChange;
    state.reputation = Math.max(0, Math.min(100, state.reputation));
  }

  characters.forEach(c => { c.current.talkedThisWeek = false; });

  // ============ 精力结算 ============
  characters.forEach(c => {
    if (c.current.task === 'rest') return;

    if (c.current.task === 'work') {
      const shop = SHOPS.find(s => s.id === c.current.workShop);
      const cost = shop ? shop.energyCost : 25;
      c.current.energy = Math.max(0, c.current.energy - cost);
    } else {
      const task = TASKS.find(t => t.id === c.current.task);
      if (task) {
        const mult = getPositionEnergyMultiplier(c.current.task);
        const cost = task.energyCost * mult;
        c.current.energy = Math.max(0, c.current.energy - cost);
      }
    }
  });

  characters.forEach(c => {
    if (c.current.task === 'rest') {
      c.current.energy = Math.min(c.traits.energyMax, c.current.energy + c.traits.recovery);
    }
  });

  const kokono = characters.find(c => c.id === 'kokono');
  const kokonoHasEnergy = kokono && kokono.current.energy > 0;

  let houseworkInfo = null;
  if (kokono) {
    if (kokonoHasEnergy) {
      houseworkInfo = 'normal';
      const houseworkCost = state.houseworkCost || 5;
      kokono.current.energy = Math.max(0, kokono.current.energy - houseworkCost);
    } else {
      houseworkInfo = 'exhausted';
      characters.forEach(c => {
        if (c.id !== 'kokono' && c.current.energy > 0) {
          c.current.energy = Math.max(0, c.current.energy - 2);
        }
      });
    }
  }

  characters.forEach(c => {
    if (c.current.energy <= 0) {
      if (c.current.task === 'work') c.current.workShop = null;
      c.current.task = 'rest';
      assignHomeInitialPosition(c);
    }
  });
  updateWorkPositions();

  // ============ 宴席结算 ============
  let banquetMsg = '';
  let banquetSuccess = false;
  if (isBanquetWeek) {
    const b = state.banquet;
    const isRecipeUnlocked = state.unlockedPremium.indexOf(b.requiredRecipeId) >= 0;
    const allHealthy = characters.every(c => c.current.energy >= 20);

    if (isRecipeUnlocked && b.isPrepDone && allHealthy && restaurantOpen) {
      const tip = Math.floor(b.quote * (0.1 + Math.random() * 0.1));
      const income = b.quote + tip;
      state.cash += income;
      banquetMsg = `🎊 宴席圆满成功！获得报价 ${b.quote} + 小费 ${tip}，共 ${income} 金！`;
      banquetSuccess = true;
    } else {
      state.cash -= b.penalty;
      banquetMsg = `💥 宴席搞砸了！条件未满足，赔付违约金 ${b.penalty} 金。`;
      banquetSuccess = false;
    }
    state.banquet = null; // 结束
  }

  // ============ 研发进度 ============
  const rProj = state.researchProject;
  if (rProj && rProj.recipeId && rProj.assignedChar) {
    const char = characters.find(c => c.id === rProj.assignedChar);
    if (char && !isExhausted(char)) {
      let add = 10;
      if (char.id === 'kokono') add = 40;
      else if (char.id === 'leye') add = 25;
      rProj.progress += add;

      const target = RECIPES.find(x => x.id === rProj.recipeId);
      const maxP = target.id === 'buddha' ? 200 : (target.id === 'manhan' ? 150 : 100);
      if (rProj.progress >= maxP) {
        state.unlockedPremium.push(target.id);
        alert(`🎉 研发成功！解锁高级菜谱【${target.name}】`);
        state.researchProject = { recipeId: null, progress: 0, assignedChar: null };
      }
    }
  }

  // ============ 店铺打工次数 + 新菜谱 ============
  const shopsUsed = new Set();
  characters.forEach(c => {
    if (c.current.task === 'work' && c.current.workShop && !isExhausted(c)) shopsUsed.add(c.current.workShop);
  });

  const newRecipes = [];
  shopsUsed.forEach(shopId => {
    const shop = SHOPS.find(s => s.id === shopId);
    if (!shop) return;
    shop.workCount++;
    shop.recipes.forEach((rid, i) => {
      const need = shop.unlockAt[i];
      if (shop.workCount >= need && state.learnedRecipes.indexOf(rid) < 0) {
        state.learnedRecipes.push(rid);
        newRecipes.push(rid);
      }
    });
  });

  if (ningetsuWantRecipe) {
    const pool = RECIPES.filter(rec =>
      state.learnedRecipes.indexOf(rec.id) < 0 &&
      newRecipes.indexOf(rec.id) < 0
    );
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      state.learnedRecipes.push(picked.id);
      newRecipes.push(picked.id);
    }
  }

  if (state.pendingRecipes && state.pendingRecipes.length > 0) {
    state.pendingRecipes.forEach(rid => {
      if (newRecipes.indexOf(rid) < 0) newRecipes.push(rid);
    });
    state.pendingRecipes = [];
  }

  // ============ 写账本 ============
  state.ledger.push({
    week: settledWeek,
    revenue: Math.round(r.revenue),
    foodCost: Math.round(r.foodCost),
    fixedCost: Math.round(r.fixedCost),
    familyCost: Math.round(r.familyCost),
    workIncome: Math.round(r.workIncome),
    cashChange: Math.round(r.cashChange),
    cashAfter: Math.round(state.cash),
    profit: Math.round(r.profit),
  });

  state.tempUnitPriceBonus = 0;
  state.tempTrafficBonus = 0;
  state.seasonalEvent = rollSeasonalEvent();

  spawnNormalCustomer();
  spawnNormalCustomer();
  generateSpecialCustomers();

  let script;
  if (isBanquetWeek) {
    script = [{ text: banquetSuccess ? '宴席大获成功！' : '宴席办砸了……' }];
  } else if (!restaurantOpen) {
    script = [{ text: '本周餐馆未营业。' }];
  } else if (r.profit > 20000) script = STORY.settlement.big;
  else if (r.profit > 0) script = STORY.settlement.small;
  else if (r.profit > -5000) script = STORY.settlement.slightLoss;
  else script = STORY.settlement.bigLoss;

  const exhaustedChar = characters.find(c => isExhausted(c));
  if (exhaustedChar && STORY.exhausted && STORY.exhausted[exhaustedChar.id]) {
    script = script.concat([{ text: '———' }], STORY.exhausted[exhaustedChar.id]);
  } else {
    const tiredChar = characters.find(c => isTired(c));
    if (tiredChar && STORY.tired[tiredChar.id]) {
      script = script.concat([{ text: '———' }], STORY.tired[tiredChar.id]);
    }
  }

  const settleData = {
    week: settledWeek, r, script, repChange, restaurantOpen,
    ningetsuEventType, ningetsuExtraMoney, houseworkInfo,
    survivingGuests, banquetMsg, banquetSuccess, banquetPrepMsg
  };

  if (newRecipes.length > 0) {
    startLearnFlow(newRecipes, settleData);
  } else {
    showSettlementDialogue(settleData);
  }

  renderStatus();
}

function showSettlementDialogue(settleData) {
  const {
    week, r, script, repChange, restaurantOpen,
    ningetsuEventType, ningetsuExtraMoney, houseworkInfo,
    survivingGuests, banquetMsg, banquetSuccess, banquetPrepMsg
  } = settleData;

  showModal(buildSettleHTML(
    week, r, script, repChange, restaurantOpen,
    ningetsuEventType, ningetsuExtraMoney, houseworkInfo,
    survivingGuests, banquetMsg, banquetSuccess, banquetPrepMsg
  ));

  document.getElementById('modal-btn').onclick = () => {
    closeModal();
    checkEnding();
  };
}

// ============================================================
//   结算弹窗 HTML
// ============================================================
function buildSettleHTML(week, r, script, repChange, restaurantOpen, ningetsuEventType, ningetsuExtraMoney, houseworkInfo, survivingGuests, banquetMsg, banquetSuccess, banquetPrepMsg) {
  
  let banquetLine = '';
  if (banquetMsg) {
    const color = banquetSuccess ? '#2e7d32' : '#d32f2f';
    banquetLine = `<div class="ledger-row" style="color:${color};font-weight:bold;background:${banquetSuccess?'#e8f5e9':'#ffebee'};padding:6px;border-radius:4px;margin-bottom:6px;">
      <span>${banquetMsg}</span>
    </div>`;
  }

  let prepLine = '';
  if (banquetPrepMsg) {
    prepLine = `<div class="ledger-row" style="color:#e65100;font-weight:bold;background:#fff3e0;padding:6px;border-radius:4px;margin-bottom:6px;">
      <span>${banquetPrepMsg}</span>
    </div>`;
  }

  let eventLine = '';
  if (state.seasonalEvent && state.seasonalEvent.type !== 'none') {
    const ev = state.seasonalEvent;
    const color = ev.value > 0 ? '#4caf50' : '#d32f2f';
    eventLine = `<div class="ledger-row" style="color:${color}"><span>下周事件</span><span>${ev.name}（${ev.desc}）</span></div>`;
  }

  let overloadLine = '';
  if (r.overloadRatio > 0) {
    const pct = Math.round(r.overloadRatio * 100);
    const penalty = Math.round(r.overloadPenalty * 100);
    const cls = r.overloadRatio > 0.5 ? 'color:#d32f2f;font-weight:bold' : 'color:#ff9800';
    overloadLine = `<div class="ledger-row" style="${cls}"><span>${r.overloadedStation}岗位超载${pct}%！</span><span>营收 -${penalty}%</span></div>`;
  }

  let microLoanLine = '';
  if (r.microLoanDue > 0) {
    microLoanLine = `<div class="ledger-row" style="color:#d32f2f;font-weight:bold;background:#ffebee;padding:4px;border-radius:4px">
      <span>⚠ 小额贷到期扣除</span><span>-${r.microLoanDue}</span>
    </div>`;
  }

  let purchaseLine = '';
  if (state.purchaseWeeks >= CONFIG.purchaseGraceWeeks) {
    purchaseLine = `<div class="ledger-row" style="color:#d32f2f"><span>采购</span><span>断采！成本 &amp; 家庭开销 +100%</span></div>`;
  } else if (state.purchaseWeeks === 0) {
    const pct = Math.round(state.lastPurchaseMul * 100);
    purchaseLine = `<div class="ledger-row" style="color:#4caf50"><span>采购</span><span>刚采购（+${pct}%）</span></div>`;
  } else {
    const remain = CONFIG.purchaseGraceWeeks - state.purchaseWeeks;
    const pct = Math.round(state.lastPurchaseMul * 100);
    purchaseLine = `<div class="ledger-row" style="color:#ff9800"><span>采购</span><span>剩 ${remain} 周（+${pct}%）</span></div>`;
  }

  const repChangeText = repChange > 0 ? '+' + repChange : (repChange < 0 ? '' + repChange : '0');
  const repColor = repChange >= 0 ? '#4caf50' : '#d32f2f';

  let houseworkLine = '';
  if (houseworkInfo === 'exhausted') {
    houseworkLine = `<div class="ledger-row" style="color:#7b1fa2"><span>家务</span><span>心玖筋疲力尽，全家各 -2 精力</span></div>`;
  } else if (houseworkInfo === 'normal') {
    const hc = state.houseworkCost || 5;
    houseworkLine = `<div class="ledger-row" style="color:#7b1fa2"><span>家务</span><span>心玖 -${hc} 精力</span></div>`;
  }

  let ningetsuLine = '';
  if (ningetsuEventType === 'money') {
    ningetsuLine = `<div class="ledger-row" style="color:#d32f2f"><span>宁月打工</span><span>意外收获！双倍工钱 +${Math.round(ningetsuExtraMoney)}</span></div>`;
  } else if (ningetsuEventType === 'recipe') {
    ningetsuLine = `<div class="ledger-row" style="color:#7b1fa2"><span>宁月打工</span><span>偷偷学到了一道新菜谱！</span></div>`;
  }

  const musicMul = getMusicMultiplier();
  let musicLine = '';
  if (musicMul > 1.0 && restaurantOpen && !banquetMsg) {
    musicLine = `<div class="ledger-row" style="color:#1976d2"><span>音乐</span><span>${getMusicName()} 客流 ×${musicMul.toFixed(2)}</span></div>`;
  }

  let tempBonusLine = '';
  if (restaurantOpen && !banquetMsg) {
    const tTraffic = r.tempTraffic || 0;
    const tPrice = r.unitPriceBonus || 0;
    if (tTraffic !== 0) {
      tempBonusLine += `<div class="ledger-row" style="color:#7b1fa2"><span>临时客流</span><span>${tTraffic > 0 ? '+' : ''}${Math.round(tTraffic * 100)}%</span></div>`;
    }
    if (tPrice !== 0) {
      tempBonusLine += `<div class="ledger-row" style="color:#7b1fa2"><span>临时客单价</span><span>${tPrice > 0 ? '+' : ''}${Math.round(tPrice * 100)}%</span></div>`;
    }
  }

  let survivingLine = '';
  if (survivingGuests && survivingGuests.length > 0) {
    survivingGuests.forEach(text => {
      survivingLine += `<div class="ledger-row" style="color:#7b1fa2"><span>客人</span><span>${text}</span></div>`;
    });
  }

  let normalLedgerHTML = '';
  if (banquetMsg && banquetSuccess) {
    normalLedgerHTML = `
      <div class="ledger-row" style="color:#888"><span>日常营业</span><span>暂停（举办宴席）</span></div>
      <div class="ledger-row"><span>店铺固定</span><span>-${Math.round(r.fixedCost)}</span></div>
      <div class="ledger-row"><span>家庭开销</span><span>-${Math.round(r.familyCost)}</span></div>
    `;
  } else {
    normalLedgerHTML = `
      <div class="ledger-row"><span>客流</span><span>${Math.round(r.traffic)}</span></div>
      <div class="ledger-row"><span>营业额</span><span>${Math.round(r.revenue)}</span></div>
      <div class="ledger-row"><span>食材成本</span><span>-${Math.round(r.foodCost)}</span></div>
      <div class="ledger-row"><span>店铺固定</span><span>-${Math.round(r.fixedCost)}</span></div>
      <div class="ledger-row"><span>家庭开销</span><span>-${Math.round(r.familyCost)}</span></div>
      <div class="ledger-row"><span>打工收入</span><span>+${Math.round(r.workIncome)}</span></div>
    `;
  }

  const topHTML = `
    <div class="settle-top">
      <h3>第 ${week} 周 结算</h3>
      
      ${prepLine}
      ${banquetLine}
      
      ${!restaurantOpen && !banquetMsg ? `<div style="color:#ff9800;font-size:12px;margin-bottom:6px">⚠ 本周餐馆未营业，只结算固定支出与打工收入</div>` : ''}
      
      ${normalLedgerHTML}
      ${musicLine}
      ${tempBonusLine}
      ${overloadLine}
      ${purchaseLine}
      ${houseworkLine}
      ${ningetsuLine}
      ${microLoanLine}
      ${survivingLine}
      ${eventLine}
      <div class="ledger-row total">
        <span>现金变化</span>
        <span>${r.cashChange >= 0 ? '+' : ''}${Math.round(r.cashChange)}</span>
      </div>
      <div class="ledger-row">
        <span>声誉变化</span>
        <span style="color:${repColor};font-weight:bold">${repChangeText}（当前 ${state.reputation.toFixed(1)}）</span>
      </div>
    </div>
  `;

  const bottomHTML = `
    <div class="settle-bottom">
      <div class="portraits">
        ${portraitHTML('leye', '蕾叶')}
        ${portraitHTML('kokono', '心玖')}
      </div>
      <div class="dialogue">${playScript(script)}</div>
    </div>
  `;

  return topHTML + bottomHTML;
}

// ============================================================
//   成就检查
// ============================================================
function checkAchievements() {
  const add = (id) => {
    if (state.achievements.indexOf(id) < 0) state.achievements.push(id);
  };

  if (state.bankruptCount === 0) add('noBankrupt');
  if (state.learnedRecipes.length >= RECIPES.length) add('allRecipes');
  if (state.reputation >= 100) add('rep100');
  if (characters.every(c => c.current.affinity >= 80)) add('allAffinity80');
  if (state.loan <= 0 && state.week <= 35) add('earlyLoan');
}