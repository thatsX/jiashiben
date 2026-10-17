/* ============================================================
   systems/mafia.js —— 极道系统逻辑
   ============================================================ */

let pendingMafiaCutscene = null;
let isInFinalBattle = false;

function enterMafiaLine() {
  state.isMafia = true;
  state.cash -= 20000; 
  characters.forEach(c => c.current.energy = Math.max(0, c.current.energy - 20));
  
  state.mafiaQuestIdx = 0;
  state.mafiaDeadline = state.week + MAFIA_QUESTS[0].deadlineAdd;
  state.mafiaRep = 0;
  
  document.getElementById('app').classList.add('theme-mafia');
  
  renderStatus();
  alert('当天晚上，店被砸了。\n损失 20000 金，全员精力 -20。\n蕾叶决定去极道讨个说法！\n\n新目标：去极道酒吧打工 1 次。');
}

function failMafiaLine(reason) {
  state.isMafia = false;
  state.mafiaRep = 0;
  state.mafiaQuestIdx = 0;
  state.mafiaFailMsg = reason;
  
  document.getElementById('app').classList.remove('theme-mafia');
  
  showModal(`
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:40px">💥</div>
      <h3 style="margin-top:10px;color:#d32f2f">极道梦碎</h3>
      <p style="margin-top:12px;font-size:14px;line-height:1.6">${reason}</p>
      <p style="margin-top:12px;font-size:12px;color:#666">蕾叶叹了口气：“算了，这浑水我们不蹚了。老实回去开店吧。”</p>
    </div>
  `);
  document.getElementById('modal-btn').onclick = () => {
    closeModal();
    renderPage('home');
    renderStatus();
  };
}

// 押注推进
function doImmediateBet(fighterId, amount) {
  if (state.weeklyBets >= 5) {
    alert('本周最多只能押注 5 次，下周再来吧！');
    return;
  }
  if (state.cash < amount) {
    alert(`现金不足 ${amount} 金，无法押注！`);
    return;
  }
  
  state.cash -= amount;
  state.weeklyBets++;
  
  const results = ['A', 'B', 'C'].sort(() => Math.random() - 0.5);
  const rank = results.indexOf(fighterId) + 1;
  
  let returnMoney = 0;
  let repGain = 0;
  let msg = '';
  let icon = '';
  let color = '';
  
  if (rank === 1) {
    returnMoney = amount * 3;
    repGain = 15;
    msg = '第一名！大获全胜！';
    icon = '🎉'; color = '#4caf50';
  } else if (rank === 2) {
    returnMoney = amount * 2;
    repGain = 8;
    msg = '第二名！回本了。';
    icon = '👏'; color = '#2196f3';
  } else {
    repGain = 3;
    msg = '第三名……血本无归。';
    icon = '💸'; color = '#d32f2f';
  }
  
  state.cash += returnMoney;
  state.mafiaRep += repGain;
  
  // 任务推进
  const q = MAFIA_QUESTS[state.mafiaQuestIdx];
  if (q && q.type === 'bet_count') {
    q.current = (q.current || 0) + 1;
  }
  
  renderStatus();
  
  showModal(`
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:60px">${icon}</div>
      <h2 style="color:${color};margin-top:10px">${msg}</h2>
      <div class="shop-info" style="margin-top:12px">
        <div class="ledger-row"><span>开奖顺序</span><span>${results.join(' > ')}</span></div>
        <div class="ledger-row"><span>押注金额</span><span>${amount}</span></div>
        <div class="ledger-row"><span>返还金额</span><span style="color:${color}">${returnMoney}</span></div>
        <div class="ledger-row"><span>声望获取</span><span style="color:#b8860b">+${repGain}</span></div>
      </div>
    </div>
    <button style="width:100%;margin-top:12px;background:#b8860b;color:#000" onclick="openBoxingRing()">继续押注 (剩 ${5 - state.weeklyBets} 次)</button>
    <button style="width:100%;margin-top:8px;background:#333;color:#fff;border-color:#555" onclick="closeModal()">离开拳场</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

// Live 推进
function hostUndergroundLive() {
  if (state.liveCooldown > 0) { alert(`地下 Live House 冷却中，还需等待 ${state.liveCooldown} 周。`); return; }
  if (state.cash < 50000) { alert('布置场地需要 50000 金，现金不足！'); return; }
  if (!characters.every(c => c.current.energy >= 30)) { alert('全员精力必须≥30才能举办Live。'); return; }

  state.cash -= 50000;
  characters.forEach(c => c.current.energy -= 30);
  state.cash += 150000;
  state.mafiaRep += 50;
  state.liveCooldown = 3;
  
  // 推进任务
  const q = MAFIA_QUESTS[state.mafiaQuestIdx];
  if (q && q.type === 'live_hold') {
    q.liveDone = true; // ★ 只要举办成功，就把标记设为 true
  }
  
  renderStatus();
  closeModal();
  alert('🎸 地下 Live 大成功！\n净赚 100000 金，极道声望 +50。');
}

// ============================================================
//   决战 QTE
// ============================================================
function startFinalBattle() {
  isInFinalBattle = true;
  let timeLeft = 5.0;
  let hits = 0;
  const targetHits = 15;
  
  showModal(`
    <div style="text-align:center;padding:20px 0">
      <h2 style="color:#b8860b">决战 NEST</h2>
      <p style="margin:10px 0;font-size:13px">击败老爹的安保部队！疯狂点击下方按钮！</p>
      <div style="font-size:28px;font-weight:bold;color:#d32f2f;margin-bottom:10px" id="qte-timer">5.00s</div>
      <button id="qte-btn" style="width:100%;height:100px;font-size:24px;background:#b8860b;color:#000;border:4px solid #000" onclick="qteHit()">连击！(0/${targetHits})</button>
    </div>
  `);
  document.getElementById('modal-btn').style.display = 'none';

  window.qteHit = function() {
    if (!isInFinalBattle) return;
    hits++;
    document.getElementById('qte-btn').textContent = `连击！(${hits}/${targetHits})`;
    if (hits >= targetHits) {
      isInFinalBattle = false;
      clearInterval(qteTimer);
      closeModal();
      playCutscene(GODFATHER_ENDING_SCRIPT, () => {
        showEndingMenu();
      });
    }
  };

  const startTime = Date.now();
  const qteTimer = setInterval(() => {
    if (!isInFinalBattle) { clearInterval(qteTimer); return; }
    const elapsed = (Date.now() - startTime) / 1000;
    timeLeft = 5.0 - elapsed;
    const timerEl = document.getElementById('qte-timer');
    if (timeLeft <= 0) {
      isInFinalBattle = false;
      clearInterval(qteTimer);
      closeModal();
      failMafiaLine('决战失败，被安保部队击溃了。');
    } else if (timerEl) {
      timerEl.textContent = timeLeft.toFixed(2) + 's';
    }
  }, 50);
}