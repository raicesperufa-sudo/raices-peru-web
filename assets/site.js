const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

if (nav && !nav.querySelector('a[href="blog.html"]')) {
  const blogLink = document.createElement('a');
  blogLink.href = 'blog.html';
  blogLink.textContent = 'Blog';
  const responsibilityLink = nav.querySelector('a[href="responsabilidad.html"]');
  nav.insertBefore(blogLink, responsibilityLink);
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
