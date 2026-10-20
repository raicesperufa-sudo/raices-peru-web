const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

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
