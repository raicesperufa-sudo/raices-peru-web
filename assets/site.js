const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

// La navegación pública tiene un único acceso a las experiencias: App RAÍCES.
// Las páginas antiguas aún pueden traer el enlace "Juegos" en su HTML; lo
// normalizamos aquí para que todo el sitio permanezca coherente.
if (nav) {
  const legacyGamesLink = nav.querySelector('.nav-games, a[href="mente-en-raices.html"]');
  if (legacyGamesLink) {
    legacyGamesLink.href = 'app-raices.html';
    legacyGamesLink.textContent = 'App RAÍCES';
    legacyGamesLink.classList.remove('nav-games');
    legacyGamesLink.classList.add('nav-app');
  }
  const appLinks = [...nav.querySelectorAll('a[href="app-raices.html"]')];
  appLinks.slice(1).forEach((link) => link.remove());
}

// Voz común de RAÍCES: española, cálida, pausada y con volumen amable.
(() => {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const preferredNames = /elvira|helena|laura|m[oó]nica|paulina|sabina|dalia|luciana|female|mujer|woman|google espa[nñ]ol/i;
  let voices = [];
  const refreshVoices = () => { if (supported) voices = window.speechSynthesis.getVoices(); };
  const chooseVoice = () => {
    const spanish = voices.filter((voice) => /^es(?:-|_)/i.test(voice.lang));
    return spanish.find((voice) => /^es-PE/i.test(voice.lang) && preferredNames.test(voice.name))
      || spanish.find((voice) => preferredNames.test(voice.name))
      || spanish.find((voice) => /^es-PE/i.test(voice.lang))
      || spanish.find((voice) => /^es-(MX|CO|US)/i.test(voice.lang))
      || spanish[0]
      || null;
  };
  refreshVoices();
  if (supported) window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  window.RaicesVoice = {
    supported,
    stop() { if (supported) window.speechSynthesis.cancel(); },
    speak(text, options = {}) {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
      utterance.lang = 'es-PE';
      utterance.rate = options.rate || .76;
      utterance.pitch = options.pitch || .98;
      utterance.volume = options.volume || .88;
      utterance.voice = chooseVoice();
      window.speechSynthesis.speak(utterance);
    }
  };
})();

if (nav && !nav.querySelector('a[href="blog.html"]')) {
  const blogLink = document.createElement('a');
  blogLink.href = 'blog.html';
  blogLink.textContent = 'Blog';
  const responsibilityLink = nav.querySelector('a[href="responsabilidad.html"]');
  nav.insertBefore(blogLink, responsibilityLink);
}

if (nav && !nav.querySelector('a[href="app-raices.html"]')) {
  const appLink = document.createElement('a');
  appLink.href = 'app-raices.html';
  appLink.textContent = 'App RAÍCES';
  appLink.className = 'nav-app';
  const blogLink = nav.querySelector('a[href="blog.html"]');
  nav.insertBefore(appLink, blogLink);
}

// Índice compacto de la Biblioteca: muestra una colección a la vez y conserva
// todos los temas visibles en la parte superior para cambiar de ruta.
(() => {
  const tabs = [...document.querySelectorAll('.manual-topic-tabs a[data-manual-topic]')];
  const sections = [...document.querySelectorAll('.manual-topic-section[data-manual-topic]')];
  if (!tabs.length || !sections.length) return;

  const available = new Set(sections.map((section) => section.dataset.manualTopic));
  const showTopic = (topic, updateHash = true) => {
    const selected = available.has(topic) ? topic : sections[0].dataset.manualTopic;
    sections.forEach((section) => { section.hidden = section.dataset.manualTopic !== selected; });
    tabs.forEach((tab) => {
      const active = tab.dataset.manualTopic === selected;
      tab.classList.toggle('is-current', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    if (updateHash) history.replaceState(null, '', `#${selected}`);
  };

  tabs.forEach((tab) => tab.addEventListener('click', (event) => {
    event.preventDefault();
    showTopic(tab.dataset.manualTopic);
    document.querySelector('.manual-topic-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const initial = location.hash.slice(1);
  showTopic(available.has(initial) ? initial : sections[0].dataset.manualTopic, false);
})();

document.querySelectorAll('.collection-card').forEach((card) => {
  if (card.querySelector('.collection-app-link')) return;
  const link = document.createElement('a');
  link.className = 'collection-app-link';
  link.href = 'app-raices.html#jugar';
  link.textContent = 'Ver actividades en App RAÍCES →';
  card.querySelector('div')?.append(link);
});

// La Ruta de orientación también se consulta como índice: cada elección abre
// solo el bloque pertinente, reduciendo desplazamiento y sobrecarga visual.
(() => {
  const links = [...document.querySelectorAll('[data-route-target]')];
  const panels = [...document.querySelectorAll('.route-index-panel')];
  if (!links.length || !panels.length) return;
  const available = new Set(panels.map((panel) => panel.id));
  const showPanel = (id, updateHash = true) => {
    const selected = available.has(id) ? id : panels[0].id;
    panels.forEach((panel) => { panel.hidden = panel.id !== selected; });
    links.forEach((link) => {
      const active = link.dataset.routeTarget === selected;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (updateHash) history.replaceState(null, '', `#${selected}`);
  };
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showPanel(link.dataset.routeTarget);
    document.querySelector('.route-topic-index')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const initial = location.hash.slice(1);
  showPanel(available.has(initial) ? initial : panels[0].id, false);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link?.getAttribute('href')?.slice(1);
    if (!target || !available.has(target) || link.hasAttribute('data-route-target')) return;
    event.preventDefault();
    showPanel(target);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// La web estática prepara una solicitud mínima y la entrega al correo de
// RAÍCES. No almacena datos personales en el navegador ni promete un registro
// de clientes que todavía requiere infraestructura segura.
document.querySelectorAll('[data-personalization-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const rows = [
      ['Nombre', data.get('nombre')],
      ['Edad o rango', data.get('edad')],
      ['Correo', data.get('correo')],
      ['Tema', data.get('tema')],
      ['Tipo de solicitud', data.get('tipo')],
      ['Contexto', data.get('contexto')],
      ['Objetivo o necesidad', data.get('objetivo')],
      ['Formato de entrega', data.get('entrega')]
    ].filter(([, value]) => value);
    const subject = encodeURIComponent(`Solicitud RAÍCES · ${data.get('tema') || 'Personalización'}`);
    const body = encodeURIComponent(`Hola RAÍCES:\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nAutorizo que estos datos se usen solo para responder esta solicitud.`);
    window.location.href = `mailto:raicesperu.fa@gmail.com?subject=${subject}&body=${body}`;
  });
});

if (button && nav) {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }
  });
}

document.querySelectorAll('[data-slider]').forEach((slider) => {
  const slides = [...slider.querySelectorAll('.story-slide')];
  const dots = [...slider.querySelectorAll('[data-slide-to]')];
  const viewport = slider.querySelector('[data-slider-viewport]');
  let current = 0;

  const showSlide = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('is-current', index === current));
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-current', index === current);
      if (index === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => showSlide(current - 1));
  slider.querySelector('[data-slider-next]')?.addEventListener('click', () => showSlide(current + 1));
  dots.forEach((dot) => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slideTo))));
  viewport?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showSlide(current - 1);
    if (event.key === 'ArrowRight') showSlide(current + 1);
  });
});

const readerLibrary = {
  'antes-leer-6-9': { title: 'Antes de leer · 6 a 9 años', pages: 12 },
  'rutas-6-9': { title: 'Rutas de lectura · 6 a 9 años', pages: 12 },
  'rutas-10-12': { title: 'Rutas de lectura · 10 a 12 años', pages: 12 },
  'antes-leer-13-17': { title: 'Antes de leer · 13 a 17 años', pages: 12 },
  'acompanar-lectura': { title: 'Acompañar la lectura · Familias y educadores', pages: 10 }
  ,'rutas-13-17': { title: 'Rutas de lectura · 13 a 17 años', pages: 12 }
};

const reader = document.querySelector('#manual-reader');
if (reader) {
  const image = reader.querySelector('[data-reader-image]');
  const title = reader.querySelector('#reader-title');
  const count = reader.querySelector('[data-reader-count]');
  const previous = reader.querySelector('[data-reader-prev]');
  const next = reader.querySelector('[data-reader-next]');
  let activeSlug = '';
  let activePage = 1;
  let returnFocus = null;

  const renderPage = () => {
    const manual = readerLibrary[activeSlug];
    const number = String(activePage).padStart(2, '0');
    image.src = `assets/manuales/lector/${activeSlug}/page-${number}.webp`;
    image.alt = `${manual.title}, página ${activePage} de ${manual.pages}`;
    count.textContent = `Página ${activePage} de ${manual.pages}`;
    previous.disabled = activePage === 1;
    next.disabled = activePage === manual.pages;
  };

  const openReader = (slug, trigger) => {
    const manual = readerLibrary[slug];
    if (!manual) return;
    activeSlug = slug;
    activePage = 1;
    returnFocus = trigger;
    title.textContent = manual.title;
    reader.hidden = false;
    document.body.classList.add('reader-open');
    renderPage();
    reader.querySelector('[data-reader-close]').focus();
  };

  const closeReader = () => {
    reader.hidden = true;
    image.src = '';
    document.body.classList.remove('reader-open');
    returnFocus?.focus();
  };

  document.querySelectorAll('[data-open-reader]').forEach((trigger) => trigger.addEventListener('click', () => openReader(trigger.dataset.openReader, trigger)));
  reader.querySelector('[data-reader-close]').addEventListener('click', closeReader);
  previous.addEventListener('click', () => { if (activePage > 1) { activePage -= 1; renderPage(); } });
  next.addEventListener('click', () => { if (activePage < readerLibrary[activeSlug].pages) { activePage += 1; renderPage(); } });
  reader.querySelector('[data-reader-stage]').addEventListener('contextmenu', (event) => event.preventDefault());
  document.addEventListener('keydown', (event) => {
    if (reader.hidden) return;
    if (event.key === 'Escape') closeReader();
    if (event.key === 'ArrowLeft' && activePage > 1) { activePage -= 1; renderPage(); }
    if (event.key === 'ArrowRight' && activePage < readerLibrary[activeSlug].pages) { activePage += 1; renderPage(); }
  });
}
