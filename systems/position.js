function updateWorkPositions() {
  const counter = { kitchen: 0, wash: 0, front: 0 };
  characters.forEach(c => {
    const spots = RESTAURANT_SPOTS[c.current.task];
    if (spots) {
      const idx = counter[c.current.task] % spots.length;
      c.current.position = { x: spots[idx].x, y: spots[idx].y };
      counter[c.current.task]++;
    }
  });
}

function assignHomeInitialPosition(c) {
  c.current.position = {
    x: HOME_BOUNDS.xMin + Math.random() * (HOME_BOUNDS.xMax - HOME_BOUNDS.xMin),
    y: HOME_BOUNDS.yMin + Math.random() * (HOME_BOUNDS.yMax - HOME_BOUNDS.yMin),
  };
  c.current.moveTimer = 1500 + Math.random() * 2500;
}

function initHomePositions() {
  characters.forEach(c => {
    if (TASK_ZONE[c.current.task] === 'home') {
      assignHomeInitialPosition(c);
    } else if (RESTAURANT_SPOTS[c.current.task]) {
      const spots = RESTAURANT_SPOTS[c.current.task];
      c.current.position = { x: spots[0].x, y: spots[0].y };
    }
  });
}