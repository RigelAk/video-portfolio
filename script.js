// При обновлении страница всегда открывается с начала, а не с середины
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', () => {
  if (location.hash) return;
  window.scrollTo(0, 0);
});

// Navigation Smooth Scroll Handler
function scrollToSection(targetId) {
  if (targetId === '#top' || targetId === '#' || !targetId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector(targetId);
  if (el) {
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

// Logo Click
const siteLogo = document.getElementById('siteLogo');
if (siteLogo) {
  siteLogo.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection('#top');
  });
}

// Nav items click
document.querySelectorAll('.site-header a[href^="#"]').forEach((a) => {
  a.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      scrollToSection(href);
    }
  });
});

// Intersection Observer for scroll animations
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('inview');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in-up').forEach((el) => io.observe(el));

// ========================================================
// Управление мобильным меню
// ========================================================
(function initMobileMenu() {
  const nav = document.getElementById('siteNav');
  const burgerToggle = document.getElementById('burgerToggle');
  const headerEl = document.getElementById('header');
  const hamburgerLabel = document.querySelector('.hamburger');
  if (!headerEl || !nav || !burgerToggle || !hamburgerLabel) return;

  function closeMenu() {
    burgerToggle.checked = false;
    headerEl.classList.remove('is-open');
    burgerToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    burgerToggle.checked = true;
    headerEl.classList.add('is-open');
    burgerToggle.setAttribute('aria-expanded', 'true');
  }

  burgerToggle.addEventListener('change', function () {
    if (this.checked) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('click', (e) => {
    if (
      headerEl.classList.contains('is-open') &&
      !headerEl.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

// ========================================================
// Интерактивный Timeline с Playhead (Оптимизирован для мобильных)
// ========================================================
(function initTimeline() {
  const timeline = document.getElementById('prodTimeline');
  const bar = document.getElementById('timelineBar');
  const playhead = document.getElementById('timelinePlayhead');
  const steps = document.querySelectorAll('.prod-step');

  if (!timeline || !bar || !playhead || !steps.length) return;

  steps.forEach((step) => {
    const content = step.querySelector('.prod-step__content');
    const marker = step.querySelector('.prod-step__marker');

    function toggleStep() {
      const isOpen = step.classList.contains('open');
      steps.forEach((s) => s.classList.remove('open'));
      if (!isOpen) {
        step.classList.add('open');
      }
      requestUpdate();
    }

    if (content) content.addEventListener('click', toggleStep);
    if (marker) marker.addEventListener('click', toggleStep);
  });

  function updateTimelinePlayhead() {
    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];
    if (!firstStep || !lastStep) return;

    const firstMarker = firstStep.querySelector('.prod-step__marker');
    const lastMarker = lastStep.querySelector('.prod-step__marker');
    if (!firstMarker || !lastMarker) return;

    const firstRect = firstMarker.getBoundingClientRect();
    const lastRect = lastMarker.getBoundingClientRect();
    const winHeight = window.innerHeight;

    const triggerStart = winHeight * 0.50;
    const triggerEnd = winHeight * 0.48;

    const totalScrollDist = (lastRect.top - firstRect.top) + (triggerStart - triggerEnd);
    const scrolled = triggerStart - firstRect.top;

    let progress = scrolled / totalScrollDist;
    progress = Math.max(0, Math.min(1, progress));

    const percent = progress * 100;
    bar.style.height = `${percent}%`;
    playhead.style.top = `${percent}%`;

    const playheadRect = playhead.getBoundingClientRect();

    steps.forEach((step) => {
      const marker = step.querySelector('.prod-step__marker');
      if (marker) {
        const markerRect = marker.getBoundingClientRect();
        if (playheadRect.bottom >= markerRect.top + 6) {
          step.classList.add('passed');
        } else {
          step.classList.remove('passed');
        }
      }
    });
  }

  // Оптимизация через requestAnimationFrame: исключает фризы при тач-скролле
  let ticking = false;
  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTimelinePlayhead();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateTimelinePlayhead();
})();

// ========================================================
// Портфолио: веер из превью + плеер ВК
// ========================================================
const VK_OID = -242062544;

const VIDEOS = {
  1: { id: 456239020, hash: 'c447d462532d3a84', title: 'МЕТАЛЛИСТ — Выставка 2026' },
  2: { id: 456239019, hash: 'bd2693b06f2599d2', title: 'СПЕКТР-М — Крокус Экспо 2026' },
  3: { id: 456239023, hash: '0e7243903af29892', title: 'EuroTruck — Выставка ComVex 2025' },
  4: { id: 456239018, hash: '1db1d008cdf29ead', title: 'ТЕХНОПРОМ 2026' },
  5: { id: 456239017, hash: '6a6ed4007e746b53', title: 'СПЕКТР-М — Конференция 2025' },
  6: { id: 456239021, hash: '4638facb8394877b', title: 'МЕТАЛЛИСТ — ИНТЕГРАЦИЯ 2025' },
  7: { id: 456239024, hash: '9ba6d757b378e5f2', title: 'СПЕКТР-М — Крокус Экспо 2025' },
  8: { id: 456239022, hash: '9b957291b071a608', title: 'ASGARD — Выставка 2025' },
};

function vkEmbedUrl(cfg) {
  if (!cfg || !cfg.hash) return '';
  return 'https://vkvideo.ru/video_ext.php?oid=' + VK_OID + '&id=' + cfg.id +
    '&hash=' + cfg.hash + '&hd=4&autoplay=1';
}

const fan = document.getElementById('fan');
const fanWrapper = document.querySelector('.portfolio-wrapper');
const portfolioSection = document.getElementById('portfolio');
const cards = fan ? [...fan.querySelectorAll('.card')] : [];
const closeBtn = document.getElementById('portfolioClose');
const header = document.querySelector('.site-header');
let fanState = 'closed';
if (fan) fan.dataset.state = 'closed';

const FAN_GAP = 20;
const FAN_ROW_GAP = 26;
const FAN_COLS = 3;
const SCALE = 0.84;

function isPhone() {
  return window.matchMedia('(max-width: 680px)').matches;
}

function layoutOpen() {
  if (!fan) return;
  const wrapW = fan.clientWidth;
  const phone = isPhone();
  const baseW = cards[0] ? (cards[0].offsetWidth || 320) : 320;
  const baseH = cards[0] ? (cards[0].offsetHeight || 320) : 320;

  if (phone) {
    const perRow = Math.min(2, cards.length);
    const colWidth = (wrapW - FAN_GAP) / perRow;
    const mobScale = Math.min(1, colWidth / baseW);
    const sW = baseW * mobScale;
    const sH = baseH * mobScale;
    const rowWidth = perRow * sW + (perRow - 1) * FAN_GAP;
    const rows = Math.ceil(cards.length / perRow);
    const startX = (wrapW - rowWidth) / 2;

    const topPad = 24;
    const totalH = topPad + rows * sH + (rows - 1) * FAN_ROW_GAP + topPad;
    fan.style.height = `${totalH}px`;

    cards.forEach((el, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = startX + col * (sW + FAN_GAP) + sW / 2;
      const y = topPad + row * (sH + FAN_ROW_GAP) + sH / 2;
      el.style.setProperty('--fan-tf', `translate3d(${x - wrapW / 2}px, ${y - totalH / 2}px, 0) scale(${mobScale}) rotate(0deg)`);
    });
    return;
  }

  const sW = baseW * SCALE;
  const sH = baseH * SCALE;
  const fit = Math.floor((wrapW + FAN_GAP) / (sW + FAN_GAP));
  const perRow = Math.max(1, Math.min(Math.min(FAN_COLS, cards.length), fit));
  const rows = Math.ceil(cards.length / perRow);
  const rowWidth = perRow * sW + (perRow - 1) * FAN_GAP;
  const startX = (wrapW - rowWidth) / 2;

  const topPad = 24;
  const totalH = topPad + rows * sH + (rows - 1) * FAN_ROW_GAP + topPad;
  fan.style.height = `${totalH}px`;

  cards.forEach((el, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = startX + col * (sW + FAN_GAP) + sW / 2;
    const y = topPad + row * (sH + FAN_ROW_GAP) + sH / 2;
    el.style.setProperty('--fan-tf', `translate3d(${x - wrapW / 2}px, ${y - totalH / 2}px, 0) scale(${SCALE}) rotate(0deg)`);
  });
}

function layoutClosed() {
  if (!fan) return;
  fan.style.height = '440px';
  cards.forEach((el) => {
    el.style.removeProperty('--fan-tf');
    el.style.removeProperty('--player-w');
    el.style.removeProperty('--player-h');
  });
}

function updateCloseBtnPosition() {
  if (closeBtn && fanState === 'open') {
    const h = header ? Math.ceil(header.getBoundingClientRect().height) : 64;
    closeBtn.style.top = `${h + 16}px`;
  }
}

function openFan() {
  if (fanState === 'open' || !fan) return;
  fanState = 'open';
  fan.classList.add('open');
  if (fanWrapper) fanWrapper.classList.add('open');
  fan.dataset.state = 'open';
  if (closeBtn) closeBtn.setAttribute('aria-hidden', 'false');
  updateCloseBtnPosition();
  layoutOpen();
  setTimeout(() => {
    if (fanState === 'open' && !playingCard) {
      fan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 500);
}

function closeFan() {
  if (fanState === 'closed' || !fan) return;
  fanState = 'closed';
  fan.classList.remove('open');
  if (fanWrapper) fanWrapper.classList.remove('open');
  fan.dataset.state = 'closed';
  if (closeBtn) closeBtn.setAttribute('aria-hidden', 'true');
  layoutClosed();
}

const isTouch = window.matchMedia('(hover: none)').matches;
if (!isTouch && fan) {
  let t1, t2;
  fan.addEventListener('mouseenter', () => {
    clearTimeout(t2);
    t1 = setTimeout(openFan, 60);
  });
  fan.addEventListener('mouseleave', () => {
    clearTimeout(t1);
    t2 = setTimeout(() => {
      if (!playingCard) closeFan();
    }, 90);
  });
} else if (fan) {
  fan.addEventListener('click', () => {
    if (fanState === 'closed') openFan();
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeFan();
  });
}

// Плеер
const videoBackdrop = document.getElementById('videoBackdrop');
const videoClose = document.getElementById('videoClose');
let playingCard = null;
let playerTimers = [];

function playerSize() {
  const maxW = Math.min(1180, Math.max(300, window.innerWidth - 48));
  const maxH = Math.max(180, window.innerHeight - 48);
  let w = maxW;
  let h = Math.round(w * 9 / 16);
  if (h > maxH) {
    h = maxH;
    w = Math.round(h * 16 / 9);
  }
  return { w, h };
}

function videoModal() {
  let modal = document.getElementById('videoModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.className = 'video-modal';
  modal.id = 'videoModal';
  modal.innerHTML = '<div class="video-modal__box" id="videoBox"></div>';
  document.body.appendChild(modal);
  return modal;
}

function clearPlayerTimers() {
  playerTimers.forEach(clearTimeout);
  playerTimers = [];
}

function openPlayer(card) {
  const cfg = VIDEOS[card.dataset.video];
  if (!cfg || playingCard) return false;

  const url = vkEmbedUrl(cfg);
  if (!url) return false;

  const size = playerSize();
  const modal = videoModal();
  const box = modal.querySelector('.video-modal__box');

  box.style.setProperty('--video-w', size.w + 'px');
  box.style.setProperty('--video-h', size.h + 'px');

  const frame = document.createElement('iframe');
  frame.className = 'video-modal__frame';
  frame.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock');
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('frameborder', '0');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.setAttribute('title', cfg.title);
  frame.src = url;

  box.replaceChildren(frame);

  playingCard = card;
  modal.classList.add('show');

  if (videoBackdrop) videoBackdrop.classList.add('show');
  if (videoClose) videoClose.classList.add('show');
  if (fan) fan.classList.add('has-playing');
  if (closeBtn) closeBtn.style.display = 'none';
  document.body.classList.add('no-scroll');
  return true;
}

function closePlayer() {
  if (!playingCard) return;

  playingCard = null;
  clearPlayerTimers();

  const modal = document.getElementById('videoModal');
  if (modal) modal.classList.remove('show');

  playerTimers.push(setTimeout(() => {
    if (modal && !playingCard) {
      const box = modal.querySelector('.video-modal__box');
      if (box) box.replaceChildren();
    }
  }, 350));

  if (videoBackdrop) videoBackdrop.classList.remove('show');
  if (videoClose) videoClose.classList.remove('show');
  if (fan) fan.classList.remove('has-playing');
  if (closeBtn) closeBtn.style.display = '';
  document.body.classList.remove('no-scroll');
}

cards.forEach((c) => {
  c.addEventListener('click', (e) => {
    const cfg = VIDEOS[c.dataset.video];

    if (fanState !== 'open') {
      e.preventDefault();
      openFan();
      return;
    }

    if (cfg && cfg.hash) {
      e.preventDefault();
      e.stopPropagation();
      openPlayer(c);
    }
  });
});

if (videoClose) {
  videoClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePlayer();
  });
}

if (videoBackdrop) {
  videoBackdrop.addEventListener('click', (e) => {
    e.preventDefault();
    closePlayer();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (playingCard) {
    closePlayer();
  } else if (fanState === 'open') {
    closeFan();
  }
});

layoutClosed();

window.addEventListener('resize', () => {
  if (playingCard) return;
  if (fanState === 'open') {
    layoutOpen();
    updateCloseBtnPosition();
  } else {
    layoutClosed();
  }
});

// Canvas Geometry
const canvas = document.getElementById('geo');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const isMobileScreen = window.matchMedia('(max-width: 680px)').matches || isTouch;
const shapes = Array.from({ length: isMobileScreen ? 9 : 16 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: 30 + Math.random() * 90,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5,
  a: Math.random() * Math.PI * 2,
}));

(function animateCanvas() {
  const speed = isMobileScreen ? 1.1 : 1.8;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((s) => {
    s.x += s.vx * speed;
    s.y += s.vy * speed;
    s.a += 0.006;
    if (s.x < -100) s.x = canvas.width + 100;
    if (s.x > canvas.width + 100) s.x = -100;
    if (s.y < -100) s.y = canvas.height + 100;
    if (s.y > canvas.height + 100) s.y = -100;

    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
    g.addColorStop(0, 'rgba(255, 107, 0, 0.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * (1 + Math.sin(s.a) * 0.08), 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateCanvas);
})();

// Lead Form Integration
(function initForm() {
  const form = document.getElementById('leadForm');
  const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyCTOo_LqTQGIzlzVZ_gyzk0CBd6PUYB-DEyinaZaJYT4rW2pBQIgKMOvWJzwT35RwX-A/exec';
  if (!form) return;

  const QUEUE_KEY = 'akhmedov_leads_queue';

  function queueLead(lead) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      queue.push(lead);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-20)));
    } catch (ignore) {}
  }

  async function flushQueue() {
    let queue;
    try {
      queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch (ignore) {
      return;
    }
    if (!queue.length) return;
    const failed = [];
    for (const lead of queue) {
      try {
        await postLead(lead);
      } catch (ignore) {
        failed.push(lead);
      }
    }
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } catch (ignore) {}
  }

  function dequeueLead(ts) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter((lead) => lead.ts !== ts)));
    } catch (ignore) {}
  }

  function postLead(lead) {
    return fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(lead),
    }).then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then((data) => {
      if (!data || data.ok !== true) {
        throw new Error((data && data.message) || 'Apps Script вернул ошибку');
      }
      return data;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn.querySelector('span:first-child') || submitBtn;
    const statusText = document.getElementById('formStatus');
    const payload = Object.fromEntries(new FormData(form).entries());
    const lead = {
      ...payload,
      page: location.href,
      ts: new Date().toISOString(),
      ua: navigator.userAgent,
    };

    submitBtn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Отправка...';

    queueLead(lead);

    const send = postLead(lead)
      .then(() => {
        dequeueLead(lead.ts);
        flushQueue().catch(() => {});
        return true;
      })
      .catch((err) => {
        console.error('Send error', err);
        return false;
      });

    const outcome = await Promise.race([
      send,
      new Promise((resolve) => setTimeout(() => resolve('slow'), 1200)),
    ]);

    if (outcome === false) {
      submitBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Повторить попытку';
      if (statusText) {
        statusText.textContent = 'Ошибка отправки. Напишите напрямую в Telegram: @ideagrad';
      }
      return;
    }

    form.reset();
    if (btnLabel) btnLabel.textContent = 'Заявка отправлена!';
    if (statusText) statusText.textContent = 'Спасибо! Свяжусь с вами в течение пары часов.';
    submitBtn.classList.add('btn--success');
    setTimeout(() => {
      submitBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = 'Отправить бриф';
      submitBtn.classList.remove('btn--success');
    }, 3500);
  });

  flushQueue();
})();