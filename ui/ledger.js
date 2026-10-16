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
    <button style="width:100%;margin-top:6px;background:#ffd54f" onclick="exportSave()">
      📤 导出存档密钥
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

// ============================================================
//   导出存档
// ============================================================
function exportSave() {
  const str = exportSaveString();
  if (!str) {
    alert('导出失败');
    return;
  }

  const size = str.length;

  showModal(`
    <div style="text-align:center;padding:4px 0 10px">
      <div style="font-size:36px">📤</div>
      <h2 style="margin-top:4px;color:#333">导出存档</h2>
      <p style="font-size:12px;color:#888;margin-top:4px">
        复制下面的密钥，将来可以导入恢复
      </p>
    </div>
    <textarea class="save-textarea" id="export-textarea" readonly onclick="this.select()">${str}</textarea>
    <div style="font-size:11px;color:#999;margin-top:4px;text-align:right">
      长度：${size} 字符
    </div>
    <button style="width:100%;margin-top:10px" onclick="copyExportText(this)">📋 复制密钥</button>
    <p style="font-size:11px;color:#888;margin-top:8px;text-align:center">
      （手机长按文本框也可以手动全选复制）
    </p>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

async function copyExportText(btn) {
  const ta = document.getElementById('export-textarea');
  if (!ta) return;
  const text = ta.value;

  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      if (btn) {
        btn.textContent = '✅ 已复制到剪贴板';
        setTimeout(() => { btn.textContent = '📋 复制密钥'; }, 1800);
      }
      return;
    }

    const ok = document.execCommand('copy');
    if (ok) {
      if (btn) {
        btn.textContent = '✅ 已复制到剪贴板';
        setTimeout(() => { btn.textContent = '📋 复制密钥'; }, 1800);
      }
    } else {
      alert('请长按文本框手动复制');
    }
  } catch (e) {
    alert('请长按文本框手动复制');
  }
}