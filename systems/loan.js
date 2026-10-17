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
  showModal(`
    <div style="text-align:center;padding:4px 0 12px">
      <div style="font-size:36px">🛠️</div>
      <h2 style="margin-top:4px;color:#d32f2f">Developer Mode</h2>
      <p style="font-size:12px;color:#888">AVEMUJICA</p>
    </div>
    
    <div class="shop-info" style="background:#f5f5f5;display:flex;flex-direction:column;gap:8px">
      <button onclick="cheatAddCash()" style="background:#c8e6c9">💰 现金 + 100 万</button>
      <button onclick="cheatClearLoan()" style="background:#fff9c4">💳 清空主贷款</button>
      <button onclick="cheatClearMicro()" style="background:#fff9c4">💸 清空小额贷</button>
      <button onclick="cheatFillEnergy()" style="background:#b3e5fc">⚡ 全员精力回满</button>
      <button onclick="cheatUnlockRecipes()" style="background:#e1bee7">📖 解锁所有菜谱</button>
      <button onclick="cheatSpawnBanquet()" style="background:#ffcc80">🎊 强行触发宴席</button>
      <button onclick="cheatAddReputation()" style="background:#f8bbd0">⭐ 声誉拉满 100</button>
    </div>

    <button style="width:100%;margin-top:16px;background:#e0e0e0" onclick="openLoanModal()">返回还款</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

// 作弊功能实现
function cheatAddCash() {
  state.cash += 1000000;
  renderStatus();
  alert('已增加 100 万现金');
}

function cheatClearLoan() {
  state.loan = 0;
  renderStatus();
  alert('主贷款已清零');
}

function cheatClearMicro() {
  state.microLoans = [];
  renderStatus();
  alert('小额贷款已清零');
}

function cheatFillEnergy() {
  characters.forEach(c => c.current.energy = c.traits.energyMax);
  renderStatus();
  alert('全员精力已回满');
}

function cheatUnlockRecipes() {
  RECIPES.forEach(r => {
    if (state.learnedRecipes.indexOf(r.id) < 0) state.learnedRecipes.push(r.id);
    if (r.premium && state.unlockedPremium.indexOf(r.id) < 0) state.unlockedPremium.push(r.id);
  });
  alert('所有菜谱已解锁（含高级）');
}

function cheatSpawnBanquet() {
  if (state.banquet) {
    alert('当前已有宴席任务未完成！');
    return;
  }
  // 强行塞一个等级3的豪门婚宴
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
}

function cheatAddReputation() {
  state.reputation = 100;
  renderStatus();
  alert('声誉已拉满至 100');
}