function avatarHTML(id, folder, size) {
  size = size || 48;
  return `
    <div class="avatar" style="width:${size}px;height:${size}px">
      <img src="assets/${folder}/${id}.png"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
      <div class="avatar-fallback">${id}</div>
    </div>
  `;
}

function portraitHTML(id, name) {
  return `
    <div class="portrait">
      <img src="assets/chars_full/${id}.png"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
      <div class="portrait-fallback">${name}</div>
    </div>
  `;
}

function spriteInnerHTML(c, showRestLabel) {
  const energyPct = (c.current.energy / c.traits.energyMax) * 100;
  const restLabel = showRestLabel && c.current.task === 'rest'
    ? '<div class="sprite-rest">休息中</div>' : '';

  const exhausted = isExhausted(c);
  const tired = isTired(c);

  let spriteFile;
  if (exhausted) {
    spriteFile = `assets/sprites/${c.id}_exhausted.png`;
  } else if (tired) {
    spriteFile = `assets/sprites/${c.id}_tired.png`;
  } else {
    spriteFile = `assets/sprites/${c.id}.png`;
  }

  const fallbackImg = `assets/sprites/${c.id}.png`;

  let cls = 'sprite';
  if (exhausted) cls += ' exhausted-sprite';
  else if (tired) cls += ' tired-sprite';

  return {
    className: cls,
    html: `
      <img src="${spriteFile}"
           onerror="if(this.src.indexOf('_tired')>=0||this.src.indexOf('_exhausted')>=0){this.src='${fallbackImg}';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='block';};}else{this.style.display='none';this.nextElementSibling.style.display='block';}">
      <div class="sprite-fallback">
        <div class="fb-head"></div>
        <div class="fb-body"></div>
      </div>
      ${restLabel}
      <div class="sprite-label">${c.name}</div>
      <div class="sprite-energy">
        <div class="sprite-energy-fill" style="width:${energyPct}%"></div>
      </div>
    `,
  };
}

function playScript(script) {
  return script.map(line => {
    if (line.who) return '<p><span class="speaker">' + line.who + '：</span>' + line.say + '</p>';
    return '<p style="color:#666">' + line.text + '</p>';
  }).join('');
}