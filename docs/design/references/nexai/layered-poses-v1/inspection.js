import { puppetMarkup } from './puppet.mjs';
let changed = true;
fetch('./motions.json')
  .then((r) => r.json())
  .then(({ poses }) => {
    document.getElementById('sheet').innerHTML = poses
      .map(
        (pose) =>
          `<article><div role="img" aria-label="${pose.title}">${puppetMarkup(pose, pose.id)}</div><p>${pose.number} · ${pose.id}</p></article>`,
      )
      .join('');
    document
      .querySelectorAll('[data-eye]')
      .forEach((eye) => eye.setAttribute('opacity', '1'));
    document.getElementById('status').textContent =
      `${poses.length} houdingen.`;
  })
  .catch(() => {
    document.getElementById('status').textContent =
      'Laden mislukt. Vernieuw de pagina.';
  });
document.getElementById('toggle').addEventListener('click', (event) => {
  changed = !changed;
  document
    .querySelectorAll('[data-eye]')
    .forEach((eye) => eye.setAttribute('opacity', changed ? '1' : '0'));
  event.currentTarget.textContent = changed
    ? 'Toon originele ogen'
    : 'Toon veranderde ogen';
  event.currentTarget.setAttribute('aria-pressed', String(changed));
});
