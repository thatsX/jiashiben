/* ============================================================
   core/preloader.js —— 资源预加载
   ============================================================ */

// 全局持有图片引用，防止浏览器丢弃缓存
const __preloadedImages = [];

function buildPreloadList() {
  const list = [];

  if (typeof CHARACTERS !== 'undefined') {
    CHARACTERS.forEach(c => {
      list.push('assets/chars/' + c.id + '.png');
      list.push('assets/chars_full/' + c.id + '.png');
      list.push('assets/sprites/' + c.id + '.png');
      list.push('assets/sprites/' + c.id + '_tired.png');
      list.push('assets/sprites/' + c.id + '_exhausted.png');
    });
  }

  if (typeof CUSTOMERS !== 'undefined') {
    CUSTOMERS.forEach(c => {
      list.push('assets/customers/' + c.id + '.png');
    });
  }

  ['home', 'restaurant', 'bedroom', 'bridge', 'nest', 'shop', 'livehouse'].forEach(name => {
    list.push('assets/bg/' + name + '.png');
  });

  ['speaker', 'stove', 'sink', 'counter'].forEach(name => {
    list.push('assets/ui/' + name + '.png');
  });

  return list;
}

function startPreload(onProgress, onDone) {
  const urls = buildPreloadList();
  const total = urls.length;
  let done = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    if (onProgress) onProgress(1, total, total);
    // 延迟 500ms，让浏览器稳定缓存
    setTimeout(() => {
      if (onDone) onDone();
    }, 500);
  };

  // 60 秒兜底
  setTimeout(finish, 60000);

  if (total === 0) { finish(); return; }

  urls.forEach(url => {
    const img = new Image();

    // ★ 关键：持有引用，不让 GC 回收
    __preloadedImages.push(img);

    let counted = false;
    const next = () => {
      if (counted) return;
      counted = true;
      done++;
      if (onProgress) onProgress(done / total, done, total);
      if (done >= total) finish();
    };

    img.onload = () => {
      // ★ 关键：decode() 确保图片可以被立即绘制
      if (img.decode) {
        img.decode().then(next).catch(next);
      } else {
        next();
      }
    };
    img.onerror = next;
    img.src = url;

    // 单张图 15 秒超时，避免某张图卡住整个流程
    setTimeout(next, 15000);
  });
}