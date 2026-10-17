/* ============================================================
   systems/banquet.js —— 宴席研发与订单系统
   ============================================================ */

const BANQUET_LEVELS = [
  { level: 1, name: '升学宴',   recipe: 'squirrel_fish', quote: 50000,  prepWeeks: 3, penalty: 5000 },
  { level: 2, name: '公司团建', recipe: 'manhan',        quote: 120000, prepWeeks: 3, penalty: 10000 },
  { level: 3, name: '豪门婚宴', recipe: 'buddha',        quote: 250000, prepWeeks: 3, penalty: 20000 },
];

// 渲染菜单页的研发面板
function renderResearchPanel() {
  const r = state.researchProject;
  
  // 研发中
  if (r.recipeId) {
    const target = RECIPES.find(x => x.id === r.recipeId);
    const maxProgress = target.id === 'buddha' ? 200 : (target.id === 'manhan' ? 150 : 100);
    
    const options = characters.map(c => 
      `<option value="${c.id}" ${r.assignedChar === c.id ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    return `
      <div class="card" style="cursor:default;background:#fff8e1;border-color:#ffd54f">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <b>🍳 正在研发：${target.name}</b>
          <span style="font-size:12px;color:#d32f2f">进度 ${r.progress}/${maxProgress}</span>
        </div>
        <div class="energy-bar" style="height:8px;margin-bottom:8px">
          <div class="energy-fill" style="width:${(r.progress/maxProgress)*100}%;background:#ff9800"></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:12px">研发者：</span>
          <select onchange="changeResearcher(this.value)" style="padding:4px">
            <option value="">（暂停研发）</option>
            ${options}
          </select>
        </div>
        <p style="font-size:11px;color:#888;margin-top:6px">研发者当周工作效率会下降 30%</p>
      </div>
    `;
  }

  // 未研发，列出可研发的
  const available = RECIPES.filter(x => x.premium && state.unlockedPremium.indexOf(x.id) < 0);
  if (available.length === 0) return '';

  const list = available.map(rec => {
    const isBuddha = rec.id === 'buddha';
    const isManhan = rec.id === 'manhan';
    const time = isBuddha ? 200 : (isManhan ? 150 : 100);
    return `
      <div class="card" style="cursor:default;display:flex;justify-content:space-between;align-items:center">
        <div>
          <b>${rec.name}</b>
          <div style="font-size:11px;color:#666">研发需 ${time} 进度 · 成本 15000 金</div>
        </div>
        <button style="padding:6px 12px;font-size:12px" onclick="startResearch('${rec.id}')">开始研发</button>
      </div>
    `;
  }).join('');

  return `<h4 style="margin-top:16px;color:#d32f2f">高级宴席菜谱</h4>${list}`;
}

function startResearch(recipeId) {
  if (state.cash < 15000) {
    alert('现金不足（需 15000 金）。');
    return;
  }
  if (!confirm('确认花费 15000 金开始研发？')) return;

  state.cash -= 15000;
  state.researchProject = {
    recipeId: recipeId,
    progress: 0,
    assignedChar: characters[0].id, // 默认蕾叶
  };
  renderStatus();
  renderPage('menu');
}

function changeResearcher(charId) {
  state.researchProject.assignedChar = charId || null;
  renderPage('menu');
}

// ============================================================
//   宴席客人生成与接单
// ============================================================
function trySpawnBanquetCustomer() {
  // 如果已经有宴席任务，或者随机不到，就不刷
  if (state.banquet) return;
  if (state.week < 12) return; // 第 12 周后才开始有宴席
  if (Math.random() > 0.3) return; // 30% 概率刷出

  // 找一个等级（解锁的高等级菜谱越多，越容易接高等级）
  let maxLv = 1;
  if (state.unlockedPremium.indexOf('manhan') >= 0) maxLv = 2;
  if (state.unlockedPremium.indexOf('buddha') >= 0) maxLv = 3;
  
  const lv = Math.floor(Math.random() * maxLv) + 1;
  const config = BANQUET_LEVELS[lv - 1];

  return {
    id: 'banquet_client',
    name: '宴席委托人',
    type: 'special',
    isBanquet: true,
    banquetLevel: lv,
    banquetData: config,
  };
}

function openBanquetDialog(customer) {
  const cfg = customer.banquetData;
  // ★ 防崩溃兜底
  if (!cfg) {
    closeModal();
    return;
  }
  const stars = '⭐'.repeat(cfg.level);
  const recipe = RECIPES.find(x => x.id === cfg.recipe);

  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      <h3>${stars} ${cfg.name}委托 ${stars}</h3>
      <p style="font-size:13px;color:#666;margin-top:6px">
        “我想在你们店办一场宴席。能不能接？”
      </p>
    </div>
    
    <div class="shop-info">
      <div class="ledger-row"><span>需求菜谱</span><span style="color:${state.unlockedPremium.indexOf(cfg.recipe)>=0?'#4caf50':'#d32f2f'}">${recipe.name}</span></div>
      <div class="ledger-row"><span>基础报价</span><span style="color:#d32f2f">${cfg.quote} 金</span></div>
      <div class="ledger-row"><span>准备期限</span><span>3 周内</span></div>
      <div class="ledger-row"><span>违约赔偿</span><span>${cfg.penalty} 金</span></div>
    </div>

    <p style="font-size:12px;color:#666;margin:10px 0">
      接单后，需在 3 周内完成筹备。宴席当周全员精力必须≥20。
    </p>

    <button style="width:100%;margin-top:8px" onclick="acceptBanquet()">接下这笔大单</button>
    <button style="width:100%;margin-top:6px;background:#e0e0e0" onclick="closeModal()">抱歉，能力不足</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function acceptBanquet() {
  const customer = state.customers.find(c => c.isBanquet);
  if (!customer) return;
  const cfg = customer.banquetData;

  state.banquet = {
    level: cfg.level,
    name: cfg.name,
    requiredRecipeId: cfg.recipe,
    quote: cfg.quote,
    penalty: cfg.penalty,
    deadlineWeek: state.week + 3,
    prepAssignedChar: null,
    weeksLeft: 3,
    prepProgress: 0,
    isPrepDone: false 
  };

  // 把接单的客人移出
  state.customers = state.customers.filter(c => !c.isBanquet);
  
  closeModal();
  renderPage('home');
  renderStatus();
  alert('宴席已接单！请在 3 周内完成准备。');
}

// 渲染主页的宴席追踪栏
function renderBanquetTracker() {
  if (!state.banquet) return '';
  const b = state.banquet;
  const isUnlocked = state.unlockedPremium.indexOf(b.requiredRecipeId) >= 0;
  const recipe = RECIPES.find(x => x.id === b.requiredRecipeId);

  return `
    <div class="card" style="cursor:default;background:#fff3e0;border-color:#ff9800;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <b>🎊 ${b.name}筹备中</b>
        <span style="color:#d32f2f;font-weight:bold">剩 ${b.weeksLeft} 周</span>
      </div>
      <div class="ledger-row"><span>1. 解锁 ${recipe.name}</span><span>${isUnlocked?'✅':'❌'}</span></div>
      <div class="ledger-row"><span>2. 指派筹备人员</span><span>${b.prepAssignedChar?'✅':'❌'}</span></div>
      <div class="ledger-row"><span>3. 宴席当周全员精力≥20</span><span>（待判定）</span></div>
    </div>
  `;
}

// 获取不同角色的筹备效率
function getBanquetPrepRate(charId) {
  if (charId === 'kokono') return 100;
  if (charId === 'leye') return 80;
  if (charId === 'chisato') return 60;
  if (charId === 'ningetsu') return 50;
  if (charId === 'housaki') return 40;
  return 50; // 默认
}