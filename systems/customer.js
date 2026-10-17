/* ============================================================
   systems/customer.js —— 客人 AI + 交互
   ============================================================ */

// ============================================================
//   椅子分配
// ============================================================
function findAvailableChair() {
  const occupied = new Set(
    state.customers.filter(c => c.chairId).map(c => c.chairId)
  );
  const free = CHAIRS.filter(ch => !occupied.has(ch.id));
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function createCustomerFromTemplate(template, isSpecial) {
  const uid = 'c' + Date.now() + Math.random().toString(36).slice(2, 7);
  return {
    uid,
    id: template.id,
    name: template.name,
    type: template.type,
    isSpecial: !!isSpecial,
    phase: 'entering',
    chairId: null,
    position: { x: CUSTOMER_ENTRY.x, y: CUSTOMER_ENTRY.y },
    timer: 300,
    talked: false,
  };
}

function spawnNormalCustomer() {
  const pool = CUSTOMERS.filter(c => c.type === 'normal');
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  state.customers.push(createCustomerFromTemplate(tpl, false));
}

// ============================================================
//   客人走动 AI
// ============================================================
function tickCustomers(dt) {
  state.customers.forEach(c => {
    c.timer -= dt;
    if (c.timer > 0) return;

    if (c.phase === 'entering') {
      const chair = findAvailableChair();
      if (!chair) { c.timer = 1000; return; }
      c.chairId = chair.id;
      c.position = { x: chair.x, y: chair.y };
      c.phase = 'goingToChair';
      c.timer = 3200;

    } else if (c.phase === 'goingToChair') {
      c.phase = 'seated';
      c.timer = c.isSpecial ? Infinity : (8000 + Math.random() * 8000);

    } else if (c.phase === 'seated') {
      c.chairId = null;
      c.position = { x: CUSTOMER_EXIT.x, y: CUSTOMER_EXIT.y };
      c.phase = 'leaving';
      c.timer = 3500;

    } else if (c.phase === 'leaving') {
      c.phase = 'gone';
    }
  });

  state.customers = state.customers.filter(c => c.phase !== 'gone');

  const normalCount = state.customers.filter(c => !c.isSpecial).length;
  if (normalCount < 3 && state.customers.length < CHAIRS.length) {
    spawnNormalCustomer();
  }
}

// ============================================================
//   客人 DOM
// ============================================================
function updateCustomersDOM() {
  const el = document.getElementById('layer-customers');
  if (!el) return;

  Array.from(el.children).forEach(child => {
    if (!state.customers.find(c => c.uid === child.dataset.custId)) {
      child.remove();
    }
  });

  state.customers.forEach(c => {
    let node = el.querySelector('[data-cust-id="' + c.uid + '"]');

        const imgName = c.visual ? `${c.id}_${c.visual}` : c.id;
    const imgSrc = `assets/customers/${imgName}.png`;

    if (!node) {
      node = document.createElement('div');
      node.className = 'sprite customer-sprite';
      node.dataset.custId = c.uid;
      node.style.transition = 'none';
      node.style.left = c.position.x + '%';
      node.style.top = c.position.y + '%';
      node.innerHTML = `
        <img src="${imgSrc}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
        <div class="sprite-fallback">
          <div class="fb-head"></div>
          <div class="fb-body"></div>
        </div>
        <div class="sprite-label">${c.name}</div>
      `;
      node.onclick = () => talkToCustomerByUid(c.uid);
      el.appendChild(node);
      void node.offsetWidth;
      node.style.transition = '';
    } else {
      node.style.left = c.position.x + '%';
      node.style.top = c.position.y + '%';

      // 贴图变体更新
      const img = node.querySelector('img');
      if (img && !img.src.endsWith(imgName + '.png')) {
        img.src = imgSrc;
        img.style.display = 'block';
      }
    }
  });
}

// ============================================================
//   点击客人
// ============================================================
function talkToCustomerByUid(uid) {
  const c = state.customers.find(x => x.uid === uid);
  if (!c) return;

  if (c.id === 'banquet_client') {
    openBanquetDialog(c);
    return;
  }

  if (c.talked) {
    showModal('<p style="text-align:center;color:#888">她已经吃完了。</p>');
    return;
  }

  const customerDef = CUSTOMERS.find(x => x.id === c.id);

  // 1. 普通客人
  if (c.type === 'normal') {
    const lines = STORY.customers[c.id];
    if (!lines) return;
    const line = lines[Math.floor(Math.random() * lines.length)];
    c.talked = true;
    showModal('<p><span class="speaker">' + c.name + '：</span>' + line + '</p>');
    return;
  }

  // 2. 互动型特殊客人
  if (customerDef && customerDef.dialogue) {
    startCustomerDialogue(c, customerDef.dialogue);
    return;
  }

  // 3. 脚本型特殊客人
  const lines = STORY.customers[c.id];
  if (!lines) return;
  c.talked = true;
  showModal(playScript(lines));

  if (c.id === 'critic') state.reputation += 10;
  if (c.id === 'zhulaoban') {
    state.cash += 500;
    renderStatus();
  }
}

// ============================================================
//   互动型特殊客人：对话树
// ============================================================
let currentCustomerUid = null;
let currentCustomerDialogue = null;

function startCustomerDialogue(c, dialogue) {
  currentCustomerUid = c.uid;
  currentCustomerDialogue = dialogue;
  c.talked = true;

  const choicesHTML = dialogue.choices.map((ch, i) => `
    <button class="dialogue-choice"
            onclick="pickCustomerChoice(${i})">
      ${ch.text}
    </button>
  `).join('');

  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      ${avatarHTML(c.id, 'customers', 64)}
      <h3 style="margin-top:6px">${c.name}</h3>
    </div>
    <div class="talk-bubble" style="background:#fff7e6">
      <p>“${dialogue.opening}”</p>
    </div>
    <div style="margin-top:16px">
      ${choicesHTML}
    </div>
  `);

  document.getElementById('modal-btn').style.display = 'none';
}

function pickCustomerChoice(choiceIndex) {
  const c = state.customers.find(x => x.uid === currentCustomerUid);
  if (!c) return;
  if (!currentCustomerDialogue) return;

  const ch = currentCustomerDialogue.choices[choiceIndex];
  if (!ch) return;

    // 应用效果
  applyCustomerEffect(ch.effect);

  // effectText 支持字符串或函数
  const effectText = (typeof ch.effectText === 'function')
    ? ch.effectText()
    : ch.effectText;

  showModal(`
    <div class="talk-bubble" style="background:#fff7e6">
      <p><span class="speaker">蕾叶：</span>“${ch.leyeReply}”</p>
    </div>
    <p style="text-align:center;color:#4caf50;font-weight:bold;margin-top:14px;font-size:15px">
      ${effectText}
    </p>
  `);

  document.getElementById('modal-btn').onclick = () => {
    closeModal();

    if (ch.noLeave) {
      // 留在座位上再坐一会
      c.timer = 5000;
      c.phase = 'seated';
    } else {
      // 正常离开
      c.chairId = null;
      c.position = { x: CUSTOMER_EXIT.x, y: CUSTOMER_EXIT.y };
      c.phase = 'leaving';
      c.timer = 3500;
    }

    currentCustomerUid = null;
    currentCustomerDialogue = null;
  };
  document.getElementById('modal-btn').textContent = '好的';
}

// ============================================================
//   效果应用
// ============================================================
function applyCustomerEffect(effect) {
  if (!effect) return;

  const list = Array.isArray(effect) ? effect : [effect];
  list.forEach(e => applySingleEffect(e));

  renderStatus();
}

function applySingleEffect(e) {
  if (!e || !e.type) return;

  switch (e.type) {
    case 'changeVisual':
    {
       const c = state.customers.find(x => x.uid === currentCustomerUid);
       if (c) {
        c.visual = e.value;
        updateCustomersDOM();
      }
    }
    break;
    
    case 'energy':
      {
        const target = characters.find(c => c.id === e.charId);
        if (target) {
          target.current.energy = Math.max(
            0,
            Math.min(target.traits.energyMax, target.current.energy + e.value)
          );
        }
      }
      break;

    case 'menuRevenue':
      {
        const total = state.menu.reduce((sum, id) => {
          const r = RECIPES.find(x => x.id === id);
          return sum + (r ? r.price : 0);
        }, 0);
        state.cash += total;
      }
      break;

    case 'reputation':
      state.reputation += e.value;
      state.reputation = Math.max(0, Math.min(100, state.reputation));
      break;

    case 'trafficBonus':
      state.tempTrafficBonus = (state.tempTrafficBonus || 0) + e.value;
      break;

    case 'unitPriceBonus':
      state.tempUnitPriceBonus = (state.tempUnitPriceBonus || 0) + e.value;
      break;

    case 'tip':
      state.cash += e.value;
      break;

    case 'recipe':
      if (e.id) {
        if (state.learnedRecipes.indexOf(e.id) < 0) {
          state.learnedRecipes.push(e.id);
          if (state.pendingRecipes.indexOf(e.id) < 0) {
            state.pendingRecipes.push(e.id);
          }
        }
      } else {
        const pool = RECIPES.filter(r =>
          state.learnedRecipes.indexOf(r.id) < 0 &&
          state.pendingRecipes.indexOf(r.id) < 0
        );
        if (pool.length > 0) {
          const picked = pool[Math.floor(Math.random() * pool.length)];
          state.learnedRecipes.push(picked.id);
          state.pendingRecipes.push(picked.id);
        }
      }
      break;

    default:
      console.warn('未知效果类型:', e.type);
  }
}

// ============================================================
//   刷新特殊客人
//   规则：
//   1. 一种特殊客人同时只存在一个（场上有同 id → 跳过）
//   2. once = true 且已出现过 → 跳过
//   3. 未到 minWeek → 跳过
//   4. 概率 × 声誉加成
// ============================================================
function generateSpecialCustomers() {
  const banquetCust = trySpawnBanquetCustomer();
  if (banquetCust) {
    state.customers.push(createCustomerFromTemplate(banquetCust, true));
    return; // 有宴席就不刷其他特殊客人了
  }

  const repFactor = Math.max(0, Math.min(2, state.reputation / 50));

  CUSTOMERS.filter(c => c.type === 'special').forEach(c => {
    if (c.minWeek && state.week < c.minWeek) return;
    if (c.once && state.seenCustomers.indexOf(c.id) >= 0) return;
    if (state.customers.some(x => x.id === c.id)) return;

    // 特殊出现条件
    if (typeof c.condition === 'function') {
      try {
        if (!c.condition()) return;
      } catch (e) {
        return;
      }
    }

    let chance = (typeof c.chance === 'number') ? c.chance : 1.0;
    chance *= repFactor;

    if (Math.random() > chance) return;

    state.customers.push(createCustomerFromTemplate(c, true));
    if (c.once && state.seenCustomers.indexOf(c.id) < 0) {
      state.seenCustomers.push(c.id);
    }
  });
}