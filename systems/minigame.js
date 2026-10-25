/* ============================================================
   systems/minigame.js —— 任务 E 训斥弹幕对轰
   ============================================================ */

let mgLoop = null;
let mgState = null;

function startKokonoMinigame(onFinish) {
  if (mgLoop) clearInterval(mgLoop);

  // 游戏状态
  mgState = {
    leyeX: 50,         // 0~100%
    leyeHp: 100,
    kokonoHp: 100,     // 训斥值
    bullets: [],       // 蕾叶的直球
    barrage: [],       // 心玖的弹幕
    keys: { left: false, right: false },
    lastBarrage: 0,
    lastShoot: 0,
    time: 0,
    finished: false,
    onFinish: onFinish
  };

  showModal(`
    <div style="text-align:center;padding:4px 0">
      <h3 style="color:#d32f2f">家庭会议</h3>
      <p style="font-size:12px;color:#666;margin-bottom:8px">不知道啊，怎么变成这样了！杯面中毒了？</p>
    </div>
    
    <div id="mg-arena" style="position:relative;width:100%;height:360px;background:#222;border:2px solid #333;border-radius:8px;overflow:hidden;margin:0 auto;">
      <!-- 心玖 -->
      <div id="mg-kokono" style="position:absolute;top:10px;left:50%;transform:translateX(-50%);width:60px;height:80px;background:url('assets/sprites/kokono.png') center/contain no-repeat;filter:drop-shadow(0 0 5px #d32f2f)"></div>
      <!-- 训斥值条（心玖血条） -->
      <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);width:120px;height:8px;background:#555;border-radius:4px;overflow:hidden">
        <div id="mg-kokono-hp" style="width:100%;height:100%;background:#d32f2f;transition:width 0.1s"></div>
      </div>

      <!-- 蕾叶 -->
      <div id="mg-leye" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:60px;height:80px;background:url('assets/sprites/leye.png') center/contain no-repeat;filter:drop-shadow(0 0 5px #4caf50)"></div>
      <!-- 精力条（蕾叶血条） -->
      <div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:120px;height:8px;background:#555;border-radius:4px;overflow:hidden">
        <div id="mg-leye-hp" style="width:100%;height:100%;background:#4caf50;transition:width 0.1s"></div>
      </div>

      <!-- 实体容器 -->
      <div id="mg-entities" style="position:absolute;inset:0;pointer-events:none;"></div>
    </div>

    <!-- 移动端控制按钮 -->
    <div style="display:flex;justify-content:space-between;margin-top:10px;">
      <div style="display:flex;gap:10px;">
        <button id="mg-btn-left" style="width:60px;height:50px;font-size:20px;">◀</button>
        <button id="mg-btn-right" style="width:60px;height:50px;font-size:20px;">▶</button>
      </div>
      <button id="mg-btn-shoot" style="flex:1;height:50px;background:#b8860b;color:#000;font-weight:bold;margin-left:10px;">反驳！</button>
    </div>
  `);
  document.getElementById('modal-btn').style.display = 'none';

  // 绑定事件
  const btnL = document.getElementById('mg-btn-left');
  const btnR = document.getElementById('mg-btn-right');
  const btnS = document.getElementById('mg-btn-shoot');

  const startMove = (k) => { mgState.keys[k] = true; };
  const stopMove = (k) => { mgState.keys[k] = false; };

  btnL.onmousedown = () => startMove('left');
  btnL.onmouseup = btnL.onmouseleave = () => stopMove('left');
  btnL.ontouchstart = (e) => { e.preventDefault(); startMove('left'); };
  btnL.ontouchend = () => stopMove('left');

  btnR.onmousedown = () => startMove('right');
  btnR.onmouseup = btnR.onmouseleave = () => stopMove('right');
  btnR.ontouchstart = (e) => { e.preventDefault(); startMove('right'); };
  btnR.ontouchend = () => stopMove('right');

  btnS.onclick = () => mgShoot();

  // 主循环 (60fps)
  mgLoop = setInterval(mgTick, 1000 / 60);
}

// 蕾叶发射
function mgShoot() {
  if (mgState.finished) return;
  const now = Date.now();
  if (now - mgState.lastShoot < 300) return; // 射速限制
  mgState.lastShoot = now;

  const text = LEYE_COUNTERS[Math.floor(Math.random() * LEYE_COUNTERS.length)].text;
  const b = { x: mgState.leyeX, y: 85, text: text, speed: 2 };
  mgState.bullets.push(b);
}

// 游戏循环
function mgTick() {
  if (!mgState || mgState.finished) return;
  mgState.time += 16;

  // 1. 移动
  if (mgState.keys.left) mgState.leyeX = Math.max(10, mgState.leyeX - 1.2);
  if (mgState.keys.right) mgState.leyeX = Math.min(90, mgState.leyeX + 1.2);
  document.getElementById('mg-leye').style.left = mgState.leyeX + '%';

  // 2. 生成心玖弹幕
  if (Date.now() - mgState.lastBarrage > 800 && mgState.kokonoHp > 0) {
    mgState.lastBarrage = Date.now();
    const tpl = KOKONO_BARRAGE[Math.floor(Math.random() * KOKONO_BARRAGE.length)];
    mgState.barrage.push({
      x: 20 + Math.random() * 60, // 随机 x 轴下落
      y: 20,
      text: tpl.text,
      speed: 1.5,
      damage: tpl.damage || 1
    });
  }

  // 3. 更新直球
  for (let i = mgState.bullets.length - 1; i >= 0; i--) {
    const b = mgState.bullets[i];
    b.y -= b.speed;
    
    // 碰撞心玖 (y < 25, x 在 40~60 之间)
    if (b.y < 25 && b.x > 35 && b.x < 65) {
      mgState.kokonoHp = Math.max(0, mgState.kokonoHp - 5);
      document.getElementById('mg-kokono-hp').style.width = mgState.kokonoHp + '%';
      mgState.bullets.splice(i, 1);
      continue;
    }
    if (b.y < 0) mgState.bullets.splice(i, 1);
  }

  // 4. 更新弹幕
  for (let i = mgState.barrage.length - 1; i >= 0; i--) {
    const bar = mgState.barrage[i];
    bar.y += bar.speed;

    // 碰撞蕾叶 (y > 80, x 差值 < 10%)
    if (bar.y > 80 && Math.abs(bar.x - mgState.leyeX) < 8) {
      mgState.leyeHp = Math.max(0, mgState.leyeHp - 10);
      document.getElementById('mg-leye-hp').style.width = mgState.leyeHp + '%';
      mgState.barrage.splice(i, 1);
      continue;
    }
    if (bar.y > 100) mgState.barrage.splice(i, 1);
  }

  // 5. 渲染实体
  renderMgEntities();

  // 6. 判定胜负
  if (mgState.kokonoHp <= 0) {
    mgEndGame(true);
  } else if (mgState.leyeHp <= 0) {
    mgEndGame(false); // 狼狈通关
  }
}

function renderMgEntities() {
  const el = document.getElementById('mg-entities');
  let html = '';

  // 直球 (蕾叶的反驳)
  mgState.bullets.forEach(b => {
    html += `<div style="position:absolute;left:${b.x}%;top:${b.y}%;transform:translate(-50%,-50%);
      background:#4caf50;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;white-space:nowrap;
      box-shadow:0 0 5px #4caf50;">${b.text}</div>`;
  });

  // 弹幕 (心玖的训斥)
  mgState.barrage.forEach(b => {
    html += `<div style="position:absolute;left:${b.x}%;top:${b.y}%;transform:translate(-50%,-50%);
      background:#d32f2f;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;white-space:nowrap;
      box-shadow:0 0 5px #d32f2f;">${b.text}</div>`;
  });

  el.innerHTML = html;
}

function mgEndGame(win) {
  mgState.finished = true;
  clearInterval(mgLoop);
  
  const cb = mgState.onFinish;
  
  showModal(`
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:40px">${win ? '🏆' : '💦'}</div>
      <h3 style="color:${win ? '#4caf50' : '#ff9800'};margin-top:10px">${win ? '教父的胜利' : '狼狈通关'}</h3>
      <p style="margin-top:12px;font-size:14px;line-height:1.6">
        ${win ? '“Family，胜利！”<br>真的是拿你没办法……' : '虽然被骂得狗血淋头，但心玖最后还是叹了口气…算是过关了？'}
      </p>
      <p style="color:#b8860b;font-weight:bold;margin-top:10px">黑道声望 +${win ? 120 : 80}</p>
    </div>
    <button style="width:100%" onclick="closeModal(); if(typeof mgFinishCallback === 'function') mgFinishCallback(${win});">结束</button>
  `);
  document.getElementById('modal-btn').style.display = 'none';
}

const KOKONO_BARRAGE = [
  { text: '不要再跑划小船门口叫Family…', damage: 1 },
  { text: '教母到底是谁教的？', damage: 1 },
  { text: '还买杯面…', damage: 2 },
  { text: '这日子过不下去了！', damage: 1 },
  { text: '看着我！', damage: 1 },
];

const LEYE_COUNTERS = [
  { text: '过的下去过的下去！' },
  { text: '你明明也在关心吧~' },
  { text: '呜，心玖~' },
  { text: '心玖有在摸耳朵吧~' },
];