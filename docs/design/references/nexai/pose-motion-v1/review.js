const character = document.querySelector('#character');
const original = document.querySelector('#original');
const select = document.querySelector('#pose-select');
const replay = document.querySelector('#replay');
const stop = document.querySelector('#stop');
const repeat = document.querySelector('#repeat');
const staticMode = document.querySelector('#static');
const status = document.querySelector('#status');
const playState = document.querySelector('#play-state');
const stage = document.querySelector('#stage');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

async function init() {
  const response = await fetch('motions.json');
  if (!response.ok) throw new Error('Catalogue unavailable');
  const { poses } = await response.json();
  let pose = poses[0];
  let animation;
  let timer;
  let selectionVersion = 0;
  let ready = false;
  let visible = false;
  let stopped = false;
  let leaving = false;

  const allowed = () =>
    ready &&
    visible &&
    !stopped &&
    !leaving &&
    !staticMode.checked &&
    !reduced.matches &&
    !document.hidden;

  function cancel() {
    clearTimeout(timer);
    timer = undefined;
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = undefined;
    }
    character.style.removeProperty('will-change');
    stage.dataset.playing = 'false';
    playState.textContent = 'Stilstaand';
  }

  function controls() {
    replay.disabled = !ready || reduced.matches || staticMode.checked;
    stop.disabled = !ready || stopped || reduced.matches || staticMode.checked;
    if (reduced.matches)
      status.textContent =
        'Je systeem vraagt om minder beweging. Nexai blijft stil.';
    else if (staticMode.checked)
      status.textContent =
        'Stilstaande vergelijking. De houding blijft zichtbaar.';
    else if (ready)
      status.textContent = `${pose.motionLabel}. ${(pose.duration / 1000).toLocaleString('nl-NL')} seconden beweging; ${(pose.rest / 1000).toLocaleString('nl-NL')} seconden rust bij herhalen.`;
  }

  function play() {
    cancel();
    if (!allowed()) return;
    character.style.willChange = 'transform';
    character.style.transformOrigin = pose.origin;
    const frames = pose.keys.map(([offset, x, y, angle, scale]) => ({
      offset,
      transform: `translate(${x}%, ${y}%) rotate(${angle}deg) scale(${scale})`,
      easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
    }));
    animation = character.animate(frames, {
      duration: pose.duration,
      iterations: 1,
      fill: 'none',
    });
    stage.dataset.playing = 'true';
    playState.textContent = 'In beweging';
    animation.onfinish = () => {
      cancel();
      if (repeat.checked && allowed()) {
        playState.textContent = 'Even rust';
        timer = setTimeout(play, pose.rest);
      }
    };
  }

  async function choose(id) {
    const next = poses.find((item) => item.id === id);
    if (!next) return;
    cancel();
    const version = ++selectionVersion;
    ready = false;
    stopped = false;
    controls();
    status.textContent = 'Houding laden…';
    try {
      const bitmap = new Image();
      bitmap.src = next.asset;
      await bitmap.decode();
      if (version !== selectionVersion) return;
      pose = next;
      character.src = original.src = next.asset;
      character.alt = `Nexai — ${next.title}`;
      character.style.transformOrigin = next.origin;
      document.querySelector('#source').href = next.asset;
      document.querySelector('#pose-title').textContent = next.title;
      document.querySelector('#motion-label').textContent = next.motionLabel;
      document.querySelector('#pose-number').textContent =
        `${String(next.number).padStart(2, '0')} / 24 · ${next.label}`;
      select.value = id;
      for (const button of document.querySelectorAll('[data-pose]'))
        button.setAttribute('aria-pressed', String(button.dataset.pose === id));
      ready = true;
      controls();
      play();
    } catch {
      if (version !== selectionVersion) return;
      select.value = pose.id;
      status.textContent =
        'Deze houding kon niet laden. De vorige afbeelding blijft staan. Kies opnieuw om het nog eens te proberen.';
    }
  }

  select.addEventListener('change', () => void choose(select.value));
  for (const button of document.querySelectorAll('[data-pose]')) {
    button.disabled = false;
    button.addEventListener('click', () => {
      void choose(button.dataset.pose);
      document
        .querySelector('.viewer')
        .scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
  replay.addEventListener('click', () => {
    stopped = false;
    controls();
    play();
  });
  stop.addEventListener('click', () => {
    stopped = true;
    cancel();
    controls();
    status.textContent = 'Stilgezet. Gebruik Opnieuw afspelen om te starten.';
  });
  repeat.addEventListener('change', () => {
    if (!repeat.checked) {
      clearTimeout(timer);
      timer = undefined;
      if (!animation) playState.textContent = 'Stilstaand';
    } else if (!animation) play();
  });
  staticMode.addEventListener('change', () => {
    controls();
    play();
  });
  reduced.addEventListener('change', () => {
    controls();
    play();
  });
  document.addEventListener('visibilitychange', play);
  window.addEventListener('pagehide', () => {
    leaving = true;
    cancel();
  });
  window.addEventListener('pageshow', () => {
    leaving = false;
    play();
  });
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      play();
    },
    { threshold: 0.25 },
  ).observe(stage);
  select.disabled = repeat.disabled = staticMode.disabled = false;
  await choose(pose.id);
}

init().catch(() => {
  status.textContent =
    'De bewegingsreview kon niet laden. De goedgekeurde houding blijft zichtbaar.';
});
