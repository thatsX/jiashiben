function renderShop() {
  const el = document.getElementById('page-shop');

  // ============================================
  //  极道商店街
  // ============================================
  if (state.isMafia) {
    const mafiaShopsHTML = MAFIA_SHOPS.map(s => {
      const workers = characters.filter(c => c.current.task === 'work' && c.current.workShop === s.id);
      const avatarsHTML = workers.slice(0, 3).map(c => `<div class="shop-worker-avatar" title="${c.name}">${avatarHTML(c.id, 'chars', 28)}</div>`).join('');
      return `
        <div class="shop-building" style="left:${s.x}%; top:${s.y}%; background:#111; border-color:#b8860b" onclick="openShop('${s.id}')">
          <div class="shop-worker-bar">${avatarsHTML}</div>
          <div class="shop-name" style="color:#ffb300">${s.name}</div>
          <div class="shop-count">${s.workCount ? '打工 ' + s.workCount + ' 次' : '打工'}</div>
        </div>
      `;
    }).join('');

    const mafiaExtraHTML = `
      <div class="shop-building" style="left:25%; top:55%; background:#111; color:#fff; border-color:#d32f2f" onclick="openBoxingRing()">
        <div class="shop-name" style="color:#ff5252">🥊 地下拳场</div>
        <div class="shop-count">赌声望</div>
      </div>
      <div class="shop-building" style="left:75%; top:55%; background:#111; color:#fff; border-color:#ffd54f" onclick="openUndergroundLive()">
        <div class="shop-name" style="color:#ffd54f">🎸 地下Live</div>
        <div class="shop-count">冷却: ${state.liveCooldown || 0}周</div>
      </div>
      <div class="shop-building" style="left:50%; top:36%; background:#222; color:#fff; border-color:#999" onclick="openEquipExchange()">
        <div class="shop-name">🔧 设备交易所</div>
        <div class="shop-count">升级设备</div>
      </div>
    `;

    el.innerHTML = `
      <div id="scene-shop">
        <div class="shop-road shop-road-h"></div>
        <div class="shop-road shop-road-v"></div>
        ${mafiaShopsHTML}
        ${mafiaExtraHTML}
      </div>
    `;
    return;
  }

  // ============================================
  //  日常商店街
  // ============================================
  const shopsHTML = SHOPS.map(s => {
    const workers = characters.filter(c => c.current.task === 'work' && c.current.workShop === s.id);
    const avatarsHTML = workers.slice(0, 3).map(c => `<div class="shop-worker-avatar" title="${c.name}">${avatarHTML(c.id, 'chars', 28)}</div>`).join('');

    return `
      <div class="shop-building" style="left:${s.x}%; top:${s.y}%" onclick="openShop('${s.id}')">
        <div class="shop-worker-bar">${avatarsHTML}</div>
        <div class="shop-name">${s.name}</div>
        <div class="shop-count">${s.workCount ? '打工 ' + s.workCount + ' 次' : '打工'}</div>
      </div>
    `;
  }).join('');

  const equipHTML = `
    <div class="shop-building" style="left:50%; top:50%; background:#333; color:#fff; border-color:#999" onclick="openEquipExchange()">
      <div class="shop-name">🔧 设备交易所</div>
      <div class="shop-count">升级设备</div>
    </div>
  `;

  el.innerHTML = `
    <div id="scene-shop">
      <div class="shop-road shop-road-h"></div>
      <div class="shop-road shop-road-v"></div>
      ${shopsHTML}
      ${equipHTML}
    </div>
  `;
}

// 黑道打工弹窗
function openShop(shopId) {
  let shop = SHOPS.find(s => s.id === shopId);
  if (!shop) shop = MAFIA_SHOPS.find(s => s.id === shopId);
  if (!shop) return;

  const isMafiaShop = MAFIA_SHOPS.some(s => s.id === shopId);
  const workingHere = characters.filter(c => c.current.task === 'work' && c.current.workShop === shopId);
  
  // 极道店铺限制宁月
  const candidates = characters.filter(c => {
    if (c.current.task !== 'rest') return false;
    if (!c.traits.canWork) return false;
    if (isExhausted(c)) return false;
    if (c.current.workShop) return false;
    // 极道店铺：宁月不能去
    if (isMafiaShop && c.id === 'ningetsu') return false;
    return true;
  });

  const workerHTML = candidates.length > 0
    ? candidates.map(c => `
        <div class="worker-option" onclick="toggleWorker('${shopId}','${c.id}')">
          ${avatarHTML(c.id, 'chars', 36)}
          <div class="worker-info">
            <div><b>${c.name}</b></div>
            <div style="font-size:11px;color:#666">精力 ${Math.round(c.current.energy)} · 倍率 ${getEffectiveWorkMultiplier(c).toFixed(1)}x</div>
          </div>
        </div>
      `).join('')
    : '<p style="color:#888;font-size:12px">没有可用角色。</p>';

  const selectedHTML = workingHere.length > 0
    ? workingHere.map(c => `
        <div class="worker-option selected" onclick="toggleWorker('${shopId}','${c.id}')">
          ${avatarHTML(c.id, 'chars', 36)}
          <div class="worker-info">
            <div><b>${c.name}</b> <span style="color:#4caf50;font-size:11px">✔ 打工中</span></div>
          </div>
        </div>
      `).join('')
    : '';

  // 极道店铺显示声望
  const repInfo = isMafiaShop ? `<div class="ledger-row"><span>极道声望</span><span style="color:#b8860b">+15 / 人</span></div>` : '';

  showModal(`
    <h3>${shop.name}</h3>
    <div class="shop-info">
      <div class="ledger-row"><span>基础工资</span><span>${shop.baseWage}</span></div>
      <div class="ledger-row"><span>精力消耗</span><span>${shop.energyCost}</span></div>
      ${repInfo}
    </div>
    <h4 style="margin-top:12px">选择打工者</h4>
    ${selectedHTML}
    ${workerHTML}
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function toggleWorker(shopId, charId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;

  if (c.current.task === 'work' && c.current.workShop === shopId) {
    c.current.task = 'rest';
    c.current.workShop = null;
    assignHomeInitialPosition(c);
  } else {
    c.current.task = 'work';
    c.current.workShop = shopId;
    c.current.position = { x: -20, y: 60 };
    
    // 极道打工推进
    const isMafiaShop = MAFIA_SHOPS.some(s => s.id === shopId);
    if (isMafiaShop && state.isMafia) {
      const q = MAFIA_QUESTS[state.mafiaQuestIdx];
      if (q && q.type === 'work_count') {
        q.current = (q.current || 0) + 1;
      }
    }
  }
  openShop(shopId);
}

function openEquipExchange() {
  const listHTML = STATION_UPGRADES.map(up => {
    const lv = state.stationUpgrades[up.station] || 0;
    const isMax = lv >= up.maxLv;
    const canBuy = !isMax && state.cash >= up.price;
    return `
      <div class="equip-item">
        <div class="equip-info">
          <div><b>${up.name}</b> Lv.${lv}/${up.maxLv}</div>
          <div style="font-size:11px;color:#666">当前 ${getStationCapacity(up.station)}</div>
        </div>
        <div class="equip-action">
          <div class="equip-price">${isMax ? '' : up.price + ' 金'}</div>
          <button ${!canBuy || isMax ? 'disabled' : ''} onclick="buyUpgrade('${up.id}')">${isMax ? '满级' : '升级'}</button>
        </div>
      </div>
    `;
  }).join('');
  showModal(`<h3>🔧 设备交易所</h3>${listHTML}`);
  document.getElementById('modal-btn').textContent = '关闭';
}

function buyUpgrade(upgradeId) {
  const up = STATION_UPGRADES.find(u => u.id === upgradeId);
  if (state.cash < up.price) return;
  state.cash -= up.price;
  state.stationUpgrades[up.station]++;
  renderStatus();
  openEquipExchange();
}

// 拳场 UI 弹窗
function openBoxingRing() {
  if (state.weeklyBets >= 5) {
    showModal(`
      <h3>🥊 地下拳场</h3>
      <p style="text-align:center;padding:20px;color:#d32f2f">本周押注次数已用完（5/5）。<br>请等待下周结算刷新。</p>
    `);
    document.getElementById('modal-btn').textContent = '关闭';
    return;
  }

  showModal(`
    <h3>🥊 地下拳场</h3>
    <p style="font-size:12px;color:#666;margin-bottom:12px">本周剩余次数: ${5 - state.weeklyBets} 次</p>
    
    <div class="shop-info" style="background:#222;color:#fff">
      <div class="ledger-row"><span>极道声望</span><span style="color:#b8860b">${state.mafiaRep}</span></div>
      <div class="ledger-row"><span>手头现金</span><span>${Math.round(state.cash)}</span></div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px">
      <button style="background:#e57373;color:white;padding:12px" onclick="doImmediateBet('A', 10000)">押 红方（10,000 金）</button>
      <button style="background:#64b5f6;color:white;padding:12px" onclick="doImmediateBet('B', 10000)">押 蓝方（10,000 金）</button>
      <button style="background:#81c784;color:white;padding:12px" onclick="doImmediateBet('C', 10000)">押 绿方（10,000 金）</button>
    </div>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

// 地下 Live UI
function openUndergroundLive() {
  showModal(`
    <h3>🎸 地下 Live House</h3>
    <p style="font-size:12px;color:#666;margin-bottom:12px">黑帮与摇滚的狂欢。消耗全员 30 精力，花费 50000 布置费，换取高额回报。</p>
    
    <div class="shop-info" style="background:#222;color:#fff">
      <div class="ledger-row"><span>冷却状态</span><span style="color:${state.liveCooldown>0?'#ff5252':'#4caf50'}">${state.liveCooldown > 0 ? '还剩 ' + state.liveCooldown + ' 周' : '可以举办'}</span></div>
      <div class="ledger-row"><span>预计收益</span><span style="color:#ffd54f">净赚 100000 金 + 30 声望</span></div>
    </div>

    <button style="width:100%;margin-top:12px;background:${state.liveCooldown>0?'#555':'#d32f2f'};color:white" 
            ${state.liveCooldown>0?'disabled':''} onclick="hostUndergroundLive()">
      举办地下 Live
    </button>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}