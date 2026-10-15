function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  const tab = document.querySelector('.tab[data-page="' + name + '"]');
  if (page) page.classList.add('active');
  if (tab) tab.classList.add('active');

  const container = document.getElementById('page-container');
  if (container) {
    if (name === 'home' || name === 'shop') container.classList.add('no-padding');
    else container.classList.remove('no-padding');
  }

  renderPage(name);
}

function renderPage(name) {
  const fn = {
    home: renderHome,
    family: renderFamily,
    menu: renderMenu,
    shop: renderShop,
    ledger: renderLedger,
  }[name];
  if (fn) fn();
}

function renderStatus() {
  document.getElementById('stat-week').textContent = state.week;
  document.getElementById('stat-cash').textContent = Math.round(state.cash);
  document.getElementById('stat-loan').textContent = Math.round(state.loan);
  document.getElementById('stat-profit').textContent = Math.round(state.totalProfit);
}