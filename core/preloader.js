/* ============================================================
   core/preloader.js —— 资源预加载
   加载所有贴图（不含音乐）
   ============================================================ */

// ============================================================
//   构建资源路径列表
// ============================================================
function buildPreloadList() {
  const list = [];

  // 角色：头像 + 立绘 + 小人
  if (typeof CHARACTERS !== 'undefined') {
    CHARACTERS.forEach(c => {
      list.push('assets/chars/' + c.id + '.png');
      list.push('assets/chars_full/' + c.id + '.png');
      list.push('assets/sprites/' + c.id + '.png');
      // 疲惫 / 筋疲力尽变体（有就加载，没就 onerror 跳过）
      list.push('assets/sprites/' + c.id + '_tired.png');
      list.push('assets/sprites/' + c.id + '_exhausted.png');
    });
  }

  // 客人（含特殊客人）
  if (typeof CUSTOMERS !== 'undefined') {
    CUSTOMERS.forEach(c => {
      list.push('assets/customers/' + c.id + '.png');
    });
  }

  // 背景
  [
    'home', 'restaurant', 'bedroom', 'bridge', 'nest', 'shop', 'livehouse',
  ].forEach(name => {
    list.push('assets/bg/' + name + '.png');
  });

  // UI 素材
  [
    'speaker', 'stove', 'sink', 'counter',
  ].forEach(name => {
    list.push('assets/ui/' + name + '.png');
  });

  return list;
}

// ============================================================
//   开始预加载
//   onProgress(0~1)
//   onDone()
// ============================================================
function startPreload(onProgress, onDone) {
  const urls = buildPreloadList();
  const total = urls.length;
  let done = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    if (onProgress) onProgress(1, total, total);
    if (onDone) onDone();
  };

  // 超时保护：最多等 15 秒
  setTimeout(finish, 60000);

  if (total === 0) {
    finish();
    return;
  }

  urls.forEach(url => {
    const img = new Image();
    const next = () => {
      done++;
        if (onProgress) onProgress(done / total, done, total);
      if (done >= total) finish();
    };
    img.onload = next;
    img.onerror = next;   // 找不到也算完成，不阻塞
    img.src = url;
  });
}