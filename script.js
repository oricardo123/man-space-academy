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
    const frame = video.closest('.loop-video-frame');
    if (!toggle || !frame) continue;
    let manuallyPaused = false;
    let automaticPause = false;
    let visible = false;
    let hasFrame = false;
    let failed = false;
    const update = () => {
      const playing = hasFrame && !video.paused && !video.ended;
      const label = playing ? 'Pausar vídeo' : (failed ? 'Tentar reproduzir vídeo' : 'Reproduzir vídeo');
      toggle.textContent = label;
      toggle.setAttribute('aria-label', `${label}: ${video.getAttribute('aria-label')}`);
    };
    const confirmFrame = () => {
      if (video.readyState < 2 || video.videoWidth === 0 || video.paused) return;
      hasFrame = true;
      failed = false;
      frame.classList.add('has-video-frame');
      update();
    };
    const pauseAutomatically = () => {
      video.autoplay = false;
      if (video.paused) return;
      automaticPause = true;
      video.pause();
    };
    const play = () => {
      failed = false;
      video.autoplay = !motion.matches;
      const result = video.play();
      if (result?.catch) result.catch(error => {
        if (error.name !== 'AbortError') failed = true;
        update();
      });
    };
    frame.classList.add('is-enhanced');
    video.muted = true;
    video.defaultMuted = true;
    video.controls = true;
    toggle.hidden = false;
    video.addEventListener('playing', () => {
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(confirmFrame);
      else if (video.currentTime > 0) confirmFrame();
      update();
    });
    video.addEventListener('timeupdate', () => {
      if (!hasFrame && video.currentTime > 0) confirmFrame();
      else update();
    });
    video.addEventListener('pause', () => {
      hasFrame = false;
      frame.classList.remove('has-video-frame');
      if (automaticPause) automaticPause = false;
      else if (visible) manuallyPaused = true;
      update();
    });
    video.addEventListener('play', () => { manuallyPaused = false; update(); });
    video.addEventListener('error', () => {
      failed = true;
      hasFrame = false;
      frame.classList.remove('has-video-frame');
      video.controls = true;
      update();
    });
    toggle.addEventListener('click', () => {
      if (hasFrame && !video.paused && !video.ended) { manuallyPaused = true; video.pause(); }
      else { manuallyPaused = false; if (video.error) video.load(); play(); }
    });
    const motionChanged = event => {
      if (event.matches) pauseAutomatically();
      else if (visible && !manuallyPaused) play();
    };
    if (motion.addEventListener) motion.addEventListener('change', motionChanged);
    else motion.addListener(motionChanged);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
        if (!visible) pauseAutomatically();
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
