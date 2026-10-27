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
    ...template, // ★ 核心修复：一键继承所有属性（包括 banquetData）
    uid,
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
  // ★ 夜间经营期间暂停普通客人 AI，避免影响状态
  if (state.night && state.night.active) return;
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

  if (state.night && state.night.active) {
    el.innerHTML = '';
    el.style.display = 'none';
    return;
  }
  el.style.display = '';

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
  if (c.id === 'zaojie' || c.id === 'dounai') {
    if (c.talked) {
      showModal('<p style="text-align:center;color:#888">她们还在热烈地讨论作曲。</p>');
      return;
    }
    startZaojieEvent();
    return;
  }
  if (c.id === 'banquet_client') {
    openBanquetDialog(c);
    return;
  }

    if (c.id === 'big_hand') {
    c.talked = true;
    showModal(`
      <div style="text-align:center;padding:10px 0">
        ${avatarHTML(c.id, 'customers', 64)}
        <h3 style="margin-top:6px">${c.name}</h3>
        <div class="talk-bubble" style="background:#fff7e6;margin-top:12px">
          <p>“听说你们的 live house 被夺走了，笑容都去哪里了？让我帮你们拿回 live house 找回笑容吧！”</p>
        </div>
      </div>
      <button class="dialogue-choice" onclick="triggerBigHandCollision('${c.uid}')">欸？</button>
    `);
    document.getElementById('modal-btn').style.display = 'none';
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
        // ★ 修改这里：过滤掉 premium（高级菜谱）
        const pool = RECIPES.filter(r =>
          !r.premium &&
          state.learnedRecipes.indexOf(r.id) < 0 &&
          state.pendingRecipes.indexOf(r.id) < 0
        );
        if (pool.length > 0) {
          const picked = pool[Math.floor(Math.random() * pool.length)];
          state.learnedRecipes.push(picked.id);
          if (state.pendingRecipes.indexOf(picked.id) < 0) {
            state.pendingRecipes.push(picked.id);
          }
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

  // ★ 枣姐与豆乃生成逻辑
  if (state.week >= 4 && !state.seenCustomers.includes('zaojie') && !state.isMafia) {
    if (Math.random() < 0.4) { 
      const pairs = [['c1','c2'], ['c3','c4'], ['c5','c6'], ['c7','c8']];
      const occupied = new Set(state.customers.map(c => c.chairId).filter(Boolean));
      
      for (let pair of pairs) {
        if (!occupied.has(pair[0]) && !occupied.has(pair[1])) {
          const chair1 = CHAIRS.find(c => c.id === pair[0]);
          const chair2 = CHAIRS.find(c => c.id === pair[1]);
          
          const c1 = createCustomerFromTemplate(CUSTOMERS.find(x => x.id === 'zaojie'), true);
          c1.chairId = chair1.id;
          c1.position = { x: chair1.x, y: chair1.y };
          c1.phase = 'goingToChair';
          c1.timer = 3200;
          state.customers.push(c1);

          const c2 = createCustomerFromTemplate(CUSTOMERS.find(x => x.id === 'dounai'), true);
          c2.chairId = chair2.id;
          c2.position = { x: chair2.x, y: chair2.y };
          c2.phase = 'goingToChair';
          c2.timer = 3200;
          state.customers.push(c2);

          state.seenCustomers.push('zaojie');
          state.seenCustomers.push('dounai');
          break;
        }
      }
    }
  }



  if (state.isMafia) {
    // 极道线只允许刷普通特殊客人（比如蓝毛贝斯手）
    const repFactor = Math.max(0, Math.min(2, state.reputation / 50));
    CUSTOMERS.filter(c => c.type === 'special' && c.id !== 'banquet_client' && c.id !== 'critic' && c.id !== 'zhulaoban').forEach(c => {
      if (c.minWeek && state.week < c.minWeek) return;
      if (c.once && state.seenCustomers.indexOf(c.id) >= 0) return;
      if (state.customers.some(x => x.id === c.id)) return;

      let chance = (typeof c.chance === 'number') ? c.chance : 1.0;
      chance *= repFactor;
      if (Math.random() > chance) return;

      state.customers.push(createCustomerFromTemplate(c, true));
      if (c.once && state.seenCustomers.indexOf(c.id) < 0) {
        state.seenCustomers.push(c.id);
      }
    });
    return; 
  }


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

// ============================================================
//   神秘大手撞车事件与后续
// ============================================================
window.triggerBigHandCollision = function(uid) {
  closeModal();
  
  const c = state.customers.find(x => x.uid === uid);
  if (!c) return;
  
  const targetNode = document.querySelector(`[data-cust-id="${uid}"]`);
  let targetX = 50, targetY = 70;
  if (targetNode) {
    targetX = parseFloat(targetNode.style.left);
    targetY = parseFloat(targetNode.style.top);
  }

  // ★ 出现在客人入口处（稍微往上提一点 y，确保在手机屏幕上能看清整个人）
  const startX = CUSTOMER_ENTRY.x; 
  const startY = 85; 

  const otona = document.createElement('div');
  otona.className = 'sprite customer-sprite';
  otona.style.position = 'absolute'; 
  otona.style.left = startX + '%'; 
  otona.style.top = startY + '%';
  otona.style.transition = 'none';
  otona.style.zIndex = '9999';
  
  otona.innerHTML = `
    <div class="head-bubble" style="min-width:150px; text-align:left;"></div>
    <img src="assets/customers/sbgd.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
    <div class="sprite-fallback"><div class="fb-head"></div><div class="fb-body"></div></div>
    <div class="sprite-label">十本光大</div>
  `;
  
  const scene = document.getElementById('scene-restaurant');
  if (scene) scene.appendChild(otona);

  const bubble = otona.querySelector('.head-bubble');
  const fullText = "不可以，我还怎么捞黑流！";
  let charIdx = 0;

  // ★ 打字机效果：一字一顿地喊出来
  const typeTimer = setInterval(() => {
    if (charIdx < fullText.length) {
      bubble.textContent += fullText[charIdx];
      charIdx++;
    } else {
      clearInterval(typeTimer);
      
      // ★ 喊完之后，停顿 0.5 秒开始冲刺
      setTimeout(() => {
        // 计算冲刺加速度
        otona.style.transition = 'left 0.6s cubic-bezier(0.6, 0, 0.9, 1), top 0.6s cubic-bezier(0.6, 0, 0.9, 1)';
        otona.style.left = targetX + '%'; 
        otona.style.top = targetY + '%'; 

        // 冲刺 0.6 秒后碰撞
        setTimeout(() => {
          // 全屏白光
          const flash = document.createElement('div');
          flash.className = 'screen-flash';
          document.body.appendChild(flash);

          // 两人消失
          if (targetNode) targetNode.remove();
          otona.remove();
          c.phase = 'gone'; 

          // 白光闪烁 1 秒后，弹出“啊咧？”
          setTimeout(() => {
            flash.remove();
            showModal(`
              <div style="text-align:center;padding:20px 0">
                <h2 style="color:#333;font-size:28px;letter-spacing:4px;">啊咧？</h2>
              </div>
              <button class="dialogue-choice" onclick="receiveBigHandMoney()">
                收下神秘大手留下的 5000 块钱救济金（？）
              </button>
            `);
            document.getElementById('modal-btn').style.display = 'none';
          }, 1000);

        }, 600);

      }, 500);
    }
  }, 120); // 每 120 毫秒蹦出一个字
};

window.receiveBigHandMoney = function() {
  closeModal();
  state.cash += 5000;
  renderStatus();
};

// ============================================================
//   特殊客人：枣姐与豆乃（聊天框模式）
// ============================================================

function startZaojieEvent() {
  state.customers.forEach(cust => {
    if (cust.id === 'zaojie' || cust.id === 'dounai') cust.talked = true;
  });

  showModal(`
    <div class="chat-container" style="display:flex; flex-direction:column; gap:12px; padding:12px; background:#f5f5f5; border:2px solid #ddd; border-radius:12px; margin-bottom:12px; max-height:400px; overflow-y:auto;">
      
      <!-- 枣姐 (左) -->
      <div style="display:flex; align-items:flex-start; gap:10px; max-width:90%;">
        <img src="assets/customers/zaojie.png" onerror="this.src='assets/customers/worker.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-start;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-left:4px;">枣姐</span>
          <div style="background:#fff; border:1px solid #ddd; padding:10px 14px; border-radius:2px 14px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            老板再开两瓶魔爪！
          </div>
        </div>
      </div>

      <!-- 蕾叶 (右) -->
      <div style="display:flex; flex-direction:row-reverse; align-items:flex-start; gap:10px; max-width:90%; align-self:flex-end;">
        <img src="assets/chars/leye.png" onerror="this.src='assets/chars/worker.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-end;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-right:4px;">蕾叶</span>
          <div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px 14px; border-radius:14px 2px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            好嘞来了！
          </div>
        </div>
      </div>
      
    </div>
    <button class="dialogue-choice" onclick="zaojie_step2()">继续</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function zaojie_step2() {
  showModal(`
    <div class="chat-container" style="display:flex; flex-direction:column; gap:12px; padding:12px; background:#f5f5f5; border:2px solid #ddd; border-radius:12px; margin-bottom:12px; max-height:400px; overflow-y:auto;">
      
      <!-- 枣姐 (左) -->
      <div style="display:flex; align-items:flex-start; gap:10px; max-width:90%;">
        <img src="assets/customers/zaojie.png" onerror="this.src='assets/customers/worker.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-start;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-left:4px;">枣姐</span>
          <div style="background:#fff; border:1px solid #ddd; padding:10px 14px; border-radius:2px 14px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            唉，作曲没了这个果然还是不行啊。
          </div>
        </div>
      </div>

      <!-- 豆乃 (右) -->
      <div style="display:flex; flex-direction:row-reverse; align-items:flex-start; gap:10px; max-width:90%; align-self:flex-end;">
        <img src="assets/customers/dounai.png" onerror="this.src='assets/customers/student.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-end;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-right:4px;">豆乃</span>
          <div style="background:#e3f2fd; border:1px solid #90caf9; padding:10px 14px; border-radius:14px 2px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            能量饮料不就是拿来充能的吗？
          </div>
        </div>
      </div>

      <!-- 枣姐 (左) -->
      <div style="display:flex; align-items:flex-start; gap:10px; max-width:90%;">
        <img src="assets/customers/zaojie.png" onerror="this.src='assets/customers/worker.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-start;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-left:4px;">枣姐</span>
          <div style="background:#fff; border:1px solid #ddd; padding:10px 14px; border-radius:2px 14px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            每次作曲，饮料罐子和纸都要丢一地。
          </div>
        </div>
      </div>

      <!-- 豆乃 (右) -->
      <div style="display:flex; flex-direction:row-reverse; align-items:flex-start; gap:10px; max-width:90%; align-self:flex-end;">
        <img src="assets/customers/dounai.png" onerror="this.src='assets/customers/student.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-end;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-right:4px;">豆乃</span>
          <div style="background:#e3f2fd; border:1px solid #90caf9; padding:10px 14px; border-radius:14px 2px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            纸是做什么的？用电脑写曲子方便快捷。
          </div>
        </div>
      </div>
      
    </div>
    <button class="dialogue-choice" onclick="zaojie_step3()">继续</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function zaojie_step3() {
  showModal(`
    <div class="chat-container" style="display:flex; flex-direction:column; gap:12px; padding:12px; background:#f5f5f5; border:2px solid #ddd; border-radius:12px; margin-bottom:12px; max-height:400px; overflow-y:auto;">
      
      <!-- 枣姐 (左) -->
      <div style="display:flex; align-items:flex-start; gap:10px; max-width:90%;">
        <img src="assets/customers/zaojie.png" onerror="this.src='assets/customers/worker.png'" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.15); background:#eee; flex-shrink:0;">
        <div style="display:flex; flex-direction:column; align-items:flex-start;">
          <span style="font-size:11px; color:#888; margin-bottom:2px; margin-left:4px;">枣姐</span>
          <div style="background:#fff; border:1px solid #ddd; padding:10px 14px; border-radius:2px 14px 14px 14px; font-size:14px; color:#333; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
            作曲就是要用纸笔才有灵魂。
          </div>
        </div>
      </div>

    </div>
    
    <div style="text-align:center; color:#888; font-size:13px; margin:10px 0; line-height:1.6; background:#fff; padding:10px; border-radius:8px;">
      （两人突然不说话了……）<br>
      <span style="color:#aaa;">枣姐：（电脑作曲，好没格调…）</span><br>
      <span style="color:#aaa;">豆乃：（嘉豪…）</span>
    </div>

    <button class="dialogue-choice" onclick="pickZaojieChoice('A')">学到了！</button>
    <button class="dialogue-choice" onclick="pickZaojieChoice('B')">喝大了？</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

function pickZaojieChoice(choice) {
  if (choice === 'A') {
    closeModal();
    state.cash -= 100;
    const kokono = characters.find(c => c.id === 'kokono');
    if (kokono) kokono.current.affinity = Math.max(0, kokono.current.affinity - 10);
    
    if (typeof playCutscene === 'function' && typeof ZAOJIE_SCRIPT !== 'undefined') {
      playCutscene(ZAOJIE_SCRIPT, () => {
        renderStatus();
        renderPage('home');
        leaveZaojieCustomers();
      });
    } else {
      alert('现金 -100，心玖好感 -10');
      leaveZaojieCustomers();
    }
  } else {
    closeModal();
    showModal('<p style="text-align:center;color:#888">你默默走开了，她们继续痛饮能量饮料。</p>');
    document.getElementById('modal-btn').onclick = () => {
      closeModal();
      leaveZaojieCustomers();
    };
    document.getElementById('modal-btn').textContent = '关闭';
  }
}

function leaveZaojieCustomers() {
  state.customers.forEach(c => {
    if (c.id === 'zaojie' || c.id === 'dounai') {
      c.chairId = null;
      c.position = { x: CUSTOMER_EXIT.x, y: CUSTOMER_EXIT.y };
      c.phase = 'leaving';
      c.timer = 3500;
    }
  });
  renderPage('home');
}