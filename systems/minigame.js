/* ============================================================
   systems/minigame.js —— 任务 E 训斥弹幕对轰 (完整版)
   ============================================================ */

let mgLoop = null;
let mgState = null;

function startKokonoMinigame(onFinish) {
  // ★ 清理可能残留的循环和事件，防止加速/卡死
  if (mgLoop) clearInterval(mgLoop);
  window.removeEventListener('keydown', mgKeyDown);
  window.removeEventListener('keyup', mgKeyUp);

  // 游戏状态
  mgState = {
    leyeX: 50,         
    leyeHp: 100,        
    leyeMaxHp: 100,
    
    kokonoX: 50,       
    kokonoVx: 0.5,     
    lastKokonoTurn: 0, 
    kokonoHp: 200,     
    kokonoMaxHp: 200,
    
    phase: 1,          
    phase2Timer: 0,
    invincibleTimer: 0,    

    bullets: [],       
    barrage: [],       
    charges: [],       
    washers: [],       
    noodles: [],       
    
    keys: { left: false, right: false },
    lastBarrage: Date.now() + 2000, 
    lastShoot: 0,
    lastWasher: Date.now() + 4000,
    lastCharge: Date.now() + 5000,
    lastNoodle: Date.now() + 6000,
    finished: false,
    onFinish: onFinish
  };

  showModal(`
    <div style="text-align:center;padding:4px 0">
      <h3 style="color:#d32f2f">家庭会议</h3>
      <p style="font-size:12px;color:#666;margin-bottom:8px">到底为什么会变成这样？杯面中毒了？！</p>
    </div>
    
    <div id="mg-arena" style="position:relative;width:100%;height:360px;background:#222;border:2px solid #333;border-radius:8px;overflow:hidden;margin:0 auto;">
      
      <!-- 飘字层 -->
      <div id="mg-toast" style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:18px;font-weight:bold;text-shadow:0 0 5px #d32f2f;z-index:20;pointer-events:none;white-space:nowrap;opacity:0;transition:opacity 0.5s;"></div>

      <!-- 心玖 (黑道立绘) -->
      <img id="mg-kokono" src="assets/sprites/kokono_mafia.png" onerror="this.src='assets/sprites/kokono.png'" style="position:absolute;top:10px;left:50%;transform:translateX(-50%);width:60px;height:80px;object-fit:contain;filter:drop-shadow(0 0 5px #d32f2f)">
      
      <!-- 训斥值条（心玖血条） -->
      <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);width:120px;height:8px;background:#555;border-radius:4px;overflow:hidden">
        <div id="mg-kokono-hp" style="width:100%;height:100%;background:#d32f2f;transition:width 0.1s"></div>
      </div>

      <!-- 蕾叶 (黑道立绘) -->
      <img id="mg-leye" src="assets/sprites/leye_mafia.png" onerror="this.src='assets/sprites/leye.png'" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:60px;height:80px;object-fit:contain;filter:drop-shadow(0 0 5px #4caf50)">
      
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

  // 绑定手机端事件
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

  // 绑定键盘事件
  window.addEventListener('keydown', mgKeyDown);
  window.addEventListener('keyup', mgKeyUp);

  // 主循环
  mgLoop = setInterval(mgTick, 1000 / 60);
}

function mgKeyDown(e) {
  if (!mgState || mgState.finished) return;
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') mgState.keys.left = true;
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') mgState.keys.right = true;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); mgShoot(); }
}

function mgKeyUp(e) {
  if (!mgState || mgState.finished) return;
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') mgState.keys.left = false;
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') mgState.keys.right = false;
}

function mgShoot() {
  if (mgState.finished || mgState.phase === 0) return;
  const now = Date.now();
  if (now - mgState.lastShoot < 300) return; // 射击冷却
  mgState.lastShoot = now;

  const text = LEYE_COUNTERS[Math.floor(Math.random() * LEYE_COUNTERS.length)].text;
  const b = { x: mgState.leyeX, y: 85, text: text, speed: 3 };
  mgState.bullets.push(b);
}

function mgTick() {
  if (!mgState || mgState.finished) return;
  if (mgState.invincibleTimer > 0) {
    mgState.invincibleTimer--;
  }

  // 1. 移动蕾叶
  if (mgState.keys.left) mgState.leyeX = Math.max(10, mgState.leyeX - 1.5);
  if (mgState.keys.right) mgState.leyeX = Math.min(90, mgState.leyeX + 1.5);
  document.getElementById('mg-leye').style.left = mgState.leyeX + '%';

  // 2. 移动心玖 (随机慢速徘徊)
  const nowT = Date.now();
  if (nowT - mgState.lastKokonoTurn > 800 + Math.random() * 700) {
    mgState.lastKokonoTurn = nowT;
    mgState.kokonoVx = (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.4);
  }
  mgState.kokonoX += mgState.kokonoVx;
  if (mgState.kokonoX >= 80 || mgState.kokonoX <= 20) {
    mgState.kokonoX = Math.max(20, Math.min(80, mgState.kokonoX));
    mgState.kokonoVx *= -1; 
  }
  document.getElementById('mg-kokono').style.left = mgState.kokonoX + '%';

  // 3. 阶段切换逻辑
  if (mgState.phase === 1 && mgState.kokonoHp <= 100) {
    mgState.phase = 0; 
    mgState.kokonoHp = 100;
    mgState.phase2Timer = 120; 
    
    const toast = document.getElementById('mg-toast');
    toast.textContent = '我说你装乖也没用……';
    toast.style.opacity = '1';
    mgState.barrage = []; 
  } else if (mgState.phase === 0) {
    mgState.phase2Timer--;
    if (mgState.phase2Timer <= 0) {
      mgState.phase = 2;
      document.getElementById('mg-toast').style.opacity = '0';
    }
  }

  // 4. 生成怪物/弹幕
  const now = Date.now();
  
  if ((mgState.phase === 1) && now - mgState.lastBarrage > 800) {
    mgState.lastBarrage = now;
    const tpl = KOKONO_BARRAGE[Math.floor(Math.random() * KOKONO_BARRAGE.length)];
    mgState.barrage.push({ x: 20 + Math.random() * 60, y: 20, text: tpl.text, speed: 1.5, damage: tpl.damage || 10 });
  }

  if (mgState.phase === 2) {
    if (now - mgState.lastBarrage > 1200) {
      mgState.lastBarrage = now;
      const tpl = KOKONO_BARRAGE[Math.floor(Math.random() * KOKONO_BARRAGE.length)];
      mgState.barrage.push({ x: 20 + Math.random() * 60, y: 20, text: tpl.text, speed: 1.5, damage: 10 });
    }

    if (now - mgState.lastCharge > 3000) {
      mgState.lastCharge = now;
      mgState.charges.push({ x: mgState.leyeX, timer: 60 });
    }

    if (now - mgState.lastWasher > 4000) {
      mgState.lastWasher = now;
      mgState.washers.push({
        x: Math.random() > 0.5 ? 15 : 85,
        y: 30 + Math.random() * 30,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random()),
        vy: (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random()),
        life: 300
      });
    }

    if (now - mgState.lastNoodle > 6000) {
      mgState.lastNoodle = now;
      mgState.noodles.push({ x: Math.random() > 0.5 ? 15 : 85, y: 70 + Math.random() * 10, life: 180 });
    }
  }

  // 5. 更新实体的位置与碰撞
  
  // 直球
  for (let i = mgState.bullets.length - 1; i >= 0; i--) {
    const b = mgState.bullets[i];
    b.y -= b.speed;
    if (b.y < 25 && Math.abs(b.x - mgState.kokonoX) < 12) {
      if (mgState.phase !== 0) {
        mgState.kokonoHp = Math.max(0, mgState.kokonoHp - 5);
        document.getElementById('mg-kokono-hp').style.width = (mgState.kokonoHp / mgState.kokonoMaxHp * 100) + '%';
      }
      mgState.bullets.splice(i, 1);
      continue;
    }
    if (b.y < 0) mgState.bullets.splice(i, 1);
  }

  // 弹幕
  for (let i = mgState.barrage.length - 1; i >= 0; i--) {
    const bar = mgState.barrage[i];
    bar.y += bar.speed;
    
    if (bar.y > 80 && Math.abs(bar.x - mgState.leyeX) < 8) {
      // ★ 修复：只有在非无敌状态下才会扣血
      if (mgState.invincibleTimer <= 0) {
        mgState.leyeHp = Math.max(0, mgState.leyeHp - bar.damage);
        document.getElementById('mg-leye-hp').style.width = (mgState.leyeHp / mgState.leyeMaxHp * 100) + '%';
        
        // 触发无敌帧 30帧（约0.5秒）
        mgState.invincibleTimer = 30;
        
        // 受击闪烁特效
        const leyeEl = document.getElementById('mg-leye');
        leyeEl.style.filter = 'brightness(3) drop-shadow(0 0 15px #fff)';
        setTimeout(() => {
          const el = document.getElementById('mg-leye');
          if (el) el.style.filter = 'drop-shadow(0 0 5px #4caf50)';
        }, 150);
      }
      
      mgState.barrage.splice(i, 1);
      continue;
    }
    if (bar.y > 100) mgState.barrage.splice(i, 1);
  }

  // 蓄力
  for (let i = mgState.charges.length - 1; i >= 0; i--) {
    const c = mgState.charges[i];
    c.timer--;
    if (c.timer <= 0) {
      // 光柱宽度大约是 16%，所以判定半宽是 8%
      if (Math.abs(c.x - mgState.leyeX) < 8) {
        mgState.leyeHp = Math.max(0, mgState.leyeHp - 25); // 光柱伤害调高一点
        document.getElementById('mg-leye-hp').style.width = (mgState.leyeHp / mgState.leyeMaxHp * 100) + '%';
      }
      mgState.charges.splice(i, 1);
    }
  }

  // 洗衣机
  for (let i = mgState.washers.length - 1; i >= 0; i--) {
    const w = mgState.washers[i];
    w.x += w.vx;
    w.y += w.vy;
    w.life--;
    if (w.x <= 5 || w.x >= 95) w.vx *= -1;
    if (w.y <= 20 || w.y >= 85) w.vy *= -1;
    if (Math.abs(w.x - mgState.leyeX) < 10 && Math.abs(w.y - 80) < 15) {
      mgState.leyeHp = Math.max(0, mgState.leyeHp - 15);
      document.getElementById('mg-leye-hp').style.width = (mgState.leyeHp / mgState.leyeMaxHp * 100) + '%';
      mgState.washers.splice(i, 1);
      continue;
    }
    if (w.life <= 0) mgState.washers.splice(i, 1);
  }

  // 杯面
  for (let i = mgState.noodles.length - 1; i >= 0; i--) {
    const n = mgState.noodles[i];
    n.life--;
    if (Math.abs(n.x - mgState.leyeX) < 10 && Math.abs(n.y - 80) < 15) {
      mgState.leyeHp = Math.min(mgState.leyeMaxHp, mgState.leyeHp + 15);
      document.getElementById('mg-leye-hp').style.width = (mgState.leyeHp / mgState.leyeMaxHp * 100) + '%';
      mgState.noodles.splice(i, 1);
      continue;
    }
    if (n.life <= 0) mgState.noodles.splice(i, 1);
  }

  // 6. 渲染与判定
  renderMgEntities();

  if (mgState.kokonoHp <= 0 && mgState.phase !== 0) {
    mgEndGame(true);
  } else if (mgState.leyeHp <= 0) {
    mgEndGame(false);
  }
}

function renderMgEntities() {
  const el = document.getElementById('mg-entities');
  if (!el) return;
  let html = '';

  // 1. 蓄力光柱（从天而降）
  mgState.charges.forEach(c => {
    // 最后 15 帧（0.25秒）光柱变成亮红色并闪烁
    const isStriking = c.timer <= 15;
    const bgColor = isStriking ? 'rgba(255, 0, 0, 0.6)' : 'rgba(255, 0, 0, 0.15)';
    const borderColor = isStriking ? '#fff' : '#ff5252';
    const shadow = isStriking ? 'box-shadow:0 0 30px #ff0000;' : '';

    html += `<div style="position:absolute;left:${c.x}%;top:0;bottom:0;width:16%;transform:translateX(-50%);
      background:${bgColor};border-left:2px solid ${borderColor};border-right:2px solid ${borderColor};
      ${shadow} z-index:1;"></div>`;
  });

  // 2. 蕾叶直球
  mgState.bullets.forEach(b => {
    html += `<div style="position:absolute;left:${b.x}%;top:${b.y}%;transform:translate(-50%,-50%);
      background:#4caf50;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;white-space:nowrap;
      box-shadow:0 0 5px #4caf50; z-index:5;">${b.text}</div>`;
  });

  // 3. 心玖弹幕
  mgState.barrage.forEach(b => {
    html += `<div style="position:absolute;left:${b.x}%;top:${b.y}%;transform:translate(-50%,-50%);
      background:#d32f2f;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;white-space:nowrap;
      box-shadow:0 0 5px #d32f2f; z-index:5;">${b.text}</div>`;
  });

  // 4. 洗衣机（红光碰撞箱）
  mgState.washers.forEach(w => {
    html += `<div style="position:absolute;left:${w.x}%;top:${w.y}%;transform:translate(-50%,-50%);
      width:36px;height:36px;border:2px solid #ff5252;border-radius:50%;
      box-shadow:0 0 15px rgba(255,0,0,0.8);background:rgba(255,0,0,0.2);
      display:flex;align-items:center;justify-content:center; z-index:4;">
      <img src="assets/ui/wash.png" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" style="width:100%;height:100%;object-fit:contain;">
      <div style="display:none;font-size:20px;">🌀</div>
    </div>`;
  });

  // 5. 杯面（绿光碰撞箱）
  mgState.noodles.forEach(n => {
    html += `<div style="position:absolute;left:${n.x}%;top:${n.y}%;transform:translate(-50%,-50%);
      width:36px;height:36px;border:2px solid #4caf50;border-radius:50%;
      box-shadow:0 0 15px rgba(76,175,80,0.8);background:rgba(76,175,80,0.2);
      display:flex;align-items:center;justify-content:center; z-index:4; animation:musicPulse 1s infinite;">
      <img src="assets/ui/noodle.png" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" style="width:100%;height:100%;object-fit:contain;">
      <div style="display:none;font-size:20px;">🍜</div>
    </div>`;
  });

  el.innerHTML = html;
}

function mgEndGame(win) {
  if (mgState.finished) return;
  mgState.finished = true;
  
  if (mgLoop) clearInterval(mgLoop);
  window.removeEventListener('keydown', mgKeyDown);
  window.removeEventListener('keyup', mgKeyUp);

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
  { text: '不要再跑划小船门口叫Family…', damage: 5 },
  { text: '教母到底是谁教的？', damage: 7 },
  { text: '还买杯面…', damage: 10 },
  { text: '这日子过不下去了！', damage: 7 },
  { text: '看着我！', damage: 15 },
];

const LEYE_COUNTERS = [
  { text: '过的下去过的下去！' },
  { text: '你明明也在关心吧~' },
  { text: '呜，心玖~' },
  { text: '心玖有在摸耳朵吧~' },
];