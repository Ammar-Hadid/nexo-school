// SVG composition preserves source pixels outside two manually registered eye masks.
// Each mask is independently controlled, allowing a wink without a second full frame.
export function puppetMarkup(pose, prefix = 'nexai') {
  const masks = pose.regions
    .map(
      ([cx, cy, rx, ry], i) => `
    <mask id="${prefix}-mask-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${prefix}-feather)" />
    </mask>`,
    )
    .join('');
  const eyes = pose.regions
    .map(
      (_, i) => `
    <image data-eye="${i}" href="${pose.eyes}" width="1254" height="1254" opacity="0" mask="url(#${prefix}-mask-${i})" />`,
    )
    .join('');
  const armDefs = pose.arm
    ? `<mask id="${prefix}-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><rect width="1254" height="1254" fill="white" /><path d="${pose.arm.cut}" fill="black" /></mask><clipPath id="${prefix}-arm"><path d="${pose.arm.clip}" /></clipPath>`
    : '';
  const arm = pose.arm
    ? `<g data-arm="paw"><image href="${pose.asset}" width="1254" height="1254" clip-path="url(#${prefix}-arm)" /></g>`
    : '';
  const bodyMask = pose.arm ? `mask="url(#${prefix}-body)"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1254 1254" aria-hidden="true" focusable="false">
    <defs><radialGradient id="${prefix}-feather"><stop offset="90%" stop-color="white" /><stop offset="100%" stop-color="black" /></radialGradient>${masks}${armDefs}</defs>${arm}
    <image data-body="fixed" href="${pose.asset}" width="1254" height="1254" ${bodyMask} />${eyes}</svg>`;
}
