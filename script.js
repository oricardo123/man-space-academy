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
