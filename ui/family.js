function renderFamily() {
  const el = document.getElementById('page-family');

  const homeChars = characters.filter(c => TASK_ZONE[c.current.task] === 'home');
  homeChars.forEach(c => {
    if (!c.current.moveTimer || c.current.moveTimer <= 0) {
      assignHomeInitialPosition(c);
    }
  });

  const statusListHTML = characters.map(c => renderStatusCard(c)).join('');

  el.innerHTML = `
    <button style="width:100%;margin-bottom:12px" onclick="openSchedule()">
      📋 排班系统
    </button>
    <div id="scene-home">
      <div class="scene-floor"></div>
      <div id="scene-home-chars"></div>
      ${homeChars.length === 0 ? '<div class="scene-empty">大家都在外面忙……</div>' : ''}
    </div>
    <h3 style="margin-top:16px">家庭成员状态</h3>
    <div class="family-status-list">
      ${statusListHTML}
    </div>
  `;

  updateHomeCharsDOM();
}

function renderStatusCard(c) {
  const exhausted = isExhausted(c);
  const tired = isTired(c);
  const energyPct = (c.current.energy / c.traits.energyMax) * 100;

  const skillsText = c.skills.length > 0
    ? c.skills.map(id => {
        const r = RECIPES.find(x => x.id === id);
        return r ? r.name : id;
      }).join('、')
    : '（暂时不会做菜）';

  const talentText = (typeof TALENT !== 'undefined' && TALENT[c.id]) ? TALENT[c.id] : '—';

  let workTag = '';
  if (c.current.task === 'work') {
    const shop = SHOPS.find(s => s.id === c.current.workShop);
    workTag = `<span class="status-tag working">打工中${shop ? ' · ' + shop.name : ''}</span>`;
  } else if (c.current.task === 'rest') {
    workTag = `<span class="status-tag resting">休息中</span>`;
  }

  const talkTag = c.current.talkedThisWeek
    ? '<span class="status-tag talked">已聊过</span>'
    : '';

  const tiredTag = tired ? '<span class="tired-tag">疲惫</span>' : '';

  let cls = 'status-card';
  if (exhausted) cls += ' exhausted';
  else if (tired) cls += ' tired';

  return `
    <div class="${cls}" onclick="showCharStatus('${c.id}')">
      <div class="status-avatar">
        ${avatarHTML(c.id, 'chars', 52)}
      </div>
      <div class="status-info">
        <div class="status-name">
          <b>${c.name}</b>
          ${workTag}
          ${talkTag}
          ${tiredTag}
        </div>

        <div class="status-energy">
          <div class="status-energy-bar">
            <div class="status-energy-fill" style="width:${energyPct}%"></div>
          </div>
          <span class="status-energy-text">${Math.round(c.current.energy)}/${c.traits.energyMax}</span>
        </div>

        <div class="status-line"><b>会做：</b>${skillsText}</div>
        <div class="status-line"><b>擅长：</b>${talentText}</div>
      </div>

      ${exhausted ? '<div class="status-overlay">见加拿大老师中</div>' : ''}
    </div>
  `;
}

function updateHomeCharsDOM() {
  const el = document.getElementById('scene-home-chars');
  if (!el) return;

  const homeChars = characters.filter(c => TASK_ZONE[c.current.task] === 'home');

  Array.from(el.children).forEach(child => {
    if (!homeChars.find(c => c.id === child.dataset.charId)) {
      child.remove();
    }
  });

  homeChars.forEach(c => {
    let node = el.querySelector('[data-char-id="' + c.id + '"]');
    const info = spriteInnerHTML(c, true);

    if (!node) {
      node = document.createElement('div');
      node.className = info.className;
      node.dataset.charId = c.id;
      node.style.left = c.current.position.x + '%';
      node.style.top = c.current.position.y + '%';
      node.innerHTML = info.html;
      node.onclick = () => showCharStatus(c.id);
      el.appendChild(node);
    } else {
      node.className = info.className;
      node.style.left = c.current.position.x + '%';
      node.style.top = c.current.position.y + '%';

      const img = node.querySelector('img');
      if (img) {
        let spriteFile;
        if (isExhausted(c)) spriteFile = `assets/sprites/${c.id}_exhausted.png`;
        else if (isTired(c)) spriteFile = `assets/sprites/${c.id}_tired.png`;
        else spriteFile = `assets/sprites/${c.id}.png`;

        if (!img.src.endsWith(spriteFile)) {
          img.src = spriteFile;
        }
      }
    }
  });
}

function tickHomeChars(dt) {
  const homeChars = characters.filter(c => TASK_ZONE[c.current.task] === 'home');
  homeChars.forEach(c => {
    c.current.moveTimer -= dt;
    if (c.current.moveTimer <= 0) {
      c.current.position = {
        x: HOME_BOUNDS.xMin + Math.random() * (HOME_BOUNDS.xMax - HOME_BOUNDS.xMin),
        y: HOME_BOUNDS.yMin + Math.random() * (HOME_BOUNDS.yMax - HOME_BOUNDS.yMin),
      };
      c.current.moveTimer = 2000 + Math.random() * 3000;
    }
  });
}