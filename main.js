/* ============================================================
   main.js —— 入口
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchPage(tab.dataset.page));
  });
  try { init(); }
  catch (e) {
    console.error('初始化失败:', e);
    alert('初始化出错：' + e.message);
  }
});

// ---------- 结局判定 ----------
function checkEnding() {
  if (state.cash < 0) {
    state.bankruptCount++;

    // 破产过场：桥洞 → 卧室重开 → 进首页
    playCutscenes([BANKRUPT_SCRIPT, OPENING_BEDROOM_SCRIPT], () => {
      resetGame();
      switchPage('home');
    });
    return;
  }
  if (state.loan <= 0 && state.cash >= CONFIG.targetProfit) {
    checkAchievements();
    if (state.week <= 52 && state.achievements.indexOf('week52') < 0) {
      state.achievements.push('week52');
    }

    playCutscene(SUCCESS_SCRIPT, () => {
      showEndingMenu();
    });
    return;
  }

  renderPage('home');
  renderStatus();
}

// ---------- 重置游戏 ----------
function resetGame() {
  state.week = 1;
  state.cash = CONFIG.startCash;
  state.loan = CONFIG.startLoan;
  state.totalProfit = 0;
  state.reputation = 50;
  state.customers = [];
  state.seenCustomers = [];
  state.ledger = [];
  state.menu = ['rice', 'miso', 'congyou'];
  state.learnedRecipes = [];
  state.lastTraffic = 0;
  state.lastProfit = 0;
  state.purchaseWeeks = 0;
  state.lastPurchaseMul = 0;
  state.currentMusic = 'none';
  state.tempTrafficBonus = 0;
  state.tempUnitPriceBonus = 0;
  state.pendingRecipes = [];
  state.seasonalEvent = null;
  state.achievements = [];
  state.totalRepaid = 0;
  state.earlyLoanWeek = null;
  state.stationUpgrades = { kitchen: 0, wash: 0, front: 0 };

  stopBGM();

  SHOPS.forEach(s => { s.workCount = 0; s.affinity = 0; });

  characters = CHARACTERS.map(createCharacterEntity);
  initHomePositions();
  updateWorkPositions();

  spawnNormalCustomer();
  spawnNormalCustomer();
  generateSpecialCustomers();

  renderStatus();
  renderPage('home');
}

// ---------- 主循环 ----------
let tickTimer = null;
let lastTick = Date.now();

function startTick() {
  if (tickTimer) return;
  lastTick = Date.now();
  tickTimer = setInterval(() => {
    const now = Date.now();
    const dt = now - lastTick;
    lastTick = now;
    tickUpdate(dt);
  }, 400);
}

function tickUpdate(dt) {
  const modal = document.getElementById('modal');
  if (modal && modal.classList.contains('show')) return;

  const active = document.querySelector('.page.active');
  const pageId = active ? active.id : '';

  if (pageId === 'page-home') {
    tickCustomers(dt);
    updateCustomersDOM();
  } else if (pageId === 'page-family') {
    tickHomeChars(dt);
    updateHomeCharsDOM();
  }
}

// ---------- 初始化 ----------
function init() {
  state.menu = ['rice', 'miso', 'congyou'];
  initHomePositions();
  updateWorkPositions();

  spawnNormalCustomer();
  spawnNormalCustomer();
  generateSpecialCustomers();

  state.seasonalEvent = rollSeasonalEvent();
  renderStatus();

  const container = document.getElementById('page-container');
  if (container) container.classList.add('no-padding');

  renderPage('home');

  // 播放开场动画，播完再启动主循环
  playCutscenes([OPENING_LIVING_SCRIPT, OPENING_BEDROOM_SCRIPT], () => {
    startTick();
    startTutorial();
  });
}

// ============================================================
//   结局菜单（成功 / 破产后显示）恭喜你带领咖喱人，成功传播家是本文化，夺回NEST！
// ============================================================
function showEndingMenu() {
  const achieved = ACHIEVEMENTS.filter(a => state.achievements.indexOf(a.id) >= 0);
  const listHTML = ACHIEVEMENTS.map(a => {
    const got = state.achievements.indexOf(a.id) >= 0;
    return `<div style="text-align:left;font-size:12px;padding:3px 0;color:${got ? '#2e7d32' : '#999'}">
      ${got ? '✅' : '❌'} ${a.name} <span style="color:#888">— ${a.desc}</span>
    </div>`;
  }).join('');

  showModal(`
    <div style="text-align:center;padding:10px 0">
      <div style="font-size:44px">🎉</div>
      <h2 style="margin-top:10px;color:#d32f2f">恭喜你带领咖喱人成功传播家是本文化，夺回NEST！</h2>
      <p style="margin-top:6px;font-size:13px;color:#666">
        第 ${state.week - 1} 周 · 成就 ${achieved.length}/${ACHIEVEMENTS.length}
      </p>
    </div>
    <div style="background:#fff;border-radius:8px;padding:10px;margin:10px 0">
      ${listHTML}
    </div>
    <button style="width:100%;margin-top:12px" onclick="restartGame()">🔄 重新开始</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function restartGame() {
  closeModal();
  state.gameCleared = false;
  resetGame();
  switchPage('home');
  startTick();
  playCutscenes([OPENING_LIVING_SCRIPT, OPENING_BEDROOM_SCRIPT], () => {});
}