const duration = 2600;
const play = document.querySelector('#play');
const stop = document.querySelector('#stop');
const slider = document.querySelector('#position');
const still = document.querySelector('#still');
const status = document.querySelector('#status');
const output = document.querySelector('#time');
const puppet = document.querySelector('#puppet');
const arm = document.querySelector('#arm');
const blink = document.querySelector('#blink');
const character = document.querySelector('#character');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let frame;
let playing = false;
let start = 0;
const keys = [
  [0, 0],
  [400, -8],
  [750, 12],
  [1100, -12],
  [1450, 12],
  [1800, -8],
  [2200, 0],
  [2600, 0],
];
function angleAt(t) {
  const index = keys.findIndex(([at]) => at >= t);
  if (index <= 0) return 0;
  const [a, x] = keys[index - 1];
  const [b, y] = keys[index];
  const eased = (1 - Math.cos((Math.PI * (t - a)) / (b - a))) / 2;
  return x + (y - x) * eased;
}
function render(t) {
  const reduced = still.checked || preference.matches;
  const angle = reduced ? 0 : angleAt(t);
  arm.setAttribute('transform', `rotate(${angle})`);
  character.setAttribute(
    'transform',
    `rotate(${reduced ? 0 : Math.sin((t / duration) * Math.PI * 2) * 0.65} 570 950)`,
  );
  blink.setAttribute(
    'opacity',
    !reduced && ((t >= 590 && t <= 710) || (t >= 1920 && t <= 2040))
      ? '1'
      : '0',
  );
  slider.value = String(t);
  output.textContent = `${(t / 1000).toFixed(1).replace('.', ',')} s`;
  puppet.dataset.time = String(t);
  puppet.dataset.playing = String(playing);
}
function cancel() {
  cancelAnimationFrame(frame);
  playing = false;
  stop.disabled = true;
  puppet.dataset.playing = 'false';
}
function tick(now) {
  const t = Math.min(duration, now - start);
  render(t);
  if (t < duration) frame = requestAnimationFrame(tick);
  else {
    cancel();
    status.textContent = 'Begroeting klaar. Je kunt hem opnieuw afspelen.';
  }
}
play.addEventListener('click', () => {
  cancel();
  if (still.checked || preference.matches) {
    render(0);
    return;
  }
  playing = true;
  stop.disabled = false;
  start = performance.now();
  status.textContent = 'Nexai begroet je.';
  render(0);
  frame = requestAnimationFrame(tick);
});
stop.addEventListener('click', () => {
  cancel();
  render(0);
  status.textContent = 'Gestopt. Nexai staat weer stil.';
});
slider.addEventListener('input', () => {
  cancel();
  render(Number(slider.value));
  status.textContent = 'Stilgezet op het gekozen moment.';
});
function setMotion() {
  cancel();
  render(0);
  const reduced = still.checked || preference.matches;
  play.disabled = reduced;
  slider.disabled = reduced;
  status.textContent = reduced
    ? 'Verminderde beweging: Nexai blijft stil staan.'
    : 'Klaar om af te spelen. Geen geluid.';
}
still.checked = preference.matches;
still.addEventListener('change', setMotion);
preference.addEventListener('change', () => {
  still.checked = preference.matches;
  setMotion();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) {
    cancel();
    render(0);
    status.textContent = 'Gestopt omdat de pagina niet zichtbaar is.';
  }
});
setMotion();
