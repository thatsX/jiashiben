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
    showConfirm('本周餐馆未营业，要继续结算吗？', () => doSettle(false), () => {});
    return;
  }

  doSettle(true);
}

// ============================================================
//   正式结算
// ============================================================
function doSettle(restaurantOpen) {
  checkAchievements();

  // ============ 检查未对话的特殊客人（必须在清空之前）============
  const survivingGuests = [];
  state.customers.forEach(c => {
    if (c.type !== 'special') return;
    if (c.talked) return;

    const def = CUSTOMERS.find(x => x.id === c.id);
    if (def && def.onSurvive) {
      applyCustomerEffect(def.onSurvive.effect);
      survivingGuests.push(def.onSurvive.effectText);
    }
  });

  // ============ 记录上周来的特殊客人（阿农用）============
  state.lastWeekSpecials = state.customers
    .filter(c => c.type === 'special')
    .map(c => c.id);

  // ============ 清空所有客人 ============
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

  // ============ 计算经营 ============
  const r = calculateBusiness(restaurantOpen);
  r.cashChange += ningetsuExtraMoney;
  r.workIncome += ningetsuExtraMoney;

  state.cash += r.cashChange;
  state.totalProfit += r.profit;
  const settledWeek = state.week;
  state.week++;

  state.lastTraffic = Math.round(r.traffic);
  state.lastProfit = Math.round(r.profit);

  // ============ 声誉变化 ============
  let repChange = 0;
  if (restaurantOpen) {
    repChange = (r.kitchenMul - 1.0) * CONFIG.repKitchenWeight - CONFIG.repDecay;
    repChange = Math.round(repChange * 10) / 10;
    state.reputation += repChange;
    state.reputation = Math.max(0, Math.min(100, state.reputation));
  }

  // ============ 重置对话状态 ============
  characters.forEach(c => { c.current.talkedThisWeek = false; });

  // ============================================================
  //   精力结算
  // ============================================================

  // 1. 工作扣精力
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

  // 2. 休息回精力
  characters.forEach(c => {
    if (c.current.task === 'rest') {
      c.current.energy = Math.min(c.traits.energyMax, c.current.energy + c.traits.recovery);
    }
  });

  // 3. 判断心玖是否有精力做家务
  const kokono = characters.find(c => c.id === 'kokono');
  const kokonoHasEnergy = kokono && kokono.current.energy > 0;

  // 4. 结算家务
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

  // 5. 筋疲力尽强制休息
  characters.forEach(c => {
    if (c.current.energy <= 0) {
      if (c.current.task === 'work') {
        c.current.workShop = null;
      }
      c.current.task = 'rest';
      assignHomeInitialPosition(c);
    }
  });
  updateWorkPositions();

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

  // 宁月菜谱事件
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

  // 客人赠送的菜谱
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

  // ============ 清空本周临时加成 ============
  state.tempUnitPriceBonus = 0;
  state.tempTrafficBonus = 0;

  // ============ 刷新下周季节事件 ============
  state.seasonalEvent = rollSeasonalEvent();

  // ============ 进入新一周：刷新客人 ============
  spawnNormalCustomer();
  spawnNormalCustomer();
  generateSpecialCustomers();

  // ============ 结算剧本 ============
  let script;
  if (!restaurantOpen) {
    script = [{ text: '本周餐馆未营业。' }];
  } else if (r.profit > 20000) script = STORY.settlement.big;
  else if (r.profit > 0) script = STORY.settlement.small;
  else if (r.profit > -5000) script = STORY.settlement.slightLoss;
  else script = STORY.settlement.bigLoss;

  const tiredChar = characters.find(c => isTired(c));
  if (tiredChar && STORY.tired[tiredChar.id]) {
    script = script.concat([{ text: '———' }], STORY.tired[tiredChar.id]);
  }

  const settleData = {
    week: settledWeek, r, script, repChange, restaurantOpen,
    ningetsuEventType, ningetsuExtraMoney, houseworkInfo,
    survivingGuests,
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
    survivingGuests,
  } = settleData;

  showModal(buildSettleHTML(
    week, r, script, repChange, restaurantOpen,
    ningetsuEventType, ningetsuExtraMoney, houseworkInfo,
    survivingGuests
  ));

  document.getElementById('modal-btn').onclick = () => {
    closeModal();
    checkEnding();
  };
}

// ============================================================
//   结算弹窗 HTML
// ============================================================
function buildSettleHTML(week, r, script, repChange, restaurantOpen, ningetsuEventType, ningetsuExtraMoney, houseworkInfo, survivingGuests) {
  // 季节事件
  let eventLine = '';
  if (state.seasonalEvent && state.seasonalEvent.type !== 'none') {
    const ev = state.seasonalEvent;
    const color = ev.value > 0 ? '#4caf50' : '#d32f2f';
    eventLine = `<div class="ledger-row" style="color:${color}"><span>下周事件</span><span>${ev.name}（${ev.desc}）</span></div>`;
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
  if (musicMul > 1.0 && restaurantOpen) {
    musicLine = `<div class="ledger-row" style="color:#1976d2"><span>音乐</span><span>${getMusicName()} 客流 ×${musicMul.toFixed(2)}</span></div>`;
  }

  let tempBonusLine = '';
  if (restaurantOpen) {
    const tTraffic = r.tempTraffic || 0;
    const tPrice = r.unitPriceBonus || 0;
    if (tTraffic !== 0) {
      tempBonusLine += `<div class="ledger-row" style="color:#7b1fa2"><span>临时客流</span><span>${tTraffic > 0 ? '+' : ''}${Math.round(tTraffic * 100)}%</span></div>`;
    }
    if (tPrice !== 0) {
      tempBonusLine += `<div class="ledger-row" style="color:#7b1fa2"><span>临时客单价</span><span>${tPrice > 0 ? '+' : ''}${Math.round(tPrice * 100)}%</span></div>`;
    }
  }

  // 未对话的特殊客人
  let survivingLine = '';
  if (survivingGuests && survivingGuests.length > 0) {
    survivingGuests.forEach(text => {
      survivingLine += `<div class="ledger-row" style="color:#7b1fa2"><span>客人</span><span>${text}</span></div>`;
    });
  }

  const topHTML = `
    <div class="settle-top">
      <h3>第 ${week} 周 结算</h3>
      ${!restaurantOpen ? `<div style="color:#ff9800;font-size:12px;margin-bottom:6px">⚠ 本周餐馆未营业，只结算固定支出与打工收入</div>` : ''}
      <div class="ledger-row"><span>客流</span><span>${Math.round(r.traffic)}</span></div>
      <div class="ledger-row"><span>客单价</span><span>${r.unitPrice.toFixed(2)}</span></div>
      <div class="ledger-row"><span>营业额</span><span>${Math.round(r.revenue)}</span></div>
      <div class="ledger-row"><span>食材成本</span><span>-${Math.round(r.foodCost)}</span></div>
      <div class="ledger-row"><span>店铺固定</span><span>-${Math.round(r.fixedCost)}</span></div>
      <div class="ledger-row"><span>家庭开销</span><span>-${Math.round(r.familyCost)}</span></div>
      <div class="ledger-row"><span>打工收入</span><span>+${Math.round(r.workIncome)}</span></div>
      ${musicLine}
      ${tempBonusLine}
      ${purchaseLine}
      ${houseworkLine}
      ${ningetsuLine}
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