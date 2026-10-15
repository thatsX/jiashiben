function isExhausted(c) {
  return c.current.energy <= 0;
}

// 心玖和蕾叶不受疲惫影响
function isTired(c) {
  if (c.id === 'leye' || c.id === 'kokono') return false;
  return c.current.energy > 0 && c.current.energy < 20;
}

// 疲惫角色：餐厅岗位倍率 ×0.7，采购 +5%
function getEffectivePositionBonus(c, taskId) {
  let v = c.positionBonus[taskId];
  if (isTired(c)) {
    if (taskId === 'buy') {
      v = v + 0.05;
    } else {
      v = v * 0.7;
    }
  }
  return v;
}

// 疲惫角色：打工倍率 ×0.7
function getEffectiveWorkMultiplier(c) {
  let v = c.traits.workMultiplier;
  if (isTired(c)) v *= 0.7;
  return v;
}