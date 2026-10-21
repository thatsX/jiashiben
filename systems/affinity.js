/* ============================================================
   systems/affinity.js —— 好感度剧情系统
   ============================================================ */

// ============================================================
//   检查是否有新的好感度剧情可触发
// ============================================================
function checkAffinityTriggers() {
  const result = [];

  characters.forEach(c => {
    const stories = AFFINITY_STORIES[c.id] || [];
    stories.forEach(story => {
      const key = c.id + '_' + story.at;
      if (state.seenAffinityStories.indexOf(key) >= 0) return;
      if (c.current.affinity < story.at) return;
      result.push({ charId: c.id, story: story });
    });
  });

  // 按好感阈值从小到大排序（低阈值的先播）
  result.sort((a, b) => a.story.at - b.story.at);

  return result;
}

function markAffinitySeen(charId, threshold) {
  const key = charId + '_' + threshold;
  if (state.seenAffinityStories.indexOf(key) < 0) {
    state.seenAffinityStories.push(key);
  }
}

// ============================================================
//   播放流程
// ============================================================
let affinityQueue = [];
let affinityCallback = null;
let affinityCurrent = null;
let affinityLineIdx = 0;

function startAffinityFlow(stories, callback) {
  affinityQueue = stories.slice();
  affinityCallback = callback;
  nextAffinityStory();
}

function nextAffinityStory() {
  if (affinityQueue.length === 0) {
    const cb = affinityCallback;
    affinityCallback = null;
    affinityCurrent = null;
    if (cb) cb();
    return;
  }
  affinityCurrent = affinityQueue.shift();
  affinityLineIdx = 0;
  renderAffinityLine();
}

function renderAffinityLine() {
  if (!affinityCurrent) return;

  const { charId, story } = affinityCurrent;
  const c = characters.find(x => x.id === charId);
  const line = story.lines[affinityLineIdx];
  const isLastLine = affinityLineIdx >= story.lines.length - 1;

  const speaker = line.who;
  const hasLeye = story.lines.some(l => l.who === '蕾叶');

  // ★ 核心：获取当前要用的立绘文件名
  // 如果 line.img 有值，就用这个；否则如果是心玖，默认用 kokono_2；其他角色用原 id
  let charImgName = line.img || (charId === 'kokono' ? 'kokono_2' : charId);
  // 蕾叶的立绘也可以变，同理
  let leyeImgName = line.leyeImg || 'leye'; 

  let portraitsHTML = '';

  if (charId === 'leye') {
    portraitsHTML = `
      <div class="affinity-portrait center">
        <img src="assets/chars_full/${charImgName}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="portrait-fallback">须贺蕾叶</div>
      </div>
    `;
  } 
  else if (hasLeye) {
    let leyeClass = 'affinity-portrait left';
    let charClass = 'affinity-portrait right';

    if (speaker === '蕾叶') {
      leyeClass += ' speaking';
      charClass += ' dimmed';
    } else if (speaker) { 
      leyeClass += ' dimmed';
      charClass += ' speaking';
    } 

    portraitsHTML = `
      <div class="${leyeClass}">
        <img src="assets/chars_full/${leyeImgName}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="portrait-fallback">须贺蕾叶</div>
      </div>
      <div class="${charClass}">
        <img src="assets/chars_full/${charImgName}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="portrait-fallback">${c ? c.name : charId}</div>
      </div>
    `;
  } 
  else {
    portraitsHTML = `
      <div class="affinity-portrait center">
        <img src="assets/chars_full/${charImgName}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="portrait-fallback">${c ? c.name : charId}</div>
      </div>
    `;
  }

  let lineHTML;
  if (line.who) {
    lineHTML = `<p><span class="speaker">${line.who}：</span>${line.say}</p>`;
  } else {
    lineHTML = `<p style="color:#666">${line.text}</p>`;
  }

  const progressHTML = `<div class="affinity-progress">${affinityLineIdx + 1} / ${story.lines.length}</div>`;

  showModal(`
    <div class="affinity-scene">
      ${portraitsHTML}
    </div>
    <div class="affinity-line">
      ${lineHTML}
    </div>
    ${progressHTML}
  `);

  const btn = document.getElementById('modal-btn');
  btn.style.display = 'block';
  btn.textContent = isLastLine ? '完成' : '继续';
  btn.onclick = () => {
    if (isLastLine) {
      finishAffinityStory();
    } else {
      affinityLineIdx++;
      renderAffinityLine();
    }
  };
}

function finishAffinityStory() {
  const { charId, story } = affinityCurrent;

  // 应用奖励
  applyAffinityReward(charId, story.reward);

  // 标记已看
  markAffinitySeen(charId, story.at);

  // 展示奖励
  if (story.rewardText) {
    showModal(`
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:44px">✨</div>
        <h3 style="margin-top:10px;color:#d32f2f">好感度达成</h3>
        <p style="margin-top:12px;font-size:15px;font-weight:bold">${story.rewardText}</p>
      </div>
    `);
    const btn = document.getElementById('modal-btn');
    btn.style.display = 'block';
    btn.textContent = '好';
    btn.onclick = () => {
      closeModal();
      nextAffinityStory();
    };
    return;
  }

  nextAffinityStory();
}

// ============================================================
//   应用奖励
// ============================================================
function applyAffinityReward(charId, reward) {
  if (!reward) return;

  const list = Array.isArray(reward) ? reward : [reward];
  list.forEach(r => applySingleAffinityReward(charId, r));
}

function applySingleAffinityReward(charId, r) {
  const c = characters.find(x => x.id === charId);
  if (!c || !r || !r.type) return;

  switch (r.type) {
    case 'energyMax':
      c.traits.energyMax += r.value;
      // 顺手把当前精力也补一点
      c.current.energy = Math.min(c.traits.energyMax, c.current.energy + r.value);
      break;

    case 'recovery':
      c.traits.recovery += r.value;
      break;

    case 'positionBonus':
      if (r.task && c.positionBonus[r.task] !== undefined) {
        c.positionBonus[r.task] += r.value;
      }
      break;

    case 'workMultiplier':
      c.traits.workMultiplier += r.value;
      break;

    case 'unlockMusic':
      if (r.id && state.unlockedMusic.indexOf(r.id) < 0) {
        state.unlockedMusic.push(r.id);
      }
      break;

    case 'houseworkCost':
      state.houseworkCost = Math.max(0, state.houseworkCost + r.value);
      break;

    default:
      console.warn('未知好感度奖励类型:', r.type);
  }
}

// ============================================================
//   结算后触发
// ============================================================
function triggerAfterSettlement() {
  const stories = checkAffinityTriggers();

  if (stories.length === 0) {
    checkEnding();
    return;
  }

  startAffinityFlow(stories, () => {
    renderPage('home');
    renderStatus();
    checkEnding();
  });
}