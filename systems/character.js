function showCharStatus(charId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;

  const task = TASKS.find(t => t.id === c.current.task);
  let taskName;
  if (c.current.task === 'work') {
    const shop = SHOPS.find(s => s.id === c.current.workShop);
    taskName = shop ? '打工（' + shop.name + '）' : '打工';
  } else {
    taskName = task ? task.name : '无';
  }

  const zone = TASK_ZONE[c.current.task];
  const zoneText = { restaurant: '餐馆', home: '家中', outside: '外出' }[zone] || '未知';

  const skillsText = c.skills.length > 0
    ? c.skills.map(id => {
        const r = RECIPES.find(x => x.id === id);
        return r ? r.name : id;
      }).join('、')
    : '（不会做菜）';

  const canTalk = !c.current.talkedThisWeek;

  const bonusHTML = `
    <div class="ledger-row"><span>后厨加成</span><span>×${getEffectivePositionBonus(c, 'kitchen').toFixed(2)}</span></div>
    <div class="ledger-row"><span>洗碗加成</span><span>×${getEffectivePositionBonus(c, 'wash').toFixed(2)}</span></div>
    <div class="ledger-row"><span>前台加成</span><span>×${getEffectivePositionBonus(c, 'front').toFixed(2)}</span></div>
    <div class="ledger-row"><span>采购上涨</span><span>+${(getEffectivePositionBonus(c, 'buy') * 100).toFixed(0)}%</span></div>
  `;

  let stateTag = '';
  if (isExhausted(c)) {
    stateTag = '<span class="exhausted-tag">筋疲力尽</span>';
  } else if (isTired(c)) {
    stateTag = '<span class="tired-tag">疲惫</span>';
  }

  showModal(`
    <div style="text-align:center;margin-bottom:12px">
      ${avatarHTML(c.id, 'chars', 64)}
      <h3 style="margin-top:6px">${c.name} ${stateTag}</h3>
      <p style="color:#888;font-size:12px">好感 ${c.current.affinity}</p>
    </div>
    <div class="ledger-row"><span>当前任务</span><span>${taskName}</span></div>
    <div class="ledger-row"><span>所在位置</span><span>${zoneText}</span></div>
    <div class="ledger-row"><span>精力</span><span>${Math.round(c.current.energy)} / ${c.traits.energyMax}</span></div>
    <div class="ledger-row" style="align-items:flex-start">
      <span>会做的菜</span>
      <span style="text-align:right;max-width:60%">${skillsText}</span>
    </div>
    <h4 style="margin-top:10px;font-size:13px">岗位加成${isTired(c) ? '（疲惫 ×0.7）' : ''}</h4>
    ${bonusHTML}

    <button class="talk-btn"
            ${!canTalk ? 'disabled' : ''}
            onclick="talkToChar('${c.id}')">
      ${canTalk ? '💬 聊聊天（+5 好感）' : '本周已聊过'}
    </button>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function talkToChar(charId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;
  if (c.current.talkedThisWeek) {
    alert(c.name + ' 本周已经聊过了。');
    return;
  }

  c.current.talkedThisWeek = true;
  c.current.affinity += 5;

  const lines = STORY.talk[c.name] || ['……'];
  const line = lines[Math.floor(Math.random() * lines.length)];

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

  const active = document.querySelector('.page.active');
  if (active && active.id === 'page-family') {
    renderFamily();
  }
}

function openSchedule() {
  const rows = characters.map(c => {
    const isWorking = c.current.task === 'work';
    const shop = isWorking ? SHOPS.find(s => s.id === c.current.workShop) : null;
    const energyPct = (c.current.energy / c.traits.energyMax) * 100;
    const exhausted = isExhausted(c);
    const tired = isTired(c);
    const criticalClass = exhausted ? 'critical' : '';

    let statusTag = '';
    if (exhausted) statusTag = '<span class="exhausted-tag">筋疲力尽</span>';
    else if (tired) statusTag = '<span class="tired-tag">疲惫</span>';

    let controlHTML;
    if (exhausted) {
      controlHTML = `
        <div class="work-locked" style="border-color:#999;background:#f0f0f0">
          <div style="font-weight:bold;color:#616161">筋疲力尽</div>
        </div>
      `;
    } else if (isWorking) {
      controlHTML = `
        <div class="work-locked">
          <div style="font-weight:bold;color:#4caf50">打工中</div>
          <div style="font-size:11px;color:#666">${shop ? shop.name : ''}</div>
        </div>
      `;
    } else {
      const taskOptions = TASKS.map(t => {
        const disabled = (t.id === 'front' || t.id === 'buy') && !c.traits.canExpose;
        const selected = c.current.task === t.id;
        return '<option value="' + t.id + '" ' +
               (selected ? 'selected' : '') + ' ' +
               (disabled ? 'disabled' : '') + '>' + t.name + '</option>';
      }).join('');
      controlHTML = `<select onchange="changeTask('${c.id}', this.value)">${taskOptions}</select>`;
    }

    return `
      <div class="schedule-row">
        <div class="schedule-avatar">${avatarHTML(c.id, 'chars', 40)}</div>
        <div class="schedule-info">
          <div><b>${c.name}</b> ${statusTag}</div>
          <div class="energy-bar">
            <div class="energy-fill ${criticalClass}" style="width:${energyPct}%"></div>
          </div>
          <div style="font-size:11px;color:#888">精力 ${Math.round(c.current.energy)}/${c.traits.energyMax}</div>
        </div>
        ${controlHTML}
      </div>
    `;
  }).join('');

  showModal(`
    <h3 style="margin-bottom:12px">家庭成员排班</h3>
    ${rows}
    <p style="font-size:12px;color:#888;margin-top:12px">
      提示：餐馆需要同时有 后厨 / 洗碗 / 前台 才能营业。<br>
      打工请去「商店街」页。要取消打工请到对应店铺点击角色。
    </p>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function changeTask(charId, taskId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;
  if (c.current.task === 'work') return;
  if (isExhausted(c)) {
    alert(c.name + ' 已筋疲力尽，只能休息。');
    openSchedule();
    return;
  }

  const oldTask = c.current.task;
  c.current.task = taskId;
  c.current.workShop = null;

  updateWorkPositions();
  if (TASK_ZONE[taskId] === 'home' && TASK_ZONE[oldTask] !== 'home') {
    assignHomeInitialPosition(c);
  }
  syncMenuWithKitchen();

  openSchedule();
  renderPage('family');
}

// ============================================================
//   岗位台快速排班
// ============================================================
function openStationSchedule(stationId) {
  const stationNames = {
    kitchen: '灶台',
    wash: '洗碗槽',
    front: '收银台',
  };

  const taskDef = TASKS.find(t => t.id === stationId);
  const taskName = taskDef ? taskDef.name : stationId;

  // 该岗位当前人数
  const inPosition = characters.filter(c => c.current.task === stationId);
  const currentCount = inPosition.length;
  const maxCount = 2;
  const isFull = currentCount >= maxCount;

  // 该岗位的消耗（用于显示）
  let costMult = 1;
  if (currentCount >= 2) {
    if (stationId === 'front' || stationId === 'kitchen' || stationId === 'wash') {
      costMult = 2 / 3;
    }
  }
  const baseCost = taskDef ? Math.round(taskDef.energyCost * costMult) : 0;

  // 候选
  const needExpose = (stationId === 'front' || stationId === 'buy');

  const candidates = characters.filter(c => {
    if (c.current.task === 'work') return false;
    if (isExhausted(c)) return false;
    if (needExpose && !c.traits.canExpose) return false;
    return true;
  });

  const charsHTML = candidates.map(c => {
    const currentTask = TASKS.find(t => t.id === c.current.task);
    const currentTaskName = currentTask ? currentTask.name : '无';
    const isCurrent = c.current.task === stationId;
    const tired = isTired(c);
    const tiredTag = tired ? '<span class="tired-tag">疲惫</span>' : '';

    // 分配后剩余精力
    const afterEnergy = Math.round(c.current.energy) - baseCost;
    const canAssignByEnergy = afterEnergy >= 0;

    // 岗位满了且不在这个岗位 → 不可选
    const blockByFull = isFull && !isCurrent;

    const canAssign = canAssignByEnergy && !blockByFull;

    let cls = 'worker-option';
    if (isCurrent) cls += ' selected';
    if (!canAssign) cls += ' disabled';

    const click = canAssign ? `onclick="assignToStation('${c.id}','${stationId}')"` : '';

    let hint = '';
    if (!canAssignByEnergy) {
      hint = '<span style="color:#c62828;font-size:11px">精力不足</span>';
    } else if (blockByFull) {
      hint = '<span style="color:#c62828;font-size:11px">岗位已满</span>';
    }

    const currentTag = isCurrent ? '<span style="color:#4caf50;font-size:11px">✔ 当前岗位</span>' : '';

    return `
      <div class="${cls}" ${click}>
        ${avatarHTML(c.id, 'chars', 36)}
        <div class="worker-info">
          <div><b>${c.name}</b> ${hint} ${tiredTag} ${currentTag}</div>
          <div style="font-size:11px;color:#666">
            当前：${currentTaskName} · 精力 ${Math.round(c.current.energy)}/${c.traits.energyMax} · 消耗 ${baseCost}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const workingChars = characters.filter(c => c.current.task === 'work');
  let workingHint = '';
  if (workingChars.length > 0) {
    workingHint = `<p style="font-size:11px;color:#888;margin-top:8px;text-align:center">
      打工中的角色需先到商店街取消打工才能调回岗位
    </p>`;
  }

  const countHTML = `<p style="font-size:12px;color:${isFull ? '#d32f2f' : '#666'};margin-bottom:8px;text-align:center">
    当前人数：${currentCount} / ${maxCount}${isFull ? '（已满）' : ''}
  </p>`;

  showModal(`
    <h3>${stationNames[stationId] || stationId}</h3>
    <p style="font-size:12px;color:#666;margin-bottom:8px">
      选择谁来这个岗位。再点一次可以取消。
    </p>
    ${countHTML}
    ${charsHTML}
    ${workingHint}
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function assignToStation(charId, stationId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;

  // 前台 / 采购：不能露面的角色禁止
  const needExpose = (stationId === 'front' || stationId === 'buy');
  if (needExpose && !c.traits.canExpose) {
    alert(c.name + ' 不能做这个岗位。');
    return;
  }

  // 已经在此岗位 → 取消，改休息
  if (c.current.task === stationId) {
    c.current.task = 'rest';
    c.current.workShop = null;
    assignHomeInitialPosition(c);
  } else {
    // 想加入新岗位：检查是否满员（只限 后厨/洗碗/前台）
    const limitStations = ['kitchen', 'wash', 'front'];
    if (limitStations.indexOf(stationId) >= 0) {
      const currentCount = characters.filter(x => x.current.task === stationId).length;
      if (currentCount >= 2) {
        alert('这个岗位已经满了（最多 2 人）。');
        return;
      }
    }

    c.current.task = stationId;
    c.current.workShop = null;
  }

  updateWorkPositions();
  syncMenuWithKitchen();

  renderPage('home');
  renderStatus();
  openStationSchedule(stationId);
}