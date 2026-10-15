function renderMenu() {
  const el = document.getElementById('page-menu');

  const avail = getAvailableRecipes();
  const menuSet = new Set(state.menu);

  const kitchenChars = characters.filter(c => c.current.task === 'kitchen');
  const kitchenText = kitchenChars.length > 0
    ? kitchenChars.map(c => c.name).join('、')
    : '（后厨没人）';

  const menuCost = getMenuCost();
  const affordable = menuCost <= state.cash;
  const costCls = affordable ? '' : 'color:#d32f2f;font-weight:bold';

  const listHTML = RECIPES.map(r => {
    const canMake = avail.indexOf(r.id) >= 0;
    const inMenu = menuSet.has(r.id);
    const cls = canMake ? (inMenu ? 'recipe-item selected' : 'recipe-item') : 'recipe-item disabled';

    return `
      <div class="${cls}" onclick="${canMake ? `toggleMenu('${r.id}')` : ''}">
        <div class="recipe-info">
          <div><b>${r.name}</b> <span style="color:#888;font-size:12px">${r.category}</span></div>
          <div style="font-size:12px;color:#666">
            成本 ${r.cost} · 售价 ${r.price} · 吸引力 ${r.appeal}
          </div>
          ${!canMake ? '<div style="font-size:11px;color:#c62828">后厨没人会做</div>' : ''}
        </div>
        <div class="recipe-check">${inMenu ? '✔' : ''}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <h3>本周菜单</h3>
    <div class="card" style="cursor:default">
      <div class="ledger-row"><span>后厨</span><span>${kitchenText}</span></div>
      <div class="ledger-row"><span>已选</span><span>${state.menu.length} / ${CONFIG.menuMax}</span></div>
      <div class="ledger-row"><span>菜单成本</span><span style="${costCls}">${menuCost} / 现金 ${Math.round(state.cash)}</span></div>
    </div>

    <h3 style="margin-top:12px">可选菜谱</h3>
    ${listHTML}
  `;
}

function toggleMenu(recipeId) {
  const idx = state.menu.indexOf(recipeId);

  if (idx >= 0) {
    state.menu.splice(idx, 1);
    renderMenu();
    return;
  }

  if (state.menu.length >= CONFIG.menuMax) {
    alert('菜单最多 ' + CONFIG.menuMax + ' 道菜。');
    return;
  }

  const tempMenu = state.menu.concat(recipeId);
  const tempCost = tempMenu.reduce((s, id) => {
    const r = RECIPES.find(x => x.id === id);
    return s + (r ? r.cost : 0);
  }, 0) * CONFIG.menuCostMultiplier;

  if (tempCost > state.cash) {
    alert(
      '现金不足！\n' +
      '这个菜单需要 ' + tempCost + ' 现金（成本×' + CONFIG.menuCostMultiplier + '）\n' +
      '当前只有 ' + Math.round(state.cash) + '。'
    );
    return;
  }

  state.menu.push(recipeId);
  renderMenu();
}