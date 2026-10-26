(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let installPrompt = null;

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

  const now = new Date();
  const hour = now.getHours();
  $('#app-greeting').textContent = hour < 12 ? 'Buenos días, explorador' : hour < 19 ? 'Buenas tardes, explorador' : 'Buenas noches, explorador';

  const stores = [
    ['raices-mente-progreso', 30],
    ['raices-juegos-ludicos-progreso', 17],
    ['raices-activacion-mental-progreso', 19],
    ['raices-lectoescritura-progreso', 17],
    ['raices-gimnasia-progreso', 11]
  ];
  const completed = stores.reduce((sum, [key]) => {
    try { return sum + new Set(JSON.parse(localStorage.getItem(key) || '[]')).size; } catch (_) { return sum; }
  }, 0);
  const total = stores.reduce((sum, [, count]) => sum + count, 0);
  const percent = Math.min(100, Math.round(completed / total * 100));
  $('#app-progress-count').textContent = completed;
  $('#app-progress-percent').textContent = `${percent}%`;
  $('#app-ring').style.setProperty('--progress', percent);

  const today = now.toISOString().slice(0, 10);
  let days = [];
  try { days = JSON.parse(localStorage.getItem('raices-app-days') || '[]'); } catch (_) { days = []; }
  days = [...new Set([...days, today])].sort().slice(-90);
  localStorage.setItem('raices-app-days', JSON.stringify(days));
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  while (days.includes(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  $('#app-streak-count').textContent = Math.max(1, streak);

  const help = $('#install-help');
  const installMessage = $('#install-message');
  const showHelp = () => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    installMessage.textContent = ios
      ? 'En Safari toca Compartir y luego “Agregar a inicio”. La app aparecerá junto a tus demás aplicaciones.'
      : 'En Android abre el menú del navegador y elige “Instalar aplicación” o “Agregar a pantalla principal”.';
    help.showModal();
  };
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; });
  $$('[data-install]').forEach((button) => button.addEventListener('click', async () => {
    if (window.matchMedia('(display-mode: standalone)').matches) { button.textContent = 'Ya instalada'; return; }
    if (!installPrompt) { showHelp(); return; }
    installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null;
  }));
  $('[data-close-install]').addEventListener('click', () => help.close());

  $$('[data-share]').forEach((button) => button.addEventListener('click', async () => {
    const data = {title:'RAÍCES Perú', text:'Juegos, creatividad y acompañamiento con Queñal.', url:location.href};
    if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
    else { try { await navigator.clipboard.writeText(location.href); button.textContent = '✓'; setTimeout(() => button.textContent = '↗', 1300); } catch (_) {} }
  }));

  const players = $$('audio');
  players.forEach((player) => player.addEventListener('play', () => players.forEach((other) => { if (other !== player) other.pause(); })));
})();
