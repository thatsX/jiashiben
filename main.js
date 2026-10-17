/* ============================================================
   main.js —— 入口
   ============================================================ */

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchPage(tab.dataset.page));
  });

  // 先加载资源，再初始化游戏
  startPreload(
    (progress, done, total) => {
      const pct = Math.round(progress * 100);
      const fill = document.getElementById('loading-fill');
      const text = document.getElementById('loading-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = '加载中... ' + pct + '% (' + done + '/' + total + ')';
    },
    () => {
      try { init(); }
      catch (e) {
        console.error('初始化失败:', e);
        alert('初始化出错：' + e.message);
      }

      const screen = document.getElementById('loading-screen');
      if (screen) {
        screen.classList.add('fade-out');
        setTimeout(() => { screen.style.display = 'none'; }, 600);
      }
    }
  );
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
  state.microLoans = [];
  state.researchProject = { recipeId: null, progress: 0, assignedChar: null };
  state.unlockedPremium = [];
  state.banquet = null;

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

  renderStatus();

  const container = document.getElementById('page-container');
  if (container) container.classList.add('no-padding');

  renderPage('home');

  // 显示主菜单，等待玩家选择
  showTitleScreen();
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

// ============================================================
//   主菜单
// ============================================================
function showTitleScreen() {
  const el = document.getElementById('title-screen');
  if (el) el.style.display = 'flex';
}

function hideTitleScreen() {
  const el = document.getElementById('title-screen');
  if (el) el.style.display = 'none';
}

// ============================================================
//   新游戏
// ============================================================
function startNewGame() {
  hideTitleScreen();
  resetGame();

  playCutscenes([OPENING_LIVING_SCRIPT, OPENING_BEDROOM_SCRIPT], () => {
    startTick();
    startTutorial();
  });
}

// ============================================================
//   导入存档
// ============================================================
function showImportDialog() {
  // 先隐藏主菜单，让弹窗露出来
  hideTitleScreen();

  showModal(`
    <div style="text-align:center;padding:6px 0 12px">
      <div style="font-size:36px">📥</div>
      <h2 style="margin-top:6px;color:#333">导入存档</h2>
      <p style="font-size:12px;color:#888;margin-top:4px">
        将存档密钥粘贴到下方
      </p>
    </div>
    <textarea class="save-textarea" id="import-textarea"
              placeholder="粘贴存档密钥..."></textarea>
    <button style="width:100%;margin-top:10px" onclick="doImportAndStart()">确认导入</button>
    <button style="width:100%;margin-top:6px;background:#e0e0e0" onclick="closeImportDialog()">返回</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function closeImportDialog() {
  closeModal();
  showTitleScreen();   // 显示主菜单
}

function doImportAndStart() {
  const ta = document.getElementById('import-textarea');
  const str = ta ? ta.value.trim() : '';

  if (!str) {
    alert('请先粘贴存档密钥');
    return;
  }

  if (!importSaveString(str)) {
    alert('导入失败，请检查密钥是否完整');
    return;
  }

  closeModal();
  hideTitleScreen();
  renderStatus();
  renderPage('home');
  startTick();

  alert('✅ 导入成功！');
}