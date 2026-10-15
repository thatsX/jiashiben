let bgmAudio = null;

function getKokonoAffinity() {
  const k = characters.find(c => c.id === 'kokono');
  return k ? k.current.affinity : 0;
}

function isMusicUnlocked(music) {
  // 通过好感度阈值自动解锁
  if (getKokonoAffinity() >= (music.unlockAffinity || 0)) return true;
  // 通过剧情显式解锁
  if (state.unlockedMusic && state.unlockedMusic.indexOf(music.id) >= 0) return true;
  return false;
}

function getMusicMultiplier() {
  const m = MUSIC.find(x => x.id === state.currentMusic);
  return m ? m.multiplier : 1.0;
}

function getMusicName() {
  const m = MUSIC.find(x => x.id === state.currentMusic);
  return m ? m.name : '安静';
}

function initBGM() {
  if (bgmAudio) return;
  bgmAudio = document.createElement('audio');
  bgmAudio.loop = true;
  bgmAudio.volume = 0.5;
  document.body.appendChild(bgmAudio);
}

function playMusic(musicId) {
  initBGM();
  const music = MUSIC.find(m => m.id === musicId);

  if (!music || !music.file) {
    bgmAudio.pause();
    bgmAudio.removeAttribute('src');
    return;
  }

  if (bgmAudio.src && bgmAudio.src.indexOf(music.file) >= 0) {
    if (bgmAudio.paused) bgmAudio.play().catch(() => {});
    return;
  }

  bgmAudio.src = music.file;
  bgmAudio.play().catch(() => {});
}

function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.removeAttribute('src');
  }
}

function openMusicPicker() {
  const aff = getKokonoAffinity();

  const listHTML = MUSIC.map(m => {
    const active = state.currentMusic === m.id;
    const unlocked = isMusicUnlocked(m);

    let cls = 'music-option';
    if (active) cls += ' selected';
    if (!unlocked) cls += ' locked';

    const click = unlocked ? `onclick="selectMusic('${m.id}')"` : '';
    const multText = m.multiplier > 1.0
      ? `客流 ×${m.multiplier.toFixed(2)}`
      : '无加成';

    let statusHTML = '';
    if (!unlocked) {
      statusHTML = `<div style="color:#999;font-size:11px;margin-top:2px">心玖好感 ${m.unlockAffinity} 解锁（当前 ${aff}）</div>`;
    } else if (active) {
      statusHTML = `<div style="color:#4caf50;font-weight:bold;font-size:12px;margin-top:2px">♪ 播放中</div>`;
    }

    const displayName = unlocked ? m.name : '？？？';

    return `
      <div class="${cls}" ${click}>
        <div class="music-info">
          <div><b>${displayName}</b></div>
          <div style="font-size:11px;color:#666">${multText}</div>
          ${statusHTML}
        </div>
      </div>
    `;
  }).join('');

  showModal(`
    <h3>🎵 音响</h3>
    <p style="font-size:12px;color:#666;margin-bottom:12px">
      选择背景音乐。播放时循环播放，并带来客流加成。<br>
      讨好讨好写歌的人或许会有新的歌可以演奏？
    </p>
    ${listHTML}
  `);
  document.getElementById('modal-btn').textContent = '关闭';
}

function selectMusic(musicId) {
  const m = MUSIC.find(x => x.id === musicId);
  if (!m) return;
  if (!isMusicUnlocked(m)) return;

  state.currentMusic = musicId;
  playMusic(musicId);
  openMusicPicker();
  renderPage('home');
}