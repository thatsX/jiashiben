/* ============================================================
   systems/cutscene.js —— 场景剧本播放器
   ============================================================ */

let cutsceneQueue = [];
let cutsceneCallback = null;
let cutsceneCurrent = null;
let cutsceneLineIdx = 0;
let cutsceneScene = { bg: '', sprites: [], decos: [], portrait: null, portraitSide: 'center' };
let cutsceneAutoTimer = null;

function playCutscenes(scripts, callback) {
  cutsceneQueue = scripts.slice();
  cutsceneCallback = callback || null;
  cutsceneScene = { bg: '', sprites: [], decos: [], portrait: null, portraitSide: 'center' };
  nextCutscene();
}

function playCutscene(script, callback) {
  playCutscenes([script], callback);
}

function nextCutscene() {
  if (cutsceneAutoTimer) {
    clearTimeout(cutsceneAutoTimer);
    cutsceneAutoTimer = null;
  }

  if (cutsceneQueue.length === 0) {
    const cb = cutsceneCallback;
    cutsceneCallback = null;
    cutsceneCurrent = null;
    cleanupCutscene();
    if (cb) cb();
    return;
  }
  cutsceneCurrent = cutsceneQueue.shift();
  cutsceneLineIdx = 0;
  cutsceneScene = { bg: '', sprites: [], decos: [], portrait: null, portraitSide: 'center' };
  renderCutsceneLine();
}

function renderCutsceneLine() {
  if (!cutsceneCurrent) return;

  if (cutsceneAutoTimer) {
    clearTimeout(cutsceneAutoTimer);
    cutsceneAutoTimer = null;
  }

  const line = cutsceneCurrent.lines[cutsceneLineIdx];
  const isLastLine = cutsceneLineIdx >= cutsceneCurrent.lines.length - 1;

  if (line.bg !== undefined) cutsceneScene.bg = line.bg;
  if (line.sprites !== undefined) cutsceneScene.sprites = line.sprites;
  if (line.decos !== undefined) cutsceneScene.decos = line.decos;
  if (line.portrait !== undefined) cutsceneScene.portrait = line.portrait;
  if (line.portraitSide !== undefined) cutsceneScene.portraitSide = line.portraitSide;

  const modal = document.getElementById('modal');
  modal.classList.add('show');
  modal.classList.add('cutscene');
  document.getElementById('modal-btn').style.display = 'none';

  const bgStyle = cutsceneScene.bg
    ? `background-image:url('${cutsceneScene.bg}');`
    : '';

  // 道具层（被子、桌子之类的装饰）
  const decosHTML = (cutsceneScene.decos || []).map(d => {
    const w = d.w || 100;
    const h = d.h || 30;
    const bg = d.color || '#fff';
    const color = d.textColor || '#333';
    const fontSize = d.fontSize || 12;
    const border = d.border !== undefined ? d.border : '2px solid #333';
    return `
      <div class="cutscene-deco"
           style="left:${d.x}%; top:${d.y}%; width:${w}px; height:${h}px;
                  background:${bg}; color:${color}; font-size:${fontSize}px;
                  border:${border};">
        ${d.text || ''}
      </div>
    `;
  }).join('');

  // 小人层
  const spritesHTML = (cutsceneScene.sprites || []).map(s => {
    const c = characters.find(x => x.id === s.id);
    if (!c) return '';
    const info = spriteInnerHTML(c, false);
    const animClass = s.anim ? ' anim-' + s.anim : '';
    return `
      <div class="${info.className}${animClass}"
           style="left:${s.x}%; top:${s.y}%; transition:none;">
        ${info.html}
      </div>
    `;
  }).join('');

  let portraitHTML = '';
  if (cutsceneScene.portrait) {
    const side = cutsceneScene.portraitSide || 'center';
    portraitHTML = `
      <div class="cutscene-portrait cutscene-portrait-${side}">
        <img src="assets/chars_full/${cutsceneScene.portrait}.png"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="portrait-fallback">${cutsceneScene.portrait}</div>
      </div>
    `;
  }

  let lineHTML;
  if (line.who) {
    lineHTML = `<span class="speaker">${line.who}：</span>${line.say}`;
  } else {
    lineHTML = `<span style="color:#666">${line.text}</span>`;
  }

  const hintText = line.auto
    ? ''
    : (isLastLine ? '点击结束' : '▼ 点击继续');

  document.getElementById('modal-text').innerHTML = `
    <div class="cutscene-root" style="${bgStyle}">
      <div class="cutscene-stage">
        ${decosHTML}
        ${spritesHTML}
      </div>
      ${portraitHTML}
      <div class="cutscene-dialogue" onclick="advanceCutscene()">
        <div class="cutscene-line">${lineHTML}</div>
        <div class="cutscene-hint">${hintText}</div>
      </div>
    </div>
  `;

  if (line.auto) {
    const delay = (typeof line.auto === 'number') ? line.auto : 1200;
    cutsceneAutoTimer = setTimeout(() => {
      cutsceneAutoTimer = null;
      advanceCutscene();
    }, delay);
  }
}

function advanceCutscene() {
  if (!cutsceneCurrent) return;

  if (cutsceneAutoTimer) {
    clearTimeout(cutsceneAutoTimer);
    cutsceneAutoTimer = null;
  }

  cutsceneLineIdx++;
  if (cutsceneLineIdx >= cutsceneCurrent.lines.length) {
    nextCutscene();
    return;
  }
  renderCutsceneLine();
}

function cleanupCutscene() {
  if (cutsceneAutoTimer) {
    clearTimeout(cutsceneAutoTimer);
    cutsceneAutoTimer = null;
  }
  document.getElementById('modal').classList.remove('cutscene');
  closeModal();
}