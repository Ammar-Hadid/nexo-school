import { durations, poseAt, restGap } from './timeline.mjs';
const $ = (id) => document.getElementById(id);
const play = $('play'),
  stop = $('stop'),
  slider = $('position'),
  still = $('still'),
  repeat = $('repeat');
const status = $('status'),
  puppet = $('puppet'),
  preference = matchMedia('(prefers-reduced-motion: reduce)');
let motion = 'blink',
  frame = 0,
  timer = 0,
  ready = false;
const reduced = () => still.checked || preference.matches;
function render(t) {
  const pose = poseAt(motion, reduced() ? 0 : t);
  $('arm').setAttribute('transform', `rotate(${pose.angle})`);
  $('character').setAttribute(
    'transform',
    `translate(570 950) scale(${pose.scale}) translate(-570 -950)`,
  );
  $('blink').setAttribute('opacity', String(pose.blink));
  slider.value = String(t);
  $('time').textContent = `${(t / 1000).toFixed(1).replace('.', ',')} s`;
  puppet.dataset.time = String(t);
}
function cancel() {
  cancelAnimationFrame(frame);
  clearTimeout(timer);
  puppet.dataset.playing = 'false';
  stop.disabled = true;
}
function reset(message) {
  cancel();
  render(0);
  status.textContent = message;
}
function sync() {
  reset(
    reduced()
      ? 'Verminderde beweging: Nexai blijft stil staan.'
      : 'Klaar om af te spelen. Geen geluid.',
  );
  play.disabled = slider.disabled = repeat.disabled = !ready || reduced();
}
function start() {
  cancel();
  if (!ready || reduced() || document.hidden) return;
  const started = performance.now();
  puppet.dataset.playing = 'true';
  stop.disabled = false;
  status.textContent = 'Nexai beweegt. Je kunt op elk moment stoppen.';
  function tick(now) {
    const t = Math.min(durations[motion], now - started);
    render(t);
    if (t < durations[motion]) frame = requestAnimationFrame(tick);
    else {
      cancel();
      status.textContent = repeat.checked
        ? 'Een rustmoment…'
        : 'Klaar. Bekijk gerust nog een keer.';
      if (repeat.checked) {
        stop.disabled = false;
        timer = setTimeout(start, restGap);
      }
    }
  }
  render(0);
  frame = requestAnimationFrame(tick);
}
play.addEventListener('click', start);
stop.addEventListener('click', () => reset('Gestopt. Nexai staat stil.'));
slider.addEventListener('input', () => {
  cancel();
  render(Number(slider.value));
  stop.disabled = false;
  status.textContent = 'Stilgezet op het gekozen moment.';
});
document.querySelectorAll('[name="motion"]').forEach((radio) =>
  radio.addEventListener('change', () => {
    motion = radio.value;
    slider.max = String(durations[motion]);
    sync();
  }),
);
still.addEventListener('change', sync);
preference.addEventListener('change', sync);
repeat.addEventListener('change', () => {
  if (!repeat.checked) reset('Herhalen uitgeschakeld.');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) reset('Gestopt omdat de pagina niet zichtbaar is.');
});
window.addEventListener('pagehide', cancel);
// Decode the only two immutable source images before enabling playback.
Promise.all(
  ['../layered-v1/nexai-atlas.png', '../layered-v1/nexai-blink.png'].map(
    (src) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    },
  ),
)
  .then(() => {
    ready = true;
    sync();
  })
  .catch(() => {
    reset(
      'De illustratie kon niet laden. Vernieuw de pagina om opnieuw te proberen.',
    );
    play.disabled = slider.disabled = repeat.disabled = true;
  });
