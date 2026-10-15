function getAvailableRecipes() {
  const set = new Set();
  characters.forEach(c => {
    if (c.current.task === 'kitchen') {
      c.skills.forEach(id => set.add(id));
    }
  });
  return Array.from(set);
}

function syncMenuWithKitchen() {
  const avail = getAvailableRecipes();
  state.menu = state.menu.filter(id => avail.indexOf(id) >= 0);
}

function getMenuCost() {
  const sum = state.menu.reduce((s, id) => {
    const r = RECIPES.find(x => x.id === id);
    return s + (r ? r.cost : 0);
  }, 0);
  return sum * CONFIG.menuCostMultiplier;
}