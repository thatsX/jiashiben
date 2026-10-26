/* ============================================================
   systems/loan.js —— 贷款还款 + 小额贷款 + 开发者作弊
   ============================================================ */

const MICRO_LOAN_OPTIONS = [
  { amount: 10000, repay: 12000, weeks: 3, name: '小额救急' },
  { amount: 20000, repay: 25000, weeks: 3, name: '中额周转' },
  { amount: 30000, repay: 39000, weeks: 3, name: '大额续命' },
];

function openLoanModal() {
  const weeklyInterest = Math.round(state.loan * CONFIG.loanRate);

  // 小额贷款记录
  let microLoansHTML = '';
  if (state.microLoans && state.microLoans.length > 0) {
    microLoansHTML = state.microLoans.map((ml, i) => {
      const remainWeeks = ml.dueWeek - state.week;
      return `
        <div class="ledger-row" style="color:#d32f2f">
          <span>借款 ${ml.amount}（第 ${ml.dueWeek} 周到期）</span>
          <span>需还 ${ml.repay}</span>
        </div>
        <div class="ledger-row" style="font-size:11px;color:#888;padding-top:0;display:flex;justify-content:space-between;align-items:center">
          <span>剩 ${remainWeeks} 周</span>
          <button style="padding:4px 8px;font-size:11px;background:#ffcdd2;border-color:#d32f2f" onclick="repayMicroLoan(${i})">提前还清 (${ml.repay})</button>
        </div>
      `;
    }).join('');
  } else {
    microLoansHTML = '<div style="font-size:12px;color:#888;text-align:center;padding:6px">暂无小额贷款</div>';
  }

  // 申请按钮
  const applyBtnsHTML = MICRO_LOAN_OPTIONS.map((opt, i) => {
    const activeLoans = state.microLoans ? state.microLoans.length : 0;
    const canApply = activeLoans < 2;   // 最多同时借 2 笔
    return `
      <button style="width:100%;margin-top:6px;padding:8px;font-size:13px;background:#ffcdd2;border-color:#d32f2f"
              ${!canApply ? 'disabled' : ''}
              onclick="applyMicroLoan(${i})">
        ${opt.name}：借 ${opt.amount}，${opt.weeks} 周后还 ${opt.repay}
      </button>
    `;
  }).join('');

  showModal(`
    <h3>💰 贷款管理</h3>
    <div class="shop-info">
      <div class="ledger-row"><span>主贷款</span><span>${Math.round(state.loan)}</span></div>
      <div class="ledger-row"><span>周利率</span><span>${(CONFIG.loanRate * 100).toFixed(2)}%</span></div>
      <div class="ledger-row"><span>每周利息</span><span>${weeklyInterest}</span></div>
      <div class="ledger-row"><span>手头现金</span><span>${Math.round(state.cash)}</span></div>
    </div>

    <h4 style="margin-top:12px;font-size:13px">主贷款还款</h4>
    <input type="text" id="repay-input" class="repay-input"
           placeholder="输入还款金额" inputmode="numeric"
           oninput="updateRepayPreview()">
    <div id="repay-preview" class="repay-preview"></div>
    <button class="talk-btn" onclick="confirmRepay()">确认还款</button>
    <button style="width:100%;margin-top:8px;background:#e0e0e0" onclick="fillRepayAll()">一次性还清</button>

    <h4 style="margin-top:16px;font-size:13px;color:#d32f2f">紧急小额贷款（到期强扣，逾期破产）</h4>
    <div class="shop-info" style="background:#fff5f5;border-color:#ffcdd2">
      ${microLoansHTML}
    </div>
    ${applyBtnsHTML}

    <button style="width:100%;margin-top:12px;background:#e0e0e0" onclick="closeModal()">关闭</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';

  updateRepayPreview();
}

function applyMicroLoan(idx) {
  const opt = MICRO_LOAN_OPTIONS[idx];
  if (!opt) return;

  if (state.microLoans.length >= 2) {
    alert('最多同时借 2 笔小额贷款。');
    return;
  }

  if (!confirm(`确认借款 ${opt.amount}？\n${opt.weeks} 周后需还款 ${opt.repay}，到期直接从现金扣除。\n如果届时现金不足，将直接破产。`)) {
    return;
  }

  state.cash += opt.amount;
  state.microLoans.push({
    amount: opt.amount,
    repay: opt.repay,
    dueWeek: state.week + opt.weeks,
  });

  renderStatus();
  openLoanModal();
}

function updateRepayPreview() {
  const input = document.getElementById('repay-input');
  const preview = document.getElementById('repay-preview');
  if (!input || !preview) return;

  const raw = input.value.trim();

  // 作弊码拦截
  if (raw.toUpperCase() === 'AVEMUJICA') {
    preview.innerHTML = '⚠ 开发者模式：点击确认还款进入作弊面板';
    preview.className = 'repay-preview ok';
    return;
  }

  if (!raw) {
    preview.innerHTML = '';
    preview.className = 'repay-preview';
    return;
  }

  if (!/^\d+$/.test(raw)) {
    preview.innerHTML = '⚠ 请输入正整数（不能有小数）';
    preview.className = 'repay-preview error';
    return;
  }

  const val = parseInt(raw, 10);
  if (val <= 0) {
    preview.innerHTML = '⚠ 金额必须大于 0';
    preview.className = 'repay-preview error';
    return;
  }
  if (val > state.loan) {
    preview.innerHTML = `⚠ 不能超过贷款余额（${Math.round(state.loan)}）`;
    preview.className = 'repay-preview error';
    return;
  }
  if (val > state.cash) {
    preview.innerHTML = `⚠ 不能超过手头现金（${Math.round(state.cash)}）`;
    preview.className = 'repay-preview error';
    return;
  }

  const afterLoan = state.loan - val;
  const afterCash = state.cash - val;
  const newInterest = Math.round(afterLoan * CONFIG.loanRate);

  preview.className = 'repay-preview ok';
  preview.innerHTML = `
    还款 ${val}<br>
    → 剩余主贷 ${Math.round(afterLoan)}<br>
    → 剩余现金 ${Math.round(afterCash)}<br>
    → 新每周利息 ${newInterest}
  `;
}

function fillRepayAll() {
  const amount = Math.min(state.cash, state.loan);
  if (amount <= 0) {
    alert('没有可还款的金额。');
    return;
  }
  const input = document.getElementById('repay-input');
  if (input) {
    input.value = Math.floor(amount);
    updateRepayPreview();
  }
}

function confirmRepay() {
  const input = document.getElementById('repay-input');
  if (!input) return;

  const raw = input.value.trim();

  // 拦截作弊码
  if (raw.toUpperCase() === 'AVEMUJICA') {
    showDevPanel();
    return;
  }

  if (!raw) { alert('请输入还款金额。'); return; }
  if (!/^\d+$/.test(raw)) { alert('必须是正整数。'); return; }

  const val = parseInt(raw, 10);
  if (val <= 0) { alert('金额必须大于 0。'); return; }
  if (val > state.loan) { alert('不能超过主贷款余额。'); return; }
  if (val > state.cash) { alert('不能超过手头现金。'); return; }

  state.cash -= val;
  state.loan -= val;
  renderStatus();

  if (state.loan <= 0) {
    state.loan = 0;
    renderStatus();
    closeModal();

    // 播过场
    playCutscene(LOAN_CLEAR_SCRIPT, () => {
      renderPage('home');
      renderStatus();
    });
    return;
  }

  openLoanModal();
}

// ============================================================
//   提前还清小额贷款
// ============================================================
function repayMicroLoan(idx) {
  const ml = state.microLoans[idx];
  if (!ml) return;

  if (state.cash < ml.repay) {
    alert('现金不足以还清这笔小额贷款（需 ' + ml.repay + '）。');
    return;
  }

  if (!confirm(`确认提前还清吗？将扣除现金 ${ml.repay}。`)) return;

  state.cash -= ml.repay;
  state.microLoans.splice(idx, 1);
  
  renderStatus();
  openLoanModal();
  alert('✅ 已提前还清小额贷款。');
}

// ============================================================
//   开发者作弊面板
// ============================================================
function showDevPanel() {
  // 生成好感度输入选项
  const charOptions = characters.map(c => 
    `<option value="${c.id}">${c.name} (当前: ${c.current.affinity})</option>`
  ).join('');

  showModal(`
    <div style="text-align:center;padding:4px 0 12px">
      <div style="font-size:36px">🛠️</div>
      <h2 style="margin-top:4px;color:#d32f2f">Developer Mode</h2>
      <p style="font-size:12px;color:#888">AVEMUJICA</p>
    </div>
    
    <div class="shop-info" style="background:#f5f5f5;display:flex;flex-direction:column;gap:8px">
      <!-- 快捷按钮 -->
      <button onclick="cheatAddCash()" style="background:#c8e6c9">💰 现金 + 100 万</button>
      <button onclick="cheatClearLoan()" style="background:#fff9c4">💳 清空主贷款</button>
      <button onclick="cheatClearMicro()" style="background:#fff9c4">💸 清空小额贷</button>
      <button onclick="cheatFillEnergy()" style="background:#b3e5fc">⚡ 全员精力回满</button>
      <button onclick="cheatUnlockRecipes()" style="background:#e1bee7">📖 解锁所有菜谱</button>
      <button onclick="cheatSpawnBanquet()" style="background:#ffcc80">🎊 强行触发宴席</button>
      <button onclick="cheatAddReputation()" style="background:#f8bbd0">⭐ 声誉拉满 100</button>
      <button onclick="cheatFullAffinity()" style="background:#ffcdd2">❤️ 全员好感拉满 100</button>
      <button onclick="cheatAddMafiaRep()" style="background:#d7ccc8">🕶️ 极道声望 + 100</button>
      <button onclick="cheatSkipMafiaQuest()" style="background:#ffab91">⏭️ 跳过当前极道任务</button>
      <button onclick="cheatStartMinigame()" style="background:#e1bee7">🎮 触发弹幕小游戏 (仅测试)</button>
    </div>

    <!-- 自定义修改 -->
    <h4 style="margin-top:12px;font-size:13px;color:#d32f2f">自定义数值修改</h4>
    <div class="shop-info" style="background:#fff;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:12px;width:60px">现金</span>
        <input type="number" id="cheat-cash" class="repay-input" style="margin:0;flex:1;padding:6px" placeholder="当前: ${Math.round(state.cash)}">
        <button style="padding:6px 12px;font-size:12px;background:#4caf50;color:white;border-color:#2e7d32" onclick="applyCheat('cash')">修改</button>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:12px;width:60px">贷款</span>
        <input type="number" id="cheat-loan" class="repay-input" style="margin:0;flex:1;padding:6px" placeholder="当前: ${Math.round(state.loan)}">
        <button style="padding:6px 12px;font-size:12px;background:#4caf50;color:white;border-color:#2e7d32" onclick="applyCheat('loan')">修改</button>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:12px;width:60px">周数</span>
        <input type="number" id="cheat-week" class="repay-input" style="margin:0;flex:1;padding:6px" placeholder="当前: ${state.week}">
        <button style="padding:6px 12px;font-size:12px;background:#4caf50;color:white;border-color:#2e7d32" onclick="applyCheat('week')">修改</button>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:12px;width:60px">极道声望</span>
        <input type="number" id="cheat-mafia-rep" class="repay-input" style="margin:0;flex:1;padding:6px" placeholder="当前: ${state.mafiaRep || 0}">
        <button style="padding:6px 12px;font-size:12px;background:#4caf50;color:white;border-color:#2e7d32" onclick="applyCheat('mafiaRep')">修改</button>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:4px">
        <select id="cheat-char-id" style="flex:1;padding:6px;font-size:12px;border-radius:4px;border:1px solid #999">
          ${charOptions}
        </select>
        <input type="number" id="cheat-affinity" class="repay-input" style="margin:0;flex:1;padding:6px" placeholder="好感度">
        <button style="padding:6px 12px;font-size:12px;background:#4caf50;color:white;border-color:#2e7d32" onclick="applyCheat('affinity')">修改</button>
      </div>
    </div>

    <button style="width:100%;margin-top:16px;background:#e0e0e0" onclick="openLoanModal()">返回还款</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

// 自定义数值处理
// ============================================================
//   自定义数值处理（作弊）
// ============================================================
function applyCheat(type) {
  if (type === 'cash') {
    const val = parseInt(document.getElementById('cheat-cash').value, 10);
    if (!isNaN(val)) {
      state.cash = val;
      renderStatus();
      alert(`现金已修改为: ${val}`);
      showDevPanel();
    }
  } 
  else if (type === 'loan') {
    const val = parseInt(document.getElementById('cheat-loan').value, 10);
    if (!isNaN(val)) {
      state.loan = val;
      renderStatus();
      alert(`贷款已修改为: ${val}`);
      showDevPanel();
    }
  } 
  else if (type === 'week') {
    const val = parseInt(document.getElementById('cheat-week').value, 10);
    if (!isNaN(val)) {
      state.week = val;
      renderStatus();
      alert(`周数已修改为: 第 ${val} 周`);
      showDevPanel();
    }
  } 
  else if (type === 'mafiaRep') {
    const val = parseInt(document.getElementById('cheat-mafia-rep').value, 10);
    if (!isNaN(val)) {
      state.mafiaRep = val;
      renderStatus();
      alert(`极道声望已修改为: ${val}`);
      showDevPanel();
    }
  } 
  else if (type === 'affinity') {
    const charId = document.getElementById('cheat-char-id').value;
    const rawVal = document.getElementById('cheat-affinity').value;
    const val = parseInt(rawVal, 10);

    if (rawVal === '' || isNaN(val)) {
      alert('请输入有效的好感度数字！');
      return;
    }

    const c = characters.find(x => x.id === charId);
    if (c) {
      // ★ 修复：这里是 val，不是 Math.val，也没有 100 的上限了
      c.current.affinity = Math.max(0, val); 
      alert(`${c.name} 的好感度已修改为: ${c.current.affinity}`);
      showDevPanel(); 
    } else {
      alert('未找到该角色，id可能异常: ' + charId);
    }
  }
}

// ============================================================
//   快捷作弊功能
// ============================================================
function cheatAddCash() {
  state.cash += 1000000;
  renderStatus();
  alert('已增加 100 万现金');
  showDevPanel();
}

function cheatClearLoan() {
  state.loan = 0;
  renderStatus();
  alert('主贷款已清零');
  showDevPanel();
}

function cheatClearMicro() {
  state.microLoans = [];
  renderStatus();
  alert('小额贷款已清零');
  showDevPanel();
}

function cheatFillEnergy() {
  characters.forEach(c => c.current.energy = c.traits.energyMax);
  renderStatus();
  alert('全员精力已回满');
  showDevPanel();
}

function cheatUnlockRecipes() {
  RECIPES.forEach(r => {
    if (r.premium) {
      if (state.unlockedPremium.indexOf(r.id) < 0) state.unlockedPremium.push(r.id);
    } else {
      if (state.learnedRecipes.indexOf(r.id) < 0) state.learnedRecipes.push(r.id);
    }
  });
  alert('所有菜谱已解锁（含高级）');
  showDevPanel();
}

function cheatSpawnBanquet() {
  if (state.banquet) {
    alert('当前已有宴席任务未完成！');
    return;
  }
  state.banquet = {
    level: 3,
    name: '豪门婚宴',
    requiredRecipeId: 'buddha',
    quote: 250000,
    penalty: 20000,
    deadlineWeek: state.week + 3,
    prepAssignedChar: null,
    weeksLeft: 3,
    prepProgress: 0,      
    isPrepDone: false     
  };
  alert('已强行触发【豪门婚宴】！请去首页查看筹备面板。');
  showDevPanel();
}

function cheatAddReputation() {
  state.reputation = 100;
  renderStatus();
  alert('声誉已拉满至 100');
  showDevPanel();
}

function cheatFullAffinity() {
  characters.forEach(c => c.current.affinity = 100);
  alert('全员好感度已拉满至 100');
  showDevPanel();
}

function cheatAddMafiaRep() {
  state.mafiaRep = (state.mafiaRep || 0) + 100;
  renderStatus();
  alert(`极道声望 +100（当前: ${state.mafiaRep}）`);
  showDevPanel();
}

// ============================================================
//   快捷作弊：跳过当前极道任务
// ============================================================
function cheatSkipMafiaQuest() {
  if (!state.isMafia) {
    alert('当前不在极道线！');
    return;
  }
  if (typeof MAFIA_QUESTS === 'undefined') {
    alert('未加载极道任务数据。');
    return;
  }

  const q = MAFIA_QUESTS[state.mafiaQuestIdx];
  if (!q) {
    alert('当前已经是最后一个任务（或没有任务）。');
    return;
  }

  // 如果是最终决战（原任务3），直接跳过可能会卡剧情
  if (q.type === 'cash' || q.id === 3) {
    alert('最终决战任务建议正常游玩体验，或直接修改现金达标。');
    return;
  }

  // 强行完成当前任务进度
  q.current = q.target;
  if (q.liveDone !== undefined) q.liveDone = true;

  // 推进到下一个任务
  state.mafiaQuestIdx++;
  
  let msg = `已跳过任务【${q.title}】。\n`;
  
  if (state.mafiaQuestIdx < MAFIA_QUESTS.length) {
    const nextQ = MAFIA_QUESTS[state.mafiaQuestIdx];
    state.mafiaDeadline = state.week + nextQ.deadlineAdd;
    msg += `当前任务已切换为【${nextQ.title}】。`;
  } else {
    msg += '所有极道任务已完成！';
  }

  // 如果正在夜间经营，顺手把夜间状态重置以防卡死
  if (state.night && state.night.active) {
    state.night.active = false;
    state.night.phase = 'idle';
  }

  alert(msg);
  renderStatus();
  renderPage('home');
  showDevPanel(); // 刷新作弊面板
}

// ============================================================
//   快捷作弊：单独测试任务 E 小游戏
// ============================================================
function cheatStartMinigame() {
  closeModal(); // 关掉作弊面板

  // 确保环境存在，防止报错
  if (!state.night) {
    state.night = { active: false, phase: 'idle' };
  }

  // 定义测试模式下的专用回调
  window.mgFinishCallback = function(win) {
    // 测试模式下，不扣声望、不推进任务
    alert(win ? '【测试模式】小游戏胜利！' : '【测试模式】小游戏失败！');
    renderPage('home');
    renderStatus();
  };

  // 启动小游戏
  if (typeof startKokonoMinigame === 'function') {
    startKokonoMinigame(window.mgFinishCallback);
  } else {
    alert('小游戏模块 (systems/minigame.js) 未加载！');
  }
}