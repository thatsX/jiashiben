function renderHome() {
  const el = document.getElementById('page-home');

  const hasFront = characters.some(c => c.current.task === 'front' && !isExhausted(c));
  const hasKitchen = characters.some(c => c.current.task === 'kitchen' && !isExhausted(c));
  const hasWash = characters.some(c => c.current.task === 'wash' && !isExhausted(c));
  const canOperate = hasFront && hasKitchen && hasWash;

  const missing = [];
  if (!hasKitchen) missing.push('后厨');
  if (!hasWash) missing.push('洗碗');
  if (!hasFront) missing.push('前台');

  const menuBtnText = state.menu.length > 0
    ? `菜单 (${state.menu.length}/${CONFIG.menuMax})`
    : '菜单';

  // 桌子
  const tablesHTML = TABLES.map(t =>
    `<div class="table" style="left:${t.x}%; top:${t.y}%"></div>`
  ).join('');

  // 椅子
  const chairsHTML = CHAIRS.map(c =>
    `<div class="chair" data-chair-id="${c.id}" style="left:${c.x}%; top:${c.y}%"></div>`
  ).join('');

  // 岗位台
    // 后区台子（灶台 + 洗碗槽）：在角色下方
  const backStationsHTML = ['kitchen', 'wash'].map(stationId => {
    const spot = STATION_SPOTS[stationId];
    const imgSrc = spot.img || '';
    const imgW = spot.imgW || 70;
    const imgH = spot.imgH || 32;

    return `
      <div class="station ${stationId}"
           style="left:${spot.x}%; top:${spot.y}%;
                  width:${imgW}px; height:${imgH}px;"
           onclick="openStationSchedule('${stationId}')">
        <img class="station-img" src="${imgSrc}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="station-fallback">
          ${spot.label}
        </div>
      </div>
    `;
  }).join('');

  // 收银台：在角色上方
  const frontStationHTML = (() => {
    const spot = STATION_SPOTS.front;
    const imgSrc = spot.img || '';
    const imgW = spot.imgW || 78;
    const imgH = spot.imgH || 28;

    return `
      <div class="station front"
           style="left:${spot.x}%; top:${spot.y}%;
                  width:${imgW}px; height:${imgH}px;"
           onclick="openStationSchedule('front')">
        <img class="station-img" src="${imgSrc}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="station-fallback">
          ${spot.label}
        </div>
      </div>
    `;
  })();

  // 采购状态
  let purchaseText, purchaseClass;
  if (state.purchaseWeeks >= CONFIG.purchaseGraceWeeks) {
    purchaseText = '已断采！+100%';
    purchaseClass = 'danger';
  } else if (state.purchaseWeeks === 0) {
    purchaseText = '正常（+' + Math.round(state.lastPurchaseMul * 100) + '%）';
    purchaseClass = '';
  } else {
    const remain = CONFIG.purchaseGraceWeeks - state.purchaseWeeks;
    purchaseText = remain + ' 周内需采购';
    purchaseClass = remain <= 1 ? 'warn' : '';
  }

  const rep = state.reputation;
  let repDesc = '普通小店';
  if (rep >= 80) repDesc = '座无虚席';
  else if (rep >= 60) repDesc = '小有名气';
  else if (rep < 20) repDesc = '快倒闭了';

    // 承载力
  let capacityHTML = '';
  if (canOperate && state.menu.length > 0) {
    const preview = calculateBusiness(true);
    const cap = preview.capBottleneck || 0;
    const traffic = Math.round(preview.traffic);
    const isOverload = preview.overloadRatio > 0;

    capacityHTML = `
      <div class="row" style="color:${isOverload ? '#d32f2f' : '#4caf50'}">
        <span class="label">承载力</span>
        <span class="value">${traffic}/${cap}${isOverload ? ' ⚠' : ''}</span>
      </div>
    `;
  }

  // 季节事件显示
  let eventHTML = '';
  if (state.seasonalEvent && state.seasonalEvent.type !== 'none') {
    const ev = state.seasonalEvent;
    const color = ev.value > 0 ? '#4caf50' : '#d32f2f';
    eventHTML = `<div class="row" style="color:${color}"><span class="label">本周</span><span class="value">${ev.name} · ${ev.desc}</span></div>`;
  }

  let previewHTML = '';
  if (canOperate && state.menu.length > 0) {
    const preview = calculateBusiness(true);
    previewHTML = `
      <div class="row"><span class="label">预计客流</span><span class="value">${Math.round(preview.traffic)}</span></div>
      <div class="row"><span class="label">预计净利</span><span class="value">${preview.profit >= 0 ? '+' : ''}${Math.round(preview.profit)}</span></div>
    `;
  } else {
    previewHTML = `<div class="row" style="color:#ff9800"><span class="label">餐馆</span><span class="value">未营业</span></div>`;
  }

  const musicPlaying = state.currentMusic !== 'none';
  const musicName = getMusicName();

  el.innerHTML = `
    <div id="scene-restaurant">
      <div class="scene-status-panel">
        <div class="row"><span class="label">信誉</span><span class="value">${rep.toFixed(1)} · ${repDesc}</span></div>
        <div class="row"><span class="label">上周客流</span><span class="value">${state.lastTraffic}</span></div>
        <div class="row"><span class="label">上周净利</span><span class="value">${state.lastProfit >= 0 ? '+' : ''}${state.lastProfit}</span></div>
        <div class="row ${purchaseClass}"><span class="label">采购</span><span class="value">${purchaseText}</span></div>
        <div class="row"><span class="label">音乐</span><span class="value">${musicName}</span></div>
        ${capacityHTML}
        ${previewHTML}
        ${eventHTML}
      </div>

      <button class="scene-menu-btn" onclick="switchPage('menu')">
        📋 ${menuBtnText}
      </button>

      <div class="music-speaker ${musicPlaying ? 'playing' : ''}" onclick="openMusicPicker()">
        <img src="assets/ui/speaker.png"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="speaker-fallback">🔊</div>
      </div>

      <div class="scene-back-zone"></div>
      <div class="scene-divider"></div>

      <div class="layer-stations-back">${backStationsHTML}</div>
      <div class="layer-tables">${tablesHTML}</div>
      <div class="layer-chairs">${chairsHTML}</div>
      <div class="layer-chars" id="layer-chars"></div>
      <div class="layer-customers" id="layer-customers"></div>
      <div class="layer-stations-front">${frontStationHTML}</div>

      ${!canOperate ? `<div class="scene-empty">还缺：${missing.join(' / ')}<br>去「家庭」页排班吧</div>` : ''}
    </div>
    <div class="home-bottom-bar">
      <button class="settle-btn" onclick="settle()">
        ${canOperate && state.menu.length > 0 ? '营业结算' : '结算（餐馆未营业）'}
      </button>
    </div>
  `;

  renderWorkCharsDOM();
  updateCustomersDOM();
}

function renderWorkCharsDOM() {
  const el = document.getElementById('layer-chars');
  if (!el) return;

  const workChars = characters.filter(c =>
    (c.current.task === 'kitchen' ||
     c.current.task === 'wash' ||
     c.current.task === 'front') && !isExhausted(c)
  );

  el.innerHTML = workChars.map(c => {
    const info = spriteInnerHTML(c, false);
    return `
      <div class="${info.className}"
           data-char-id="${c.id}"
           style="left:${c.current.position.x}%; top:${c.current.position.y}%;"
           onclick="showCharStatus('${c.id}')">
        ${info.html}
      </div>
    `;
  }).join('');
}