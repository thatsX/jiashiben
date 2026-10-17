/* ============================================================
   ui/home.js —— 首页渲染
   ============================================================ */

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
  if (state.isMafia) {
    const q = MAFIA_QUESTS[state.mafiaQuestIdx];
    let taskProgressText = '';
    let taskProgressColor = '#333';

    if (q) {
      if (q.type === 'cash') {
        taskProgressText = `${Math.round(state.cash)} / ${q.target}`;
        taskProgressColor = state.cash >= q.target ? '#4caf50' : '#d32f2f';
      } else if (q.type === 'live_hold') {
        // ★ 特殊处理 live_hold：显示声望进度 + Live状态
        const liveText = q.liveDone ? '✅已举办' : '❌未举办';
        const repText = `${state.mafiaRep} / ${q.target}`;
        taskProgressText = `声望: ${repText} · Live: ${liveText}`;
        taskProgressColor = (state.mafiaRep >= q.target && q.liveDone) ? '#4caf50' : '#d32f2f';
      } else if (q.type === 'mafia_rep') {
        taskProgressText = `${state.mafiaRep} / ${q.target}`;
        taskProgressColor = state.mafiaRep >= q.target ? '#4caf50' : '#d32f2f';
      } else {
        taskProgressText = `${q.current || 0} / ${q.target}`;
        taskProgressColor = (q.current || 0) >= q.target ? '#4caf50' : '#d32f2f';
      }

      previewHTML = `
        <div class="row" style="color:#d32f2f;font-weight:bold"><span class="label">极道目标</span><span class="value">${q.title}</span></div>
        <div class="row"><span class="label">任务进度</span><span class="value" style="color:${taskProgressColor}">${taskProgressText}</span></div>
        ${q.type !== 'mafia_rep' && q.type !== 'live_hold' ? `<div class="row"><span class="label">极道声望</span><span class="value" style="color:#b8860b">${state.mafiaRep || 0}</span></div>` : ''}
        <div class="row"><span class="label">截止周数</span><span class="value" style="color:${state.week >= state.mafiaDeadline - 1 ? '#ff9800' : '#333'}">第 ${state.mafiaDeadline} 周</span></div>
      `;
    }
  } else if (canOperate && state.menu.length > 0) {
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

  // ============ 宴席追踪面板 ============
  let banquetTrackerHTML = '';
  if (state.banquet) {
    const b = state.banquet;
    const isUnlocked = state.unlockedPremium.indexOf(b.requiredRecipeId) >= 0;
    const recipe = RECIPES.find(x => x.id === b.requiredRecipeId);
    
    // 生成指派下拉框
    const charOptions = characters.map(c => 
      `<option value="${c.id}" ${b.prepAssignedChar === c.id ? 'selected' : ''}>${c.name}（进度+${getBanquetPrepRate(c.id)}%）</option>`
    ).join('');

    const progressColor = b.isPrepDone ? '#4caf50' : '#ff9800';

    banquetTrackerHTML = `
      <div class="card" style="cursor:default;background:#fff3e0;border-color:#ff9800;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <b>🎊 ${b.name}筹备中</b>
          <span style="color:#d32f2f;font-weight:bold">剩 ${b.weeksLeft} 周</span>
        </div>
        
        <div class="ledger-row"><span>1. 解锁 ${recipe.name}</span><span>${isUnlocked ? '✅' : '❌ 未解锁'}</span></div>
        
        <div style="margin-top:8px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
            <span>2. 筹备进度</span>
            <span style="color:${progressColor};font-weight:bold;">${b.prepProgress}% ${b.isPrepDone ? '✅' : ''}</span>
          </div>
          <div class="energy-bar" style="height:8px;background:#eee;border-radius:4px;overflow:hidden;">
            <div style="width:${b.prepProgress}%;height:100%;background:${progressColor};transition:width 0.3s;"></div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; font-size:12px; margin-top:6px;">
          <span>指派筹备：</span>
          <select onchange="changeBanquetPrep(this.value)" style="padding:4px;font-size:12px" ${b.isPrepDone ? 'disabled' : ''}>
            <option value="">（未指派）</option>
            ${charOptions}
          </select>
        </div>
        <p style="font-size:11px;color:#888;margin-top:6px">筹备人员本周工作效率会下降 30%</p>
        
        <div class="ledger-row" style="margin-top:6px"><span>3. 宴席当周全员精力≥20</span><span>（结算时判定）</span></div>
      </div>
    `;
  }

  // ============ 渲染 ============
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
    
    <div style="padding: 10px 12px 0 12px;">
      ${banquetTrackerHTML}
    </div>

    <div class="home-bottom-bar">
      <button class="settle-btn" onclick="settle()">
        ${state.banquet && state.banquet.weeksLeft === 1 ? '🎊 举办宴席结算' : (canOperate && state.menu.length > 0 ? '营业结算' : '结算（餐馆未营业）')}
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

// 辅助函数：指派宴席筹备人员
function changeBanquetPrep(charId) {
  if (state.banquet) {
    state.banquet.prepAssignedChar = charId || null;
    renderHome(); // 刷新UI
  }
}