import { eyesAt, pawAt, duration } from './timeline.mjs';
import { puppetMarkup } from './puppet.mjs';
const $ = (id) => document.getElementById(id);
const stage = $('stage');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const labels = {
  slow: 'Een rustige knipper',
  double: 'Twee korte knippers',
  wink: 'Een knipoog, daarna knipperen',
  peek: 'Even de ogen openen',
};
let poses = [],
  selected,
  ready = false,
  visible = true,
  raf = 0,
  timer = 0,
  revision = 0,
  intent = 0;
const reduced = () => preference.matches || $('static').checked;
function showEyes(values) {
  stage
    .querySelectorAll('[data-eye]')
    .forEach((eye, i) => eye.setAttribute('opacity', String(values[i])));
}
function render(time) {
  showEyes(eyesAt(selected.mode, time));
  if (selected.arm) {
    const [x, y] = selected.arm.pivot;
    stage
      .querySelector('[data-arm]')
      .setAttribute(
        'transform',
        `rotate(${pawAt(time, selected.arm.amplitude)} ${x} ${y})`,
      );
  }
  $('position').value = String(time);
  $('time').textContent = `${(time / 1000).toFixed(1).replace('.', ',')} s`;
  stage.dataset.time = String(Math.round(time));
}
function cancel() {
  intent++;
  cancelAnimationFrame(raf);
  clearTimeout(timer);
  stage.dataset.playing = 'false';
  $('play-state').textContent = 'Stilstaand';
}
function reset(message) {
  cancel();
  $('hold').checked = false;
  if (selected) render(0);
  $('status').textContent = message;
}
function controls() {
  for (const id of ['replay', 'position', 'repeat'])
    $(id).disabled = !ready || reduced();
  $('hold').disabled = !ready || reduced();
  $('stop').disabled = !selected;
}
function start() {
  cancel();
  $('hold').checked = false;
  if (!ready || reduced() || document.hidden || !visible) return;
  const began = performance.now();
  stage.dataset.playing = 'true';
  $('play-state').textContent = 'Speelt';
  $('status').textContent = labels[selected.mode];
  function tick(now) {
    const time = Math.min(duration, now - began);
    render(time);
    if (time < duration) raf = requestAnimationFrame(tick);
    else {
      cancel();
      $('status').textContent = $('repeat').checked
        ? 'Even rust…'
        : 'Klaar om nog eens te bekijken.';
      if ($('repeat').checked) timer = setTimeout(start, selected.rest);
    }
  }
  render(0);
  raf = requestAnimationFrame(tick);
}
async function select(id, autoplay = true) {
  const pose = poses.find((p) => p.id === id);
  if (!pose) return;
  reset('De ooglagen worden geladen.');
  const current = ++revision,
    wanted = intent;
  selected = pose;
  ready = false;
  controls();
  stage.innerHTML = puppetMarkup(pose);
  stage.dataset.pose = pose.id;
  stage.setAttribute('aria-label', `Nexai · ${pose.title}`);
  $('pose-title').textContent = pose.title;
  $('pose-number').textContent =
    `${String(pose.number).padStart(2, '0')} / 24 · ${pose.label}`;
  $('motion-label').textContent =
    labels[pose.mode] + (pose.arm ? ' · met een klein pootgebaar' : '');
  $('pose-select').value = pose.id;
  $('original').src = $('source').href = pose.asset;
  document
    .querySelectorAll('[data-pose].pose-choice')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.pose === id)),
    );
  try {
    await Promise.all(
      [pose.asset, pose.eyes].map((src) => {
        const image = new Image();
        image.src = src;
        return image.decode();
      }),
    );
    if (current !== revision) return;
    ready = true;
    controls();
    if (wanted === intent) {
      $('status').textContent = reduced()
        ? 'Minder beweging: de goedgekeurde houding staat stil.'
        : 'Klaar om af te spelen.';
      if (autoplay) start();
    }
  } catch {
    if (current !== revision) return;
    reset(
      'De ooglaag kon niet laden. De oorspronkelijke houding blijft staan. Kies opnieuw om het nog eens te proberen.',
    );
    controls();
  }
}
$('replay').addEventListener('click', start);
$('stop').addEventListener('click', () =>
  reset('Gestopt. De oorspronkelijke houding staat stil.'),
);
$('position').addEventListener('input', () => {
  cancel();
  $('hold').checked = false;
  render(Number($('position').value));
  $('status').textContent = 'Stilgezet op dit moment.';
});
$('hold').addEventListener('change', () => {
  cancel();
  render(0);
  showEyes($('hold').checked ? [1, 1] : [0, 0]);
  $('status').textContent = $('hold').checked
    ? 'De veranderde ogen staan stil, zodat je de aansluiting kunt bekijken.'
    : 'De oorspronkelijke houding staat stil.';
});
$('pose-select').addEventListener('change', () =>
  select($('pose-select').value),
);
document.querySelectorAll('.pose-choice').forEach((button) =>
  button.addEventListener('click', () => {
    stage.scrollIntoView({ block: 'center', behavior: 'instant' });
    visible = true;
    select(button.dataset.pose);
  }),
);
function sync() {
  reset('Stilstaand. Kies opnieuw afspelen om verder te kijken.');
  controls();
}
$('static').addEventListener('change', sync);
preference.addEventListener('change', sync);
$('repeat').addEventListener('change', () => {
  if (!$('repeat').checked) reset('Herhalen uitgeschakeld.');
  else start();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) reset('Gestopt omdat het tabblad verborgen is.');
});
window.addEventListener('pagehide', cancel);
new IntersectionObserver(
  ([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) reset('Gestopt omdat Nexai buiten beeld is.');
  },
  { threshold: 0.1 },
).observe(stage);
fetch('./motions.json')
  .then((r) => {
    if (!r.ok) throw new Error('catalogue');
    return r.json();
  })
  .then((data) => {
    poses = data.poses;
    $('pose-select').disabled = $('static').disabled = false;
    document
      .querySelectorAll('.pose-choice')
      .forEach((button) => (button.disabled = false));
    select(poses[0].id);
  })
  .catch(() => {
    $('status').textContent =
      'De houdingen konden niet laden. Vernieuw de pagina.';
  });
