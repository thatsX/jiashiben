/* ============================================================
   ui/shop.js —— 商店街
   ============================================================ */

function renderShop() {
  const el = document.getElementById('page-shop');

  const buildingsHTML = SHOPS.map(s => {
    // 该店正在打工的角色
    const workers = characters.filter(c =>
      c.current.task === 'work' && c.current.workShop === s.id
    );

    // 左上角小头像（最多 3 个）
    const avatarsHTML = workers.slice(0, 3).map(c =>
      `<div class="shop-worker-avatar" title="${c.name}">
         ${avatarHTML(c.id, 'chars', 28)}
       </div>`
    ).join('');

    return `
      <div class="shop-building"
           style="left:${s.x}%; top:${s.y}%"
           onclick="openShop('${s.id}')">
        <div class="shop-worker-bar">${avatarsHTML}</div>
        <div class="shop-name">${s.name}</div>
        <div class="shop-count">打工 ${s.workCount} 次</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div id="scene-shop">
      <div class="shop-road shop-road-h"></div>
      <div class="shop-road shop-road-v"></div>
      ${buildingsHTML}
    </div>
  `;
}

function openShop(shopId) {
  const shop = SHOPS.find(s => s.id === shopId);
  if (!shop) return;

  const workingHere = characters.filter(c => c.current.task === 'work' && c.current.workShop === shopId);

  const candidates = characters.filter(c =>
    c.current.task === 'rest' &&
    c.traits.canWork &&
    !isExhausted(c) &&
    !c.current.workShop
  );

  const recipesHTML = shop.recipes.map((rid, i) => {
    const r = RECIPES.find(x => x.id === rid);
    const need = shop.unlockAt[i];
    const unlocked = shop.workCount >= need;
    const cls = unlocked ? 'recipe-unlock unlocked' : 'recipe-unlock';
    return `
      <div class="${cls}">
        <span>${r ? r.name : rid}</span>
        <span>${unlocked ? '已解锁' : `打工 ${need} 次（${shop.workCount}/${need}）`}</span>
      </div>
    `;
  }).join('');

  const workerHTML = candidates.length > 0
    ? candidates.map(c => {
        const isNingetsu = c.traits.needEscort;
        const blockByEscort = isNingetsu && workingHere.length === 0;
        const cls = blockByEscort ? 'worker-option disabled' : 'worker-option';
        const click = blockByEscort ? '' : `onclick="toggleWorker('${shopId}','${c.id}')"`;
        const hint = blockByEscort ? '<span style="color:#c62828;font-size:11px">需要有人陪</span>' : '';
        const tiredTag = isTired(c) ? '<span class="tired-tag">疲惫</span>' : '';

        return `
          <div class="${cls}" ${click}>
            ${avatarHTML(c.id, 'chars', 36)}
            <div class="worker-info">
              <div><b>${c.name}</b> ${hint} ${tiredTag}</div>
              <div style="font-size:11px;color:#666">
                精力 ${Math.round(c.current.energy)}/${c.traits.energyMax}
                · 倍率 ${getEffectiveWorkMultiplier(c).toFixed(1)}x
              </div>
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color:#888;font-size:12px">没有可以打工的角色（需要处于休息状态、未筋疲力尽）。</p>';

  const selectedHTML = workingHere.length > 0
    ? workingHere.map(c => `
        <div class="worker-option selected" onclick="toggleWorker('${shopId}','${c.id}')">
          ${avatarHTML(c.id, 'chars', 36)}
          <div class="worker-info">
            <div><b>${c.name}</b> <span style="color:#4caf50;font-size:11px">✔ 打工中</span></div>
            <div style="font-size:11px;color:#666">
              精力 ${Math.round(c.current.energy)}/${c.traits.energyMax}
              · 倍率 ${getEffectiveWorkMultiplier(c).toFixed(1)}x
            </div>
          </div>
        </div>
      `).join('')
    : '';

  const income = workingHere.reduce((s, c) => s + shop.baseWage * getEffectiveWorkMultiplier(c), 0);

  showModal(`
    <h3>${shop.name}</h3>
    <div class="shop-info">
      <div class="ledger-row"><span>基础工资</span><span>${shop.baseWage}</span></div>
      <div class="ledger-row"><span>精力消耗</span><span>${shop.energyCost}</span></div>
      <div class="ledger-row"><span>累计打工</span><span>${shop.workCount} 次</span></div>
    </div>

    <h4 style="margin-top:12px">可获得菜谱</h4>
    ${recipesHTML}

    <h4 style="margin-top:12px">选择打工者</h4>
    ${selectedHTML}
    ${workerHTML}

    <div class="income-preview">
      预计收入：<b>${Math.round(income)}</b>
    </div>
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function toggleWorker(shopId, charId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;

  const isWorkingHere = c.current.task === 'work' && c.current.workShop === shopId;

  if (isWorkingHere) {
    c.current.task = 'rest';
    c.current.workShop = null;
    assignHomeInitialPosition(c);

    const workingHere = characters.filter(x => x.current.task === 'work' && x.current.workShop === shopId);
    const nonNingetsu = workingHere.filter(x => !x.traits.needEscort);
    if (nonNingetsu.length === 0) {
      workingHere.forEach(x => {
        if (x.traits.needEscort) {
          x.current.task = 'rest';
          x.current.workShop = null;
          assignHomeInitialPosition(x);
        }
      });
    }
  } else {
    if (isExhausted(c)) return;
    if (c.traits.needEscort) {
      const workingHere = characters.filter(x => x.current.task === 'work' && x.current.workShop === shopId);
      if (workingHere.length === 0) return;
    }
    c.current.task = 'work';
    c.current.workShop = shopId;
    c.current.position = { x: -20, y: 60 };
  }

  openShop(shopId);
}