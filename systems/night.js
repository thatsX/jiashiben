/* ============================================================
   systems/night.js —— 夜间经营系统（表现修正版）
   声望 = state.mafiaRep（黑道声誉）
   ============================================================ */

let nightCallback = null;

const NIGHT_STATIONS = [
  { id: 'front',   label: '前台' },
  { id: 'kitchen', label: '后厨' },
  { id: 'wash',    label: '洗碗' },
  { id: 'buy',     label: '采购' },
];

// ★ 委托人位置池（8 格，2 行 4 列，避免重叠）
const NIGHT_COMMISSION_SPOTS = [
  { x: 15, y: 62 }, { x: 38, y: 62 }, { x: 62, y: 62 }, { x: 85, y: 62 },
  { x: 15, y: 84 }, { x: 38, y: 84 }, { x: 62, y: 84 }, { x: 85, y: 84 },
];

// ★ 委托人立绘池
const COMMISSION_SPRITE_POOL = ['dolphin','bad_kid',"rikki"];

// ============================================================
//   状态初始化
// ============================================================
function ensureNightState() {
  if (!state.night) {
    state.night = {
      active: false,
      assignments: { front: null, kitchen: null, wash: null, buy: null },
      selectedRecipes: [],
      commissions: [],
      phase: 'idle',
    };
  }
}

function refreshUnlockedMafiaRecipes() {
  if (typeof MAFIA_RECIPES === 'undefined') return;
  // ★ 每次重建，只保留真正满足条件的记录
  const valid = [];
  MAFIA_RECIPES.forEach(r => {
    if (isMafiaRecipeUnlocked(r, r.owner)) valid.push(r.id);
  });
  state.unlockedMafiaRecipes = valid;
}

// ============================================================
//   入口
// ============================================================
function maybeStartNightBusiness(onDone) {
  if (!state.isMafia) {
    if (onDone) onDone();
    return;
  }
  nightCallback = onDone || null;
  ensureNightState();

  showModal(`
    <div style="text-align:center;padding:6px 0">
      <div style="font-size:36px">🌙</div>
      <h3 style="margin-top:6px">夜间经营</h3>
      <p style="font-size:13px;color:#666;margin-top:8px;line-height:1.7">
        白天的餐厅已经打烊了。<br>
        今晚要不要接一些……不太正经的活儿？
      </p>
      <div class="shop-info" style="margin-top:12px">
        <div class="ledger-row"><span>黑道声誉</span><span style="color:#b8860b;font-weight:bold">${state.mafiaRep || 0}</span></div>
      </div>
    </div>
    <button style="width:100%;margin-top:12px;background:#b8860b;color:#000" onclick="beginNight()">开始夜间经营</button>
    <button style="width:100%;margin-top:6px;background:#e0e0e0" onclick="skipNight()">今晚算了</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function beginNight() {
  ensureNightState();
  refreshUnlockedMafiaRecipes();
  
  // ★ 任务 D 自动触发拦截
  if (state.isMafia && typeof MAFIA_QUESTS !== 'undefined') {
    const q = MAFIA_QUESTS[state.mafiaQuestIdx];
    if (q && q.id === 'D') {
      closeModal();
      
      // ★ 直接推进任务指针，防止结算时二次触发
      state.mafiaQuestIdx++; 
      if (state.mafiaQuestIdx < MAFIA_QUESTS.length) {
        const nextQ = MAFIA_QUESTS[state.mafiaQuestIdx];
        state.mafiaDeadline = state.week + nextQ.deadlineAdd;
      }

      const script = (typeof MAFIA_QUESTS_SCRIPTS !== 'undefined' && MAFIA_QUESTS_SCRIPTS['D']) 
        ? MAFIA_QUESTS_SCRIPTS['D'] 
        : [{ text: '老爹派的警察来了，有意想不到的人解决了问题。' }];

      if (typeof playCutscene === 'function') {
        playCutscene({ lines: script }, () => {
          alert('【宁月】震慑了警察，今晚的突发状况解决了。夜间经营提前结束。');
          finishNight();
        });
      } else {
        finishNight();
      }
      return;
    }
  }

  //   原打工 / 原岗位全部清空，避免白天状态混入夜间
  characters.forEach(c => {
    c.current.task = 'rest';
    c.current.workShop = null;
    if (typeof assignHomeInitialPosition === 'function') {
      assignHomeInitialPosition(c);
    }
  });

  state.night.active = true;
  state.night.phase = 'assigning';
  state.night.assignments = { front: null, kitchen: null, wash: null, buy: null };
  state.night.selectedRecipes = [];
  state.night.commissions = [];
  state.night.talkedChars = [];

  closeModal();
  // ★ 关键：立刻重绘 home，让背后的普通客人图层被清空
  if (typeof renderPage === 'function') renderPage('home');

  // 短暂延迟再弹排班窗，避免 closeModal 和 showModal 撞在一起
  setTimeout(() => openNightAssign(), 30);
}

function skipNight() {
  closeModal();
  finishNight();
}

// ============================================================
//   排班
// ============================================================
function openNightAssign() {
  const rowsHTML = NIGHT_STATIONS.map(s => {
    const selected = state.night.assignments[s.id];
    const opts = ['<option value="">（无）</option>'];
    characters.forEach(c => {
      opts.push(`<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${c.name}</option>`);
    });
    return `
      <div class="schedule-row">
        <div class="schedule-info"><b>${s.label}</b></div>
        <select id="night-assign-${s.id}" onchange="onNightAssignChange('${s.id}', this.value)">
          ${opts.join('')}
        </select>
      </div>
    `;
  }).join('');

  const isQuestE = state.isMafia && typeof MAFIA_QUESTS !== 'undefined' && MAFIA_QUESTS[state.mafiaQuestIdx]?.id === 'E';
  const questETip = isQuestE ? `
    <div style="background:#ffebee;border:1px solid #d32f2f;padding:8px;border-radius:6px;margin-bottom:10px;font-size:12px;color:#d32f2f;line-height:1.5">
      <b>⚠ 教父的家训（特殊委托）：</b><br>
      似乎有某个家庭成员有话要说。必须安排<b>蕾叶</b>上岗，如果那人有空的话自然会带着委托前来……
    </div>
  ` : '';

  showModal(`
    <h3>🌙 今晚排班</h3>
    ${questETip}
    <p style="font-size:12px;color:#666;margin-bottom:10px">
      每个岗位一人，同一角色不可兼任。确认后锁定。
    </p>
    ${rowsHTML}
    <button style="width:100%;margin-top:12px;background:#b8860b;color:#000" onclick="confirmNightAssign()">确认排班</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function onNightAssignChange(station, charId) {
  ensureNightState();
  if (charId) {
    Object.keys(state.night.assignments).forEach(k => {
      if (k !== station && state.night.assignments[k] === charId) {
        state.night.assignments[k] = null;
        const el = document.getElementById('night-assign-' + k);
        if (el) el.value = '';
      }
    });
  }
  state.night.assignments[station] = charId || null;
}

function confirmNightAssign() {
  state.night.phase = 'menu';
  if (typeof renderPage === 'function') renderPage('home');
  openNightMenu();
}

// ============================================================
//   菜单
// ============================================================
function getNightCandidatesFor(charId, stationId) {
  if (typeof MAFIA_RECIPES === 'undefined') return [];
  return MAFIA_RECIPES.filter(r =>
    r.owner === charId &&
    r.attribute.indexOf(stationId) >= 0 &&
    isMafiaRecipeUnlocked(r, charId)
  );
}

function isMafiaRecipeUnlocked(recipe, charId) {
  // 预设菜谱永远可用
  if (recipe.source === 'preset' || !recipe.unlock) return true;
  // ★ 按角色查本人打工次数（不再用 shop.workCount）
  const owner = charId || recipe.owner;
  const counts = (state.mafiaCharWorkCount || {})[owner] || {};
  return (counts[recipe.unlock.shopId] || 0) >= recipe.unlock.count;
}

function openNightMenu() {
  refreshUnlockedMafiaRecipes();

  const sections = NIGHT_STATIONS.map(s => {
    const charId = state.night.assignments[s.id];
    if (!charId) return '';
    const c = characters.find(x => x.id === charId);
    if (!c) return '';
    const cands = getNightCandidatesFor(charId, s.id);
    if (cands.length === 0) {
      return `<div style="margin-bottom:12px">
        <b>${s.label} · ${c.name}</b>
        <div style="font-size:12px;color:#888;padding:6px 0">无可用菜谱</div>
      </div>`;
    }
    const cards = cands.map(r => {
      const sel = state.night.selectedRecipes.indexOf(r.id) >= 0;
      const attrText = r.attribute.map(a => ({
        front: '前台', kitchen: '后厨', wash: '洗碗', buy: '采购',
      })[a]).join(' / ');
      return `
        <div class="recipe-item ${sel ? 'selected' : ''}" onclick="toggleNightRecipe('${r.id}')">
          <div class="recipe-info">
            <div><b>${r.name}</b></div>
            <div style="font-size:11px;color:#888">属性：${attrText}</div>
          </div>
          <div class="recipe-check">${sel ? '✔' : ''}</div>
        </div>
      `;
    }).join('');
    return `<div style="margin-bottom:14px"><b>${s.label} · ${c.name}</b>${cards}</div>`;
  }).join('');

  const empty = state.night.selectedRecipes.length === 0;

  showModal(`
    <h3>🌙 今夜菜单</h3>
    <p style="font-size:12px;color:#666;margin-bottom:10px">
      勾选要挂出的黑道菜谱。确认后生成委托。
    </p>
    ${sections || '<p style="text-align:center;color:#888;padding:20px 0">今晚没有可挂的菜谱。</p>'}
    <button style="width:100%;margin-top:12px;background:#b8860b;color:#000" onclick="confirmNightMenu()">
      ${empty ? '菜单为空 · 结束今晚' : '确认菜单'}
    </button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function toggleNightRecipe(rid) {
  const idx = state.night.selectedRecipes.indexOf(rid);
  if (idx >= 0) state.night.selectedRecipes.splice(idx, 1);
  else state.night.selectedRecipes.push(rid);
  openNightMenu();
}

function confirmNightMenu() {
  if (state.night.selectedRecipes.length === 0) {
    showModal(`
      <p style="text-align:center;padding:20px 0;font-size:14px">今晚没有可接的事务。</p>
      <button style="width:100%" onclick="closeModal(); finishNight()">结束今晚</button>
    `);
    document.getElementById('modal-btn').style.display = 'none';
    return;
  }

  state.night.commissions = generateNightCommissions();
  // ★ 任务 E 特殊判定：注入心玖委托人
  if (state.isMafia && typeof MAFIA_QUESTS !== 'undefined') {
    const q = MAFIA_QUESTS[state.mafiaQuestIdx];
    if (q && q.id === 'E' && q.current < q.target) {
      const a = state.night.assignments;
      const leyeIn = Object.values(a).includes('leye');
      const kokonoIn = Object.values(a).includes('kokono');
      
      if (leyeIn && !kokonoIn) {
        // 强行插入一个心玖的特殊委托
        state.night.commissions.push({
          id: 'nc_special_kokono',
          fromRecipe: 'special_kokono',
          title: '家庭会议',
          desc: '心玖抱臂站在门口，手里拿着一本厚厚的家训。',
          assignee: 'leye', // 由蕾叶接取
          successRate: 1,
          income: 0,
          energyCost: 0,
          failPenalty: { reputationDelta: 0, energyPenalty: 0, moneyPenalty: 0 },
          status: 'pending',
          leftTrace: false,
          _spriteId: 'kokono', // 用角色立绘，如果 assets/customers 里没有心玖，等会儿加个兜底
          _pos: { x: 50, y: 70 }, // 站中间
          isQuestE: true
        });
      }
    }
  }

  state.night.phase = 'taking';

  closeModal();
  if (typeof renderPage === 'function') renderPage('home');
}

// ============================================================
//   委托生成 + 位置分配
// ============================================================
function getNightCommissionCount() {
  const rep = state.mafiaRep || 0;
  let n = 0;
  for (const t of COMMISSION_COUNT_TABLE) {
    if (rep >= t.minRep) n = t.count;
    else break;
  }
  return n;
}

function generateNightCommissions() {
  const M = state.night.selectedRecipes.length;
  if (M === 0) return [];
  if (typeof COMMISSION_COUNT_TABLE === 'undefined') return [];

  const N = getNightCommissionCount();
  if (N <= 0) return [];

  const base = Math.floor(N / M);
  const R = N - base * M;

  const extra = new Array(M).fill(0);
  const idxs = [];
  for (let i = 0; i < M; i++) idxs.push(i);
  idxs.sort(() => Math.random() - 0.5);
  for (let i = 0; i < R && i < idxs.length; i++) extra[idxs[i]] = 1;

  const commissions = [];
  state.night.selectedRecipes.forEach((rid, i) => {
    const recipe = MAFIA_RECIPES.find(r => r.id === rid);
    if (!recipe) return;
    const pool = (typeof COMMISSION_POOLS !== 'undefined' && COMMISSION_POOLS[recipe.poolId]) || [];
    const take = base + extra[i];
    if (take <= 0 || pool.length === 0) return;
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, take);
    picked.forEach(tpl => {
      commissions.push(buildCommission(tpl, recipe));
    });
  });

  assignCommissionPositions(commissions);
  return commissions;
}

function buildCommission(tpl, recipe) {
  const mod = CHARACTER_MAFIA_MODIFIERS[recipe.owner] || {
    successBonus: 0, incomeBonus: 0, energyEfficiency: 0, penaltyResistance: 0,
  };
  const b = tpl.base;
  const successRate = Math.max(0, Math.min(1, b.successRate * (1 + mod.successBonus)));
  const income = Math.round(b.income * (1 + mod.incomeBonus));
  const energyCost = Math.max(1, Math.round(b.energyCost * (1 - mod.energyEfficiency)));
  const pr = 1 - mod.penaltyResistance;
  const failPenalty = {
    reputationDelta: Math.round(b.failPenalty.reputationDelta * pr),
    energyPenalty: Math.max(0, Math.round(b.failPenalty.energyPenalty * pr)),
    moneyPenalty: Math.max(0, Math.round(b.failPenalty.moneyPenalty * pr)),
  };
  const spriteId = COMMISSION_SPRITE_POOL[Math.floor(Math.random() * COMMISSION_SPRITE_POOL.length)];

  return {
    id: 'nc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    fromRecipe: recipe.id,
    poolId: recipe.poolId,
    title: tpl.title,
    desc: tpl.desc,
    assignee: recipe.owner,
    recipeAttr: recipe.attribute,
    successRate,
    income,
    energyCost,
    failPenalty,
    status: 'pending',
    leftTrace: false,
    _spriteId: spriteId,
    _pos: null,
  };
}

// ★ 位置池洗牌分配，保证不重叠
function assignCommissionPositions(commissions) {
  const spots = NIGHT_COMMISSION_SPOTS.slice();
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = spots[i]; spots[i] = spots[j]; spots[j] = tmp;
  }
  commissions.forEach((c, i) => {
    if (i < spots.length) {
      c._pos = { x: spots[i].x, y: spots[i].y };
    } else {
      // 超出 8 条时抖动复用
      const base = spots[i % spots.length];
      c._pos = {
        x: base.x + (Math.random() - 0.5) * 10,
        y: base.y + (Math.random() - 0.5) * 5,
      };
    }
  });
}

// ============================================================
//   委托人渲染（复用顾客立绘 + 金色委托气泡）
// ============================================================
function renderNightCommissions() {
  const scene = document.getElementById('scene-restaurant');
  if (!scene) return;

  let layer = document.getElementById('layer-night-commissions');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'layer-night-commissions';
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:7;';
    scene.appendChild(layer);
  }

  const pending = state.night.commissions.filter(c => c.status === 'pending');
  layer.innerHTML = pending.map(c => {
    const pos = c._pos || { x: 50, y: 70 };
    const spriteId = c._spriteId || 'worker';
    return `
      <div class="sprite customer-sprite"
           style="left:${pos.x}%;top:${pos.y}%;pointer-events:auto;cursor:pointer;"
           onclick="openCommissionDetail('${c.id}')">
        <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);
                    background:#b8860b;color:#fff;border:2px solid #000;border-radius:8px;
                    padding:2px 8px;font-size:11px;font-weight:bold;white-space:nowrap;
                    box-shadow:0 2px 6px rgba(0,0,0,0.35);
                    animation:musicPulse 1.2s ease-in-out infinite;">委托</div>
        <img src="assets/customers/${spriteId}.png"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
        <div class="sprite-fallback" style="display:none;">
          <div class="fb-head"></div>
          <div class="fb-body"></div>
        </div>
        <div class="sprite-label">${c.title}</div>
      </div>
    `;
  }).join('');
}

// ============================================================
//   委托详情
// ============================================================
function openCommissionDetail(uid) {
  if (!state.night || !state.night.commissions) return;
  const c = state.night.commissions.find(x => x.id === uid);
  if (!c || c.status !== 'pending') return;

  // ★ 任务 E 拦截，直接启动小游戏
  if (c.isQuestE) {
    closeModal();
    mgFinishCallback = function(win) {
      // 标记委托完成
      c.status = 'accepted';
      
      // 推进极道任务
      if (typeof MAFIA_QUESTS !== 'undefined') {
        const q = MAFIA_QUESTS[state.mafiaQuestIdx];
        if (q && q.id === 'E') {
          q.current = q.target; // 强制达成，下周结算推进
          state.mafiaRep += win ? 120 : 100;
          state.mafiaQuestIdx++;
          if (state.mafiaQuestIdx < MAFIA_QUESTS.length) {
            const nextQ = MAFIA_QUESTS[state.mafiaQuestIdx];
            state.mafiaDeadline = state.week + nextQ.deadlineAdd;
          }
        }
      }
      if (typeof MAFIA_QUESTS_SCRIPTS !== 'undefined' && MAFIA_QUESTS_SCRIPTS['E']) {
        if (typeof playCutscene === 'function') {
          playCutscene({ lines: MAFIA_QUESTS_SCRIPTS['E'] }, () => {
            if (state.isMafia && !MAFIA_QUESTS[state.mafiaQuestIdx]) {
              closeModal();
              startFinalBattle();
              return;
            }
            afterCommissionHandled();
          });
        } else {
          afterCommissionHandled();
        }
      } else {
        afterCommissionHandled();
      }
    };
    
    // 需要引入小游戏脚本并启动
    if (typeof startKokonoMinigame === 'function') {
      startKokonoMinigame(mgFinishCallback);
    } else {
      alert('小游戏模块未加载！');
      c.status = 'accepted';
      afterCommissionHandled();
    }
    return;
  }


  const assignee = characters.find(x => x.id === c.assignee);
  const canAccept = assignee && assignee.current.energy >= c.energyCost;

  const fpArr = [];
  if (c.failPenalty.reputationDelta) fpArr.push(`声誉 ${c.failPenalty.reputationDelta}`);
  if (c.failPenalty.energyPenalty)    fpArr.push(`精力 -${c.failPenalty.energyPenalty}`);
  if (c.failPenalty.moneyPenalty)     fpArr.push(`金钱 -${c.failPenalty.moneyPenalty}`);
  const fpStr = fpArr.length ? fpArr.join('，') : '无';

  showModal(`
    <h3>📜 ${c.title}</h3>
    <p style="font-size:13px;color:#666;margin:8px 0 12px">${c.desc}</p>
    <div class="shop-info">
      <div class="ledger-row"><span>接取人</span><span>${assignee ? assignee.name : '?'}（精力 ${Math.round(assignee.current.energy)}）</span></div>
      <div class="ledger-row"><span>成功率</span><span>${Math.round(c.successRate * 100)}%</span></div>
      <div class="ledger-row"><span>预计收入</span><span style="color:#4caf50">${c.income}</span></div>
      <div class="ledger-row"><span>精力消耗</span><span>${c.energyCost}</span></div>
      <div class="ledger-row"><span>失败惩罚</span><span style="color:#d32f2f">${fpStr}</span></div>
    </div>
    <button style="width:100%;margin-top:12px;background:${canAccept ? '#b8860b' : '#ccc'};color:#000"
            ${canAccept ? '' : 'disabled'}
            onclick="acceptCommission('${c.id}')">
      ${canAccept ? '接受' : '精力不足'}
    </button>
    <button style="width:100%;margin-top:6px;background:#e0e0e0" onclick="rejectCommission('${c.id}')">拒绝</button>
    <button style="width:100%;margin-top:6px;background:#f5f5f5" onclick="closeModal()">再想想</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function acceptCommission(uid) {
  if (!state.night || !state.night.commissions) return;
  const c = state.night.commissions.find(x => x.id === uid);
  if (!c || c.status !== 'pending') return;
  const assignee = characters.find(x => x.id === c.assignee);
  if (!assignee || assignee.current.energy < c.energyCost) return;

  assignee.current.energy = Math.max(0, assignee.current.energy - c.energyCost);

  // ★ 任务 A/B/C 的进度判定
  if (state.isMafia && typeof MAFIA_QUESTS !== 'undefined') {
    const q = MAFIA_QUESTS[state.mafiaQuestIdx];
    if (q) {
      // 任务 A & B：特定角色的特定岗位委托
      if (q.type === 'commission_assignee' && q.assignee === c.assignee) {
        // 检查岗位属性是否匹配
        const matchAttr = q.filterAttr.some(attr => c.recipeAttr && c.recipeAttr.indexOf(attr) >= 0);
        if (matchAttr) {
          q.current = (q.current || 0) + 1;
        }
      }
      // 任务 C：黑道累计收入
      if (q.type === 'mafia_income') {
        // 注意：这里先累加，失败的话要扣除吗？文档说“建议只算正向收入”，所以我们在成功分支里加
        // 但是成功判断在下面，这里先不处理 C，转移到下面
      }
    }
  }

  const success = Math.random() < c.successRate;
  c.status = 'accepted';

  if (success) {
    state.cash += c.income;
    state.mafiaRep += 20;
    if (state.isMafia && typeof MAFIA_QUESTS !== 'undefined') {
      const q = MAFIA_QUESTS[state.mafiaQuestIdx];
      if (q && q.type === 'mafia_income') {
        q.current = (q.current || 0) + c.income;
      }
    }
    showModal(`
      <div style="text-align:center;padding:10px 0">
        <div style="font-size:48px">✅</div>
        <h3 style="color:#4caf50;margin-top:8px">委托成功</h3>
        <p style="margin-top:10px;font-size:13px">收入 +${c.income}，黑道声誉 +20</p>
      </div>
      <button style="width:100%" onclick="closeModal(); afterCommissionHandled()">好的</button>
    `);
  } else {
    state.mafiaRep = Math.max(0, state.mafiaRep + c.failPenalty.reputationDelta);
    state.reputation = Math.max(0, Math.min(100, state.reputation + c.failPenalty.reputationDelta));
    assignee.current.energy = Math.max(0, assignee.current.energy - c.failPenalty.energyPenalty);
    state.cash = Math.max(0, state.cash - c.failPenalty.moneyPenalty);
    c.leftTrace = true;
    const trace = (typeof FAIL_TRACE_TABLE !== 'undefined' && FAIL_TRACE_TABLE[c.poolId]) ? FAIL_TRACE_TABLE[c.poolId].desc : '';
    showModal(`
      <div style="text-align:center;padding:10px 0">
        <div style="font-size:48px">💥</div>
        <h3 style="color:#d32f2f;margin-top:8px">委托失败</h3>
        <p style="margin-top:10px;font-size:13px;line-height:1.7">
          留下了痕迹……<br>
          <span style="color:#888;font-size:12px">${trace}</span>
        </p>
      </div>
      <button style="width:100%" onclick="closeModal(); afterCommissionHandled()">好的</button>
    `);
  }
  document.getElementById('modal-btn').style.display = 'none';
  renderStatus();
}

function rejectCommission(uid) {
  if (!state.night || !state.night.commissions) return;
  const c = state.night.commissions.find(x => x.id === uid);
  if (!c || c.status !== 'pending') return;
  c.status = 'rejected';
  closeModal();
  afterCommissionHandled();
}

function afterCommissionHandled() {
  if (typeof renderPage === 'function') renderPage('home');
  renderStatus();

  const remain = state.night.commissions.filter(c => c.status === 'pending').length;
  if (remain === 0) {
    setTimeout(() => settleNight(), 100);
  }
}

// ============================================================
//   夜间结算
// ============================================================
function settleNight() {
  if (!state.night) return;
  if (state.night.phase === 'idle') return;

  const accepted = state.night.commissions.filter(c => c.status === 'accepted');
  const rejected = state.night.commissions.filter(c => c.status === 'rejected');
  const pending  = state.night.commissions.filter(c => c.status === 'pending');
  const failed   = accepted.filter(c => c.leftTrace);
  const succeeded= accepted.filter(c => !c.leftTrace);
  const totalIncome = succeeded.reduce((s, c) => s + c.income, 0);

  const rows = state.night.commissions.map(c => {
    let text, color;
    if (c.status === 'accepted') {
      if (c.leftTrace) { text = '❌ 失败'; color = '#d32f2f'; }
      else             { text = '✅ 成功'; color = '#4caf50'; }
    } else if (c.status === 'rejected') { text = '— 拒绝'; color = '#888'; }
    else                                 { text = '— 放弃'; color = '#888'; }
    return `<div class="ledger-row"><span>${c.title}</span><span style="color:${color}">${text}</span></div>`;
  }).join('');

  state.night.phase = 'settled';

  showModal(`
    <h3>🌙 今夜算账</h3>
    <div class="shop-info">
      <div class="ledger-row"><span>共生成</span><span>${state.night.commissions.length} 条委托</span></div>
      <div class="ledger-row"><span>成功 / 失败</span><span>${succeeded.length} / ${failed.length}</span></div>
      <div class="ledger-row"><span>拒绝 / 放弃</span><span>${rejected.length} / ${pending.length}</span></div>
      <div class="ledger-row"><span>今夜收入</span><span style="color:#4caf50;font-weight:bold">+${totalIncome}</span></div>
      ${failed.length ? `<div class="ledger-row"><span>留下痕迹</span><span style="color:#d32f2f;font-weight:bold">${failed.length} 条</span></div>` : ''}
    </div>
    <h4 style="margin-top:12px;font-size:13px">委托明细</h4>
    <div class="shop-info">
      ${rows || '<div style="text-align:center;color:#888;padding:6px;font-size:12px">今晚没有委托</div>'}
    </div>
    <p style="font-size:11px;color:#888;margin-top:8px">
      未处理的委托视为放弃，不判定、不扣精力、无后果。<br>
      失败痕迹已记录，将在后续周触发事件。
    </p>
    <button style="width:100%;margin-top:12px;background:#b8860b;color:#000" onclick="closeModal(); finishNight()">结束今晚</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function finishNight() {
  if (!state.night) {
    if (nightCallback) { const cb = nightCallback; nightCallback = null; cb(); }
    return;
  }

  state.night.active = false;
  state.night.assignments = { front: null, kitchen: null, wash: null, buy: null };
  state.night.selectedRecipes = [];
  state.night.commissions = [];
  state.night.phase = 'idle';

  const layer = document.getElementById('layer-night-commissions');
  if (layer) layer.remove();

  // ★ 恢复普通客人图层显示
  const custLayer = document.getElementById('layer-customers');
  if (custLayer) custLayer.style.display = '';

  if (typeof renderPage === 'function') renderPage('home');
  renderStatus();

  const cb = nightCallback;
  nightCallback = null;
  if (cb) cb();
}

/* ============================================================
   夜间经营：三个页面（家庭 / 商店街 / 菜单）
   ============================================================ */

// ============================================================
//   家庭页（夜间）
// ============================================================
/* ★ 睡眠图兜底：_sleep.png → 正常图 → 简易人形 */
function nightBedErr(img, fallbackSrc) {
  if (!img) return;
  img.onerror = null;
  if (img.src && img.src.indexOf('_sleep') >= 0) {
    img.src = fallbackSrc;
    img.onerror = function () {
      img.style.display = 'none';
      const fb = img.parentElement && img.parentElement.querySelector('.sprite-fallback');
      if (fb) fb.style.display = 'flex';
    };
  } else {
    img.style.display = 'none';
    const fb = img.parentElement && img.parentElement.querySelector('.sprite-fallback');
    if (fb) fb.style.display = 'flex';
  }
}

function renderNightFamily() {
  const el = document.getElementById('page-family');
  if (!el) return;

  const a = (state.night && state.night.assignments) || {};
  const assignedIds = Object.keys(a).map(k => a[k]).filter(Boolean);

  const isQuestEActive = (state.night && state.night.commissions) 
    ? state.night.commissions.some(c => c.isQuestE) : false;

  // ★ 固定床位（5 人各一格，2 行 3+2）
  const BEDS = [
    { id: 'leye',     x: 20, y: 38 },
    { id: 'kokono',   x: 50, y: 38 },
    { id: 'housaki',  x: 80, y: 38 },
    { id: 'chisato',  x: 35, y: 76 },
    { id: 'ningetsu', x: 65, y: 76 },
  ];

  const slotsHTML = BEDS.map(bed => {
    const c = characters.find(x => x.id === bed.id);
    if (!c) return '';
    const isWorking = assignedIds.indexOf(c.id) >= 0;

    const isAway = assignedIds.indexOf(c.id) >= 0 || (c.id === 'kokono' && isQuestEActive);

    // 排班去了 → 空床
    if (isAway) {
      return `
        <div style="position:absolute;left:${bed.x}%;top:${bed.y}%;transform:translate(-50%,-50%);
                    width:110px;height:120px;border:2px dashed rgba(255,255,255,0.3);
                    border-radius:10px;background:rgba(0,0,0,0.12);"></div>
      `;
    }

    // 睡觉中
    const sleepSrc = `assets/sprites/${c.id}_sleep.png`;
    const fallbackSrc = `assets/sprites/${c.id}.png`;
    return `
        <div style="position:absolute;left:${bed.x}%;top:${bed.y}%;transform:translate(-50%,-50%);
                  width:110px;height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;
                  border:2px dashed rgba(255,255,255,0.55);border-radius:10px;background:rgba(255,255,255,0.12);
                  cursor:pointer;pointer-events:auto;"
           onclick="nightSleepTalk('${c.id}')">
        <img src="${sleepSrc}" onerror="nightBedErr(this,'${fallbackSrc}')"
             style="max-width:100%;max-height:88px;object-fit:contain;display:block;">
        <div class="sprite-fallback" style="display:none;width:80px;height:90px;position:relative;
                    align-items:center;justify-content:center;">
          <div class="fb-head"></div>
          <div class="fb-body"></div>
        </div>
        <div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);
                    background:rgba(0,0,0,0.7);color:#fff;font-size:10px;padding:1px 6px;border-radius:8px;
                    white-space:nowrap;">${c.name}</div>
      </div>
    `;
  }).join('');

  const cardsHTML = characters.map(c => {
    const stationId = Object.keys(a).find(k => a[k] === c.id);
    const stationLabel = stationId
      ? ({ front: '前台', kitchen: '后厨', wash: '洗碗', buy: '采购' })[stationId]
      : null;
    const energyPct = (c.current.energy / c.traits.energyMax) * 100;

    let statusTag = '';
    if (stationLabel) {
      statusTag = `<span class="status-tag working">夜间 · ${stationLabel}</span>`;
    } else if (c.id === 'kokono' && isQuestEActive) {
      statusTag = `<span class="status-tag working" style="background:#ffebee;color:#d32f2f;border-color:#d32f2f">在楼下等着清算你呢……</span>`;
    } else {
      statusTag = `<span class="status-tag resting">睡觉中</span>`;
    }

    return `
      <div class="status-card" style="cursor:pointer" onclick="${stationLabel ? 'nightTalkToChar' : (c.id === 'kokono' && isQuestEActive ? 'closeModal()' : 'nightSleepTalk')}('${c.id}')">
        <div class="status-avatar">${avatarHTML(c.id, 'chars', 52)}</div>
        <div class="status-info">
          <div class="status-name">
            <b>${c.name}</b>
            ${statusTag}
          </div>
          <div class="status-energy">
            <div class="status-energy-bar">
              <div class="status-energy-fill" style="width:${energyPct}%"></div>
            </div>
            <span class="status-energy-text">${Math.round(c.current.energy)}/${c.traits.energyMax}</span>
          </div>
          <div class="status-line"><b>好感：</b>${c.current.affinity}</div>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <h3>🌙 今夜的房间</h3>

    <div style="position:relative;width:100%;height:380px;border:2px solid #333;border-radius:8px;overflow:hidden;
                background:#2a2a3a url('assets/bg/bedroom.png') center/cover;">
      <div style="position:absolute;inset:0;background:rgba(15,15,35,0.45);"></div>
      <div style="position:absolute;inset:0;pointer-events:none;">
        ${slotsHTML}
      </div>
    </div>

    <p style="font-size:11px;color:#888;text-align:center;margin:8px 0 12px;line-height:1.6">
      排班中的家人在外忙，没有排班的在房间里休息。
    </p>

    <h4 style="margin-top:4px">成员状态</h4>
    <div class="family-status-list">
      ${cardsHTML}
    </div>
  `;
}

// ============================================================
//   商店街（夜间）
// ============================================================
function renderNightShop() {
  const el = document.getElementById('page-shop');
  if (!el) return;

  const commissions = (state.night && state.night.commissions) || [];
  const pending  = commissions.filter(c => c.status === 'pending');
  const accepted = commissions.filter(c => c.status === 'accepted');
  const rejected = commissions.filter(c => c.status === 'rejected');

  let listHTML;
  if (commissions.length === 0) {
    listHTML = `<p style="text-align:center;color:#888;padding:24px 0;font-size:13px;line-height:1.7">
      今夜还没有委托。<br>若还没挂菜，请回首页继续夜间流程。
    </p>`;
  } else if (pending.length === 0) {
    listHTML = `<p style="text-align:center;color:#888;padding:24px 0;font-size:13px;line-height:1.7">
      所有委托已处理完毕。<br>回到首页点击「算账」结束今晚。
    </p>`;
  } else {
    listHTML = pending.map(c => {
      const assignee = characters.find(x => x.id === c.assignee);
      const canAccept = assignee && assignee.current.energy >= c.energyCost;
      return `
        <div class="card" style="cursor:pointer;margin-bottom:8px"
             onclick="openCommissionDetail('${c.id}')">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <b>📜 ${c.title}</b>
            <span style="color:#888;font-size:12px">${assignee ? assignee.name : '?'}</span>
          </div>
          <div style="font-size:12px;color:#666;line-height:1.6">${c.desc}</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px">
            <span>成功率 ${Math.round(c.successRate * 100)}%</span>
            <span style="color:#4caf50">+${c.income}</span>
            <span style="color:${canAccept ? '#666' : '#d32f2f'}">精力 ${c.energyCost}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  el.innerHTML = `
    <div style="padding:12px;overflow-y:auto;height:100%;box-sizing:border-box">
      <h3>🌙 夜巷委托</h3>
      <div class="card" style="cursor:default;background:#fff8e1;border-color:#b8860b;margin-bottom:12px">
        <div class="ledger-row"><span>共生成</span><span>${commissions.length}</span></div>
        <div class="ledger-row"><span>待处理</span><span style="color:#d32f2f;font-weight:bold">${pending.length}</span></div>
        <div class="ledger-row"><span>已处理</span><span>${accepted.length + rejected.length}</span></div>
      </div>
      <p style="font-size:12px;color:#666;margin-bottom:10px;line-height:1.6">
        点击卡片查看委托详情，也可回首页点击场景里的委托人。
      </p>
      ${listHTML}
    </div>
  `;
}

// ============================================================
//   菜单（夜间）
// ============================================================
function renderNightMenu() {
  const el = document.getElementById('page-menu');
  if (!el) return;

  const selected = (state.night && state.night.selectedRecipes) || [];
  const commissions = (state.night && state.night.commissions) || [];

  const countByRecipe = {};
  commissions.forEach(c => {
    countByRecipe[c.fromRecipe] = (countByRecipe[c.fromRecipe] || 0) + 1;
  });

  const listHTML = selected.length > 0
    ? selected.map(rid => {
        const r = (typeof MAFIA_RECIPES !== 'undefined')
          ? MAFIA_RECIPES.find(x => x.id === rid) : null;
        if (!r) return '';
        const owner = characters.find(c => c.id === r.owner);
        const attrText = r.attribute.map(a => ({
          front: '前台', kitchen: '后厨', wash: '洗碗', buy: '采购',
        })[a]).join(' / ');
        return `
          <div class="card" style="cursor:default;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <b>${r.name}</b>
                <div style="font-size:11px;color:#888;margin-top:2px">
                  ${owner ? owner.name : r.owner} · ${attrText}
                </div>
              </div>
              <div style="text-align:right;min-width:60px">
                <div style="font-size:10px;color:#666">已生成委托</div>
                <div style="font-size:16px;font-weight:bold;color:#b8860b">${countByRecipe[rid] || 0}</div>
              </div>
            </div>
          </div>
        `;
      }).join('')
    : `<p style="text-align:center;color:#888;padding:24px 0;font-size:13px">
        今晚没有挂任何菜谱。
      </p>`;

  el.innerHTML = `
    <h3>🌙 今夜菜单（已锁定）</h3>
    <div class="card" style="cursor:default;background:#fff8e1;border-color:#b8860b;margin-bottom:12px">
      <div class="ledger-row"><span>已挂菜谱</span><span>${selected.length} 道</span></div>
      <div class="ledger-row"><span>生成委托</span><span>${commissions.length} 条</span></div>
      <p style="font-size:11px;color:#888;margin-top:6px;margin-bottom:0">
        夜间菜单已锁定，无法修改。
      </p>
    </div>
    ${listHTML}
    <p style="font-size:11px;color:#888;margin-top:14px;text-align:center;line-height:1.6">
      回到首页点击委托人处理委托，或点击底部「算账」结束今晚。
    </p>
  `;
}

/* ============================================================
   夜间对话
   ============================================================ */

function nightTalkToChar(charId) {
  if (!state.night) return;
  if (!state.night.talkedChars) state.night.talkedChars = [];

  const c = characters.find(x => x.id === charId);
  if (!c) return;

  if (state.night.talkedChars.indexOf(charId) >= 0) {
    showModal(`<p style="text-align:center;color:#888;padding:20px 0">今晚已经和${c.name}聊过了。</p>`);
    document.getElementById('modal-btn').textContent = '关闭';
    return;
  }

  const lines = (typeof MAFIA_TALK !== 'undefined' && MAFIA_TALK[charId]) || ['……'];
  const line = lines[Math.floor(Math.random() * lines.length)];

  c.current.affinity += 5;
  state.night.talkedChars.push(charId);

  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      ${avatarHTML(c.id, 'chars', 64)}
      <h3 style="margin-top:6px">${c.name}</h3>
    </div>
    <div class="talk-bubble">
      <p>“${line}”</p>
    </div>
    <p style="text-align:center;color:#4caf50;font-size:13px;margin-top:12px;font-weight:bold">
      好感 +5（当前 ${c.current.affinity}）
    </p>
  `);
  document.getElementById('modal-btn').textContent = '关闭';

  if (typeof renderPage === 'function') renderPage('home');
}

function nightSleepTalk(charId) {
  if (!state.night) return;
  if (!state.night.talkedChars) state.night.talkedChars = [];

  const c = characters.find(x => x.id === charId);
  if (!c) return;

  if (state.night.talkedChars.indexOf(charId) >= 0) {
    showModal(`<p style="text-align:center;color:#888;padding:20px 0">${c.name}翻了个身，又睡过去了。</p>`);
    document.getElementById('modal-btn').textContent = '关闭';
    return;
  }

  const lines = (typeof MAFIA_SLEEP_TALK !== 'undefined' && MAFIA_SLEEP_TALK[charId]) || ['……zzz……'];
  const line = lines[Math.floor(Math.random() * lines.length)];

  state.night.talkedChars.push(charId);

  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      ${avatarHTML(c.id, 'chars', 64)}
      <h3 style="margin-top:6px">${c.name}（睡梦中）</h3>
    </div>
    <div class="talk-bubble" style="background:#f5f5f5">
      <p style="color:#666">“${line}”</p>
    </div>
    <p style="text-align:center;color:#888;font-size:12px;margin-top:12px">
      好像说了什么梦话。
    </p>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

/* ============================================================
   夜间：A形立牌浏览 & 黑道评价
   ============================================================ */

function openNightPosterModal() {
  if (!state.night || !state.night.active) return;

  const a = state.night.assignments;
  const rep = state.mafiaRep || 0;
  const comment = getMafiaComment(rep);

  // ★ 定义每个人对应的黑道职位
  const MAFIA_ROLE_TAGS = {
    leye:     '组长',
    kokono:   '若头',
    housaki:  '若众',
    chisato:  '舍弟',
    ningetsu: '教子',
  };

  // ★ 只生成「职位 + 名字」，不加岗位名称
  const tagHTML = (id) => {
    if (!id) return `<div class="a-tag">（空缺）</div>`;
    const c = characters.find(x => x.id === id);
    if (!c) return '';
    const role = MAFIA_ROLE_TAGS[c.id] || '成员';
    return `<div class="a-tag">${role} ${c.name}</div>`;
  };

  showModal(`
    <div style="display:flex;flex-direction:column;align-items:center;padding-top:10px">
      
      <!-- 大立牌预览 -->
      <div class="a-stand-modal">
        <div class="a-stand-board">
          <img src="assets/ui/poster.png" class="a-stand-poster">
          <div class="a-stand-tags">
            ${tagHTML(a.front)}
            ${tagHTML(a.kitchen)}
            ${tagHTML(a.wash)}
            ${tagHTML(a.buy)}
          </div>
        </div>
        <div class="a-stand-legs"></div>
      </div>

      <!-- 黑道评价 -->
      <h4 style="width:100%;text-align:left;color:#b8860b;margin-bottom:8px;font-size:14px;">
        路人的评价（当前声誉：${rep}）
      </h4>
      <div class="talk-bubble" style="background:#222;color:#eee;border-color:#b8860b;width:100%;box-sizing:border-box;text-align:left;margin-top:0;">
        <p style="font-size:13px;line-height:1.7;">${comment}</p>
      </div>
    </div>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function getMafiaComment(rep) {
  let pool = [];
  if (rep < 50) {
    pool = [
      "“须贺组？……不是这里吧？这几个高中生要干什么？”",
      "“设计这个牌子的不是个大佬就是个神人……”",
      "“估计是一时兴起吧。要不要打个赌，这牌子能立几天？”"
    ];
  } else if (rep < 100) {
    pool = [
      "“大哥，我们真的要跟这里混吗？”  “废话！到新兴的堂口混才有出头的机会！”  “但是大哥，上次你拜把子的那个不是千樱梨联盟的组长吗？为什么又变成须贺组了？”",
      "“上次在这儿办的事干脆利落。哪怕是作为雇佣兵的我都有些钦佩。”",
      "“怎么感觉她们的组长长得有点像上次给我送外卖的骑手？”",
      "“有需要‘料理’的，记得交给那个白头发的……就属她最靠谱，别的几个有点难搞……”"
    ];
  } else if (rep < 150) {
    pool = [
      "“负责善后的那家伙像个幽灵一样……到现在都没人知道长什么样。不过那也是应该的……作为善后之人来说。”",
      "“大哥，我们现在到底是须贺组的、FAMILY的还是千樱梨联盟的人啊？”  “蠢货，当然是看哪位大人在场！”",
      "“记住，进去就找须贺老大求情，她比较好说话。只要你说服她了，她会帮你跟马桥老大求情的……”",
      "“这个带FAMILY后缀的须贺组和那个须贺组到底是什么关系？有人说是一家，有人又说不对付。”"
    ];
  } else if (rep < 200) {
    pool = [
      "“大哥，我发现马桥老大一出现，千樱梨组长和须贺老大都跟被霜打了一样。以后我们就自称马桥组组员吧。”",
      "“以后看到这个彩虹色的牌子，就要跟见了教父本人一样，听到没？……我知道对着这个牌子憋笑很难，但是这是命令！”",
      "“以前在这里委托多舒心，现在名气大了还要排队了……唉，谁让我管的那条街现在在FAMILY的势力范围里面了，想找别人也不好使啊。”",
      "“所以教父大人天天强调的FAMILY到底是什么？”  “真拿你没办法，坐好咯，所谓family，就是住在同一个屋檐下，一起吃饭，一起生活，一起玩……呃，玩黑道？玩乐队？糟了，要被须贺老大罚了……”"
    ];
  } else {
    pool = [
      "“传说中的FAMILY……居然就在这种不起眼的地方。”  “一直都在这里，白天还能来吃饭呢。”  “啊？”",
      "（紧张地自言自语）“教母大人原谅我，我做错了…原谅我，我做错了……”  “你做错什么了？看今天晚上这情况，教母都不一定见你。”  “我实在是太疏忽了，我在划小船门口喊了她教母大人……”  “那你等死吧……”",
      "“希望千樱梨组长今天能给我们安排轻松一些的任务……现在那些交易都握在她手上，想要油水多的交易只能去找组长要。”",
      "“这牌子真的不换一下吗？先不说别的，马桥老大每次来了都黑脸啊！”  “大概是换不了了吧，须贺老大说牌子立住了不烧心。”  “看着这牌子我挺烧心的……”",
      "“这不是须贺组吗？怎么须贺老大吃个杯面老跟我们说不许告诉马桥老大，被发现了还老是欧内该啊？”  “不知道，大概是气管炎……”"
    ];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}