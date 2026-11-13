(() => {
  'use strict';
  const config = window.COURSE_CONFIG || {};
  const phone = String(config.whatsappNumber || '').replace(/\D/g, '');
  if (!/^[1-9]\d{7,14}$/.test(phone)) return;
  const message = config.whatsappMessage || 'Olá, Patrick! Quero saber mais sobre o curso da Man Space Academy.';
  for (const link of document.querySelectorAll('.whatsapp-link')) {
    link.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.addEventListener('click', () => window.dispatchEvent(new CustomEvent('course:whatsapp-click', { detail: { placement: link.dataset.placement } })));
  }

  const mobileAction = document.querySelector('.mobile-action');
  if (mobileAction && 'IntersectionObserver' in window) {
    const visibleActions = new Set();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleActions.add(entry.target);
        else visibleActions.delete(entry.target);
      }
      mobileAction.classList.toggle('is-visible', visibleActions.size === 0);
    });
    for (const action of document.querySelectorAll('main .whatsapp-link')) observer.observe(action);
  }
})();

(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  for (const video of document.querySelectorAll('video[data-loop-video]')) {
    const toggle = video.closest('figure')?.querySelector('.video-toggle');
    if (!toggle) continue;
    let manuallyPaused = false;
    let visible = false;
    const update = () => {
      const label = video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
      toggle.textContent = label;
      toggle.setAttribute('aria-label', `${label}: ${video.getAttribute('aria-label')}`);
    };
    const play = () => video.play().catch(update);
    video.muted = true;
    video.controls = false;
    toggle.hidden = false;
    video.addEventListener('play', update);
    video.addEventListener('pause', update);
    toggle.addEventListener('click', () => {
      manuallyPaused = !video.paused;
      if (manuallyPaused) video.pause();
      else play();
    });
    motion.addEventListener('change', event => {
      if (event.matches) video.pause();
      else if (visible && !manuallyPaused) play();
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
        if (!visible) video.pause();
        else if (!motion.matches && !manuallyPaused) play();
      }, { threshold: 0.15 });
      observer.observe(video);
    } else {
      visible = true;
      if (!motion.matches) play();
    }
    update();
  }
})();
