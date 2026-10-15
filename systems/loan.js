/* ============================================================
   systems/loan.js —— 贷款还款
   ============================================================ */

function openLoanModal() {
  const weeklyInterest = Math.round(state.loan * CONFIG.loanRate);

  showModal(`
    <h3>💰 贷款还款</h3>
    <div class="shop-info">
      <div class="ledger-row"><span>剩余贷款</span><span>${Math.round(state.loan)}</span></div>
      <div class="ledger-row"><span>周利率</span><span>${(CONFIG.loanRate * 100).toFixed(2)}%</span></div>
      <div class="ledger-row"><span>每周利息</span><span>${weeklyInterest}</span></div>
      <div class="ledger-row"><span>手头现金</span><span>${Math.round(state.cash)}</span></div>
    </div>

    <p style="font-size:12px;color:#666;margin:10px 0 6px">
      输入还款金额（整数，不超过现金和贷款）
    </p>

    <input type="number"
           id="repay-input"
           class="repay-input"
           placeholder="还款金额"
           min="1"
           step="1"
           oninput="updateRepayPreview()">

    <div id="repay-preview" class="repay-preview"></div>

    <button class="talk-btn" onclick="confirmRepay()">确认还款</button>
    <button style="width:100%;margin-top:8px;background:#e0e0e0" onclick="fillRepayAll()">
      一次性还清
    </button>
  `);
  const btn = document.getElementById('modal-btn');
  btn.style.display = 'block';
  btn.textContent = '关闭';
  btn.onclick = closeModal;

  updateRepayPreview();
}

function updateRepayPreview() {
  const input = document.getElementById('repay-input');
  const preview = document.getElementById('repay-preview');
  if (!input || !preview) return;

  const raw = input.value.trim();
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
    → 剩余贷款 ${Math.round(afterLoan)}<br>
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

  if (!raw) {
    alert('请输入还款金额。');
    return;
  }
  if (!/^\d+$/.test(raw)) {
    alert('还款金额必须是正整数（不能有小数）。');
    return;
  }

  const val = parseInt(raw, 10);

  if (val <= 0) {
    alert('还款金额必须大于 0。');
    return;
  }
  if (val > state.loan) {
    alert('不能超过贷款余额（' + Math.round(state.loan) + '）。');
    return;
  }
  if (val > state.cash) {
    alert('不能超过手头现金（' + Math.round(state.cash) + '）。');
    return;
  }

  // 执行还款
  state.cash -= val;
  state.loan -= val;
  renderStatus();

  // 还清 → 过场动画
  if (state.loan <= 0) {
    state.loan = 0;
    renderStatus();

    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    modal.classList.remove('cutscene');

    playCutscene(LOAN_CLEAR_SCRIPT, () => {
      renderPage('home');
      renderStatus();
    });
    return;
  }

  // 没还完 → 刷新弹窗
  openLoanModal();
}