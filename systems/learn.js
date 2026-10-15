let learnQueue = [];
let learnCurrentRecipe = null;
let learnSelected = [];
let pendingSettleData = null;

function startLearnFlow(recipeIds, settleData) {
  pendingSettleData = settleData;
  learnQueue = recipeIds.slice();
  nextLearnStep();
}

function nextLearnStep() {
  if (learnQueue.length === 0) {
    learnCurrentRecipe = null;
    learnSelected = [];
    const data = pendingSettleData;
    pendingSettleData = null;
    showSettlementDialogue(data);
    return;
  }
  learnCurrentRecipe = learnQueue.shift();
  learnSelected = [];
  renderLearnModal();
}

function renderLearnModal() {
  const recipe = RECIPES.find(r => r.id === learnCurrentRecipe);
  const remaining = learnQueue.length;

  const charsHTML = characters.map(c => {
    const selected = learnSelected.indexOf(c.id) >= 0;
    const knows = c.skills.indexOf(learnCurrentRecipe) >= 0;

    let cls = 'worker-option';
    let click = `onclick="toggleLearnSelect('${c.id}')"`;
    let hint = '';

    if (knows) {
      cls += ' disabled';
      click = '';
      hint = '<span style="color:#888;font-size:11px">（已经会了）</span>';
    } else if (selected) {
      cls += ' selected';
    }

    return `
      <div class="${cls}" ${click}>
        ${avatarHTML(c.id, 'chars', 36)}
        <div class="worker-info">
          <div><b>${c.name}</b> ${hint}</div>
          <div style="font-size:11px;color:#666">精力 ${Math.round(c.current.energy)}/${c.traits.energyMax}</div>
        </div>
        ${selected ? '<div style="color:#4caf50;font-weight:bold;font-size:18px">✔</div>' : ''}
      </div>
    `;
  }).join('');

  const confirmDisabled = learnSelected.length !== 2;

  showModal(`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:44px">🎉</div>
      <h2 style="color:#d32f2f;margin-top:6px;font-size:20px">恭喜获得菜谱！</h2>
      <h3 style="margin-top:8px;color:#333;font-size:18px">${recipe ? recipe.name : ''}</h3>
      <p style="font-size:12px;color:#888;margin-top:6px">
        ${recipe ? `${recipe.category} · 成本 ${recipe.cost} · 售价 ${recipe.price} · 吸引力 ${recipe.appeal}` : ''}
      </p>
      ${remaining > 0 ? `<p style="font-size:11px;color:#666;margin-top:8px">（还有 ${remaining} 道菜谱待学习）</p>` : ''}
    </div>

    <p style="font-size:13px;margin-bottom:10px;text-align:center">
      选择 <b>2 人</b> 学会制作它（已选 ${learnSelected.length}/2）
    </p>
    ${charsHTML}

    <button id="learn-confirm-btn"
            style="width:100%;margin-top:12px"
            ${confirmDisabled ? 'disabled' : ''}
            onclick="confirmLearn()">
      ${confirmDisabled ? '请选择 2 人' : '确认学习'}
    </button>
  `);

  document.getElementById('modal-btn').style.display = 'none';
}

function toggleLearnSelect(charId) {
  const c = characters.find(x => x.id === charId);
  if (!c) return;
  if (c.skills.indexOf(learnCurrentRecipe) >= 0) return;

  const idx = learnSelected.indexOf(charId);
  if (idx >= 0) {
    learnSelected.splice(idx, 1);
  } else {
    if (learnSelected.length >= 2) return;
    learnSelected.push(charId);
  }
  renderLearnModal();
}

function confirmLearn() {
  if (learnSelected.length !== 2) return;
  learnSelected.forEach(cid => {
    const c = characters.find(x => x.id === cid);
    if (c && c.skills.indexOf(learnCurrentRecipe) < 0) {
      c.skills.push(learnCurrentRecipe);
    }
  });
  nextLearnStep();
}