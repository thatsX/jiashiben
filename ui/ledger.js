function renderLedger() {
  const el = document.getElementById('page-ledger');

  const summary = `
    <div class="card" style="cursor:default">
      <div class="ledger-row"><span>现金</span><span>${Math.round(state.cash)}</span></div>
      <div class="ledger-row"><span>负债</span><span>${Math.round(state.loan)}</span></div>
      <div class="ledger-row"><span>累计净利</span><span>${Math.round(state.totalProfit)}</span></div>
      <div class="ledger-row"><span>破产次数</span><span>${state.bankruptCount}</span></div>
    </div>
  `;

  const recordsHTML = state.ledger.length > 0
    ? state.ledger.slice().reverse().map(r => `
        <div class="week-record">
          <div class="week-record-title">第 ${r.week} 周</div>
          <div class="ledger-row"><span>营业额</span><span>${r.revenue}</span></div>
          <div class="ledger-row"><span>食材成本</span><span>-${r.foodCost}</span></div>
          <div class="ledger-row"><span>店铺固定</span><span>-${r.fixedCost}</span></div>
          <div class="ledger-row"><span>家庭开销</span><span>-${r.familyCost}</span></div>
          <div class="ledger-row"><span>打工收入</span><span>+${r.workIncome}</span></div>
          <div class="ledger-row total">
            <span>现金变化</span>
            <span>${r.cashChange >= 0 ? '+' : ''}${r.cashChange}</span>
          </div>
          <div class="ledger-row" style="font-size:12px;color:#888">
            <span>期末现金</span><span>${r.cashAfter}</span>
          </div>
        </div>
      `).join('')
    : '<p style="color:#888;font-size:13px">还没有经营记录。</p>';

  el.innerHTML = `
    <h3>账本</h3>
    ${summary}
    <button style="width:100%;margin-top:8px;background:#ff8a80" onclick="confirmReset()">
      🔄 恢复默认状态重开
    </button>
    <h3 style="margin-top:16px">周记录</h3>
    ${recordsHTML}
  `;
}

function confirmReset() {
  if (!confirm('确定要恢复默认状态重新开始吗？\n所有进度、账本记录都会清空。')) return;
  resetGame();
  switchPage('home');
}