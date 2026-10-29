// Shared drawing library — "Sitcom Deadpan" look: thick black outlines, flat colours, saucer eyes.
const S = { LW: 2.2, W: false, LOOK: 'A' }; // LW = outline width (local units), W = wayang mode
const O = () => (S.W ? '#E2B04A' : '#161616');
const col = c => (S.W ? '#3B2112' : c);
const DASH = () => (S.W ? 'stroke-dasharray="1.2 1.6"' : '');

function place(inner, x, y, s = 1, { flip = false, w = 100, rot = 0, cx = 50, cy = 75 } = {}) {
  const fx = flip ? -s : s, tx = flip ? x + w * s : x;
  const r = rot ? ` rotate(${rot} ${cx} ${cy})` : '';
  return `<g transform="translate(${tx} ${y}) scale(${fx} ${s})${r}">${inner}</g>`;
}

function eyeB(cx, cy, r, { lid = 0, px = 0, py = 0, side = -1, brow, m } = {}) {
  // Look B (Philipsinema "Reallife cartoon"): small black dot eyes + thick expressive brows
  const ln = '#111111';
  let s = '';
  const ex = cx + px * r * 0.3, ey = cy + py * r * 0.3 + r * 0.15;
  if (lid >= 0.98) s += `<path d="M${cx - r * 0.45} ${cy + r * 0.2} Q${cx} ${cy + r * 0.55} ${cx + r * 0.45} ${cy + r * 0.2}" stroke="${ln}" stroke-width="${r * 0.22}" fill="none" stroke-linecap="round"/>`;
  else if (lid > 0.45) s += `<path d="M${ex - r * 0.32} ${ey - r * 0.05} L${ex + r * 0.32} ${ey - r * 0.05} Q${ex + r * 0.3} ${ey + r * 0.32} ${ex} ${ey + r * 0.32} Q${ex - r * 0.3} ${ey + r * 0.32} ${ex - r * 0.32} ${ey - r * 0.05} Z" fill="${ln}"/>`;
  else s += `<ellipse cx="${ex}" cy="${ey}" rx="${r * (lid === 0 && brow === 'up' ? 0.26 : 0.3)}" ry="${r * 0.42}" fill="${ln}"/>`;
  const mood = brow || (['grit', 'smirk'].includes(m) ? 'angry' : m === 'frown' ? 'sad' : m === 'o' ? 'up' : lid >= 0.5 ? 'low' : 'flat');
  const by = cy - r * 0.62 + (mood === 'up' ? -r * 0.35 : mood === 'low' ? r * 0.12 : 0);
  const tilt = mood === 'angry' ? r * 0.5 : mood === 'sad' ? -r * 0.4 : mood === 'low' ? r * 0.08 : 0;
  // inner end = toward face centre (side -1 → inner is right end)
  const x1 = cx - r * 0.7, x2 = cx + r * 0.7;
  const y1 = by + (side > 0 ? tilt : 0), y2 = by + (side < 0 ? tilt : 0);
  const arc = mood === 'up' ? -r * 0.25 : 0;
  s += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} Q${cx} ${(Math.min(y1, y2) + arc - r * 0.05).toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${ln}" stroke-width="${(r * 0.34).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  return s;
}

function eye(cx, cy, r, o = {}) {
  if (S.LOOK === 'B') return eyeB(cx, cy, r, o);
  let { lid = 0, px = 0, py = 0, pr, skin = '#F6D6A8', lw } = o;
  lw = lw || S.LW; pr = pr || r * 0.22;
  const ln = '#161616';
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF"/>`;
  if (lid >= 0.98) {
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${skin}"/>`;
    s += `<path d="M${cx - r * 0.8} ${cy + r * 0.15} Q${cx} ${cy + r * 0.55} ${cx + r * 0.8} ${cy + r * 0.15}" stroke="${ln}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
  } else {
    s += `<circle cx="${(cx + px * r * 0.55).toFixed(2)}" cy="${(cy + py * r * 0.5).toFixed(2)}" r="${pr.toFixed(2)}" fill="#141414"/>`;
    if (lid > 0) {
      const yl = cy - r + 2 * r * lid, d = yl - cy, hw = Math.sqrt(Math.max(0, r * r - d * d));
      s += `<path d="M${(cx - hw).toFixed(2)} ${yl.toFixed(2)} A${r} ${r} 0 ${lid > 0.5 ? 1 : 0} 1 ${(cx + hw).toFixed(2)} ${yl.toFixed(2)} Z" fill="${skin}"/>`;
      s += `<path d="M${(cx - hw).toFixed(2)} ${yl.toFixed(2)} L${(cx + hw).toFixed(2)} ${yl.toFixed(2)}" stroke="${ln}" stroke-width="${lw}" stroke-linecap="round"/>`;
    }
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ln}" stroke-width="${lw}"/>`;
  return s;
}

function mouth(type, cx, cy, w = 10) {
  const ln = '#161616', lw = S.LW;
  if (S.LOOK === 'B') { w *= 1.4; cy += 1.5; }
  const h = w / 2;
  switch (type) {
    case 'smile': return `<path d="M${cx - h} ${cy} Q${cx} ${cy + h * 0.9} ${cx + h} ${cy}" stroke="${ln}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
    case 'frown': return `<path d="M${cx - h} ${cy + h * 0.5} Q${cx} ${cy - h * 0.4} ${cx + h} ${cy + h * 0.5}" stroke="${ln}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
    case 'o': return `<ellipse cx="${cx}" cy="${cy}" rx="${h * 0.45}" ry="${h * 0.6}" fill="#3A1414" stroke="${ln}" stroke-width="${lw * 0.8}"/>`;
    case 'talk': return `<path d="M${cx - h} ${cy - h * 0.2} Q${cx} ${cy - h * 0.45} ${cx + h} ${cy - h * 0.2} Q${cx + h * 0.6} ${cy + h * 0.9} ${cx} ${cy + h * 0.95} Q${cx - h * 0.6} ${cy + h * 0.9} ${cx - h} ${cy - h * 0.2} Z" fill="#3A1414" stroke="${ln}" stroke-width="${lw * 0.8}"/><ellipse cx="${cx}" cy="${cy + h * 0.55}" rx="${h * 0.42}" ry="${h * 0.25}" fill="#E8577A"/>`;
    case 'pucker': return `<path d="M${cx - h * 0.2} ${cy - h * 0.5} Q${cx + h * 0.5} ${cy - h * 0.3} ${cx} ${cy} Q${cx + h * 0.5} ${cy + h * 0.3} ${cx - h * 0.2} ${cy + h * 0.5}" stroke="${ln}" stroke-width="${lw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'grin': return `<path d="M${cx - h * 1.2} ${cy - h * 0.2} Q${cx} ${cy + h * 1.3} ${cx + h * 1.2} ${cy - h * 0.2} Z" fill="#FFFFFF" stroke="${ln}" stroke-width="${lw}"/><path d="M${cx - h * 1.0} ${cy + h * 0.15} L${cx + h * 1.0} ${cy + h * 0.15}" stroke="${ln}" stroke-width="${lw * 0.7}"/>`;
    case 'grit': return `<rect x="${cx - h}" y="${cy - h * 0.4}" width="${w}" height="${h * 0.8}" rx="${h * 0.3}" fill="#FFFFFF" stroke="${ln}" stroke-width="${lw}"/><path d="M${cx - h} ${cy} L${cx + h} ${cy} M${cx - h * 0.33} ${cy - h * 0.4} L${cx - h * 0.33} ${cy + h * 0.4} M${cx + h * 0.33} ${cy - h * 0.4} L${cx + h * 0.33} ${cy + h * 0.4}" stroke="${ln}" stroke-width="${lw * 0.6}"/>`;
    case 'smirk': return `<path d="M${cx - h} ${cy + h * 0.1} Q${cx} ${cy + h * 0.3} ${cx + h} ${cy - h * 0.4}" stroke="${ln}" stroke-width="${lw}" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M${cx - h} ${cy} L${cx + h} ${cy}" stroke="${ln}" stroke-width="${lw}" stroke-linecap="round"/>`;
  }
}

function tentacles(color, xs, y0, len, wid, sway = 0) {
  let a = '', b = '';
  xs.forEach((x, i) => {
    const bend = ((i % 2) ? 1 : -1) * 6 + sway, d = `M${x} ${y0} q${bend} ${len * 0.5} ${bend * 0.2} ${len}`;
    a += `<path d="${d}" stroke="${O()}" stroke-width="${wid + S.LW * 2}" fill="none" stroke-linecap="round" ${DASH()}/>`;
    b += `<path d="${d}" stroke="${col(color)}" stroke-width="${wid}" fill="none" stroke-linecap="round"/>`;
  });
  return a + b;
}

const phone = (x, y, s = 1, rot = -15) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-5" y="-10" width="10" height="20" rx="2.5" fill="#4A4F57" stroke="#161616" stroke-width="${S.LW}"/><rect x="-3.2" y="-7.5" width="6.4" height="13" rx="1" fill="#8FA3B8"/></g>`;

// ---------- characters (local boxes) ----------
// Cumi Baby: 100 x 150
function cumiBaby(o = {}) {
  const { lid = 0.2, px = 0, py = 0, m = 'flat', ph = false, sway = 0, blush = true } = o;
  const skin = col('#F6D6A8'), dark = col('#E8BF8A'), lw = S.LW;
  let s = tentacles('#EFC690', [28, 39, 50, 61, 72], 84, 56, 8, sway);
  s += `<path d="M20 40 L1 27 L13 64 Z" fill="${dark}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M80 40 L99 27 L87 64 Z" fill="${dark}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M50 2 C71 2 85 40 84 82 Q50 98 16 82 C15 40 29 2 50 2 Z" fill="${skin}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  s += `<path d="M24 32 Q50 21 76 32 L78 40 Q50 29 22 40 Z" fill="${S.W ? '#7A2E1A' : '#F27BA0'}" stroke="${O()}" stroke-width="${lw * 0.8}"/>`;
  if (!S.W) s += `<circle cx="40" cy="16" r="2.6" fill="#D99A6C"/><circle cx="58" cy="13" r="2" fill="#D99A6C"/><circle cx="64" cy="48" r="0" fill="none"/>`;
  s += eye(37, 57, 13, { side: -1,  lid, px, py, skin, lw, pr: o.pr, brow: o.brow, m }) + eye(63, 57, 13, { side: 1,  lid, px, py, skin, lw, pr: o.pr, brow: o.brow, m });
  if (blush && !S.W) s += `<ellipse cx="25" cy="73" rx="5" ry="2.6" fill="#F27BA0" opacity="0.55"/><ellipse cx="75" cy="73" rx="5" ry="2.6" fill="#F27BA0" opacity="0.55"/>`;
  s += mouth(m, 50, 79, 10);
  if (ph) s += `<path d="M22 84 q-14 -10 -10 -26" stroke="${O()}" stroke-width="${8 + lw * 2}" fill="none" stroke-linecap="round"/><path d="M22 84 q-14 -10 -10 -26" stroke="${col('#EFC690')}" stroke-width="8" fill="none" stroke-linecap="round"/>` + phone(13, 56, 1, -12);
  return s;
}

// Cumi Jumbo: 100 x 150 (fedora above y=0)
function cumiJumbo(o = {}) {
  const { lid = 0.45, px = 0, py = 0, m = 'flat', ph = false, hat = true, sway = 0, sweat = false } = o;
  const skin = col('#D99A5E'), dark = col('#C4844A'), lw = S.LW;
  let s = tentacles('#C98A50', [26, 38, 50, 62, 74], 86, 58, 10, sway);
  s += `<path d="M20 40 L0 26 L12 66 Z" fill="${dark}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M80 40 L100 26 L88 66 Z" fill="${dark}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M50 2 C72 2 86 40 85 84 Q50 100 15 84 C14 40 28 2 50 2 Z" fill="${skin}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  // gold chain (bos)
  s += `<path d="M22 86 Q50 99 78 86" stroke="${S.W ? '#E2B04A' : '#F5C542'}" stroke-width="3.4" fill="none" stroke-dasharray="3.5 1.6"/><circle cx="50" cy="95" r="5" fill="${S.W ? '#E2B04A' : '#F5C542'}" stroke="#161616" stroke-width="1.3"/>`;
  if (!S.W) s += `<circle cx="40" cy="20" r="3" fill="#B87A44"/><circle cx="62" cy="26" r="2.4" fill="#B87A44"/>`;
  s += eye(37, 55, 12.5, { side: -1,  lid, px, py, skin, lw, pr: o.pr, brow: o.brow, m }) + eye(63, 55, 12.5, { side: 1,  lid, px, py, skin, lw, pr: o.pr, brow: o.brow, m });
  s += `<path d="M50 70 Q40 66 31 72 Q41 75 50 72 Q59 75 69 72 Q60 66 50 70 Z" fill="${S.W ? '#E2B04A' : '#3A2416'}" stroke="${O()}" stroke-width="${lw * 0.6}"/>`;
  s += mouth(m, 50, 79, 9);
  if (sweat) s += `<path d="M86 40 Q82 49 86 54 Q90 49 86 40 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>`;
  if (hat) s += `<path d="M27 14 Q28 -14 50 -14 Q72 -14 73 14 Z" fill="${S.W ? '#7A2E1A' : '#1F1F22'}" stroke="${O()}" stroke-width="${lw}"/><path d="M28 5 L72 5 L73 12 L27 12 Z" fill="${S.W ? '#E2B04A' : '#E0A070'}" stroke="${O()}" stroke-width="${lw * 0.7}"/><ellipse cx="50" cy="14" rx="44" ry="7" fill="${S.W ? '#7A2E1A' : '#1F1F22'}" stroke="${O()}" stroke-width="${lw}"/>`;
  if (ph) s += `<path d="M84 84 q14 -10 10 -28" stroke="${O()}" stroke-width="${10 + lw * 2}" fill="none" stroke-linecap="round"/><path d="M84 84 q14 -10 10 -28" stroke="${col('#C98A50')}" stroke-width="10" fill="none" stroke-linecap="round"/>` + phone(92, 52, 1.1, 12);
  return s;
}

// Teri Nasi: 120 x 60, faces LEFT, wears blangkon
function teri(o = {}) {
  const { lid = 0.35, px = -0.3, py = 0, m = 'flat', blangkon = true, glow = false } = o;
  const body = glow ? '#FFFFFF' : col('#DCE5EC'), fin = glow ? '#F3F6F9' : col('#AFC0CE'), lw = S.LW;
  let s = `<path d="M92 30 L117 12 L111 30 L117 48 Z" fill="${fin}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M52 17 L64 5 L72 19 Z" fill="${fin}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="M8 31 Q14 15 50 15 Q86 15 96 30 Q86 45 50 45 Q14 45 8 31 Z" fill="${body}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  if (!S.W) s += `<path d="M30 36 Q60 42 92 32" stroke="#9FB3C3" stroke-width="1.6" fill="none"/>`;
  s += `<path d="M58 33 L68 44 L72 33 Z" fill="${fin}" stroke="${O()}" stroke-width="${lw * 0.8}" stroke-linejoin="round"/>`;
  s += eye(26, 26, 9.5, { side: 1,  lid, px, py, skin: body, lw, pr: o.pr, brow: o.brow, m });
  s += mouth(m, 13, 36, 7);
  if (blangkon) {
    const bk = S.W ? '#7A2E1A' : '#6B3F1F';
    s += `<path d="M14 19 Q16 3 34 2 Q50 2 52 17 Q34 11 14 19 Z" fill="${bk}" stroke="${O()}" stroke-width="${lw}"/>`;
    s += `<path d="M20 12 L26 6 M28 10 L34 4 M36 9 L42 4 M44 11 L48 7" stroke="#E2B04A" stroke-width="1.3" stroke-linecap="round"/>`;
    s += `<ellipse cx="52" cy="11" rx="6" ry="5" fill="${bk}" stroke="${O()}" stroke-width="${lw}"/>`;
  }
  if (glow) s = `<circle cx="50" cy="30" r="44" fill="#FFE68A" opacity="0.55"/>` + s;
  return s;
}

// Kakap: 140 x 90, faces LEFT
function kakap(o = {}) {
  const { lid = 0.4, px = -0.4, py = 0, m = 'smirk', sweat = false, chain = true } = o;
  const lw = S.LW, red = col('#E8603E'), dred = col('#C8432A');
  let s = `<path d="M112 45 L138 20 L131 45 L138 70 Z" fill="${dred}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round" ${DASH()}/>`;
  s += `<path d="M42 22 L52 3 L60 17 L70 1 L78 17 L88 5 L94 24 Z" fill="${dred}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<ellipse cx="64" cy="46" rx="54" ry="30" fill="${red}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  if (!S.W) s += `<path d="M24 58 Q60 72 104 56 Q64 64 24 58 Z" fill="#F59A76"/>`;
  s += `<path d="M70 50 L84 66 L90 50 Z" fill="${dred}" stroke="${O()}" stroke-width="${lw * 0.8}" stroke-linejoin="round"/>`;
  s += eye(34, 36, 11, { side: 1,  lid, px, py, skin: red, lw, pr: o.pr, brow: o.brow, m });
  s += `<path d="M22 22 L44 27" stroke="#3A1410" stroke-width="${lw * 1.6}" stroke-linecap="round"/>`;
  s += mouth(m, 18, 55, 10);
  if (chain && !S.W) s += `<path d="M34 70 Q54 84 76 72" stroke="#F5C542" stroke-width="3" fill="none" stroke-dasharray="3 1.5"/><circle cx="55" cy="79" r="4" fill="#F5C542" stroke="#161616" stroke-width="1"/>`;
  if (sweat) s += `<path d="M48 12 Q44 21 48 26 Q52 21 48 12 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/><path d="M98 18 Q94 27 98 32 Q102 27 98 18 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>`;
  return s;
}

// Kucing Oren: 100 x 120 front
function kucing(o = {}) {
  const { lid = 0.45, px = 0, py = 0, m = 'flat', sweat = false, fangs = false, sparkle = false } = o;
  const lw = S.LW, or = col('#F0892E'), dk = S.W ? '#E2B04A' : '#8A3E0A';
  let s = `<ellipse cx="50" cy="102" rx="28" ry="16" fill="${or}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  s += `<path d="M16 34 L22 2 L44 24 Z" fill="${or}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round"/><path d="M84 34 L78 2 L56 24 Z" fill="${or}" stroke="${O()}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<circle cx="50" cy="52" r="36" fill="${or}" stroke="${O()}" stroke-width="${lw}" ${DASH()}/>`;
  if (!S.W) s += `<path d="M40 18 L44 28 M50 16 L50 28 M60 18 L56 28" stroke="#C96512" stroke-width="3" stroke-linecap="round"/>`;
  s += eye(37, 48, 11, { side: -1,  lid, px, py, skin: or, lw, pr: o.pr, brow: o.brow, m }) + eye(63, 48, 11, { side: 1,  lid, px, py, skin: or, lw, pr: o.pr, brow: o.brow, m });
  if (sparkle) s += `<path d="M37 41 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 Z M63 41 l1.5 -4 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 Z" fill="#FFE14D"/>`;
  s += `<path d="M76 28 L82 50 M75 36 L82 34" stroke="${dk}" stroke-width="2.4" stroke-linecap="round"/>`;
  s += `<path d="M46 62 L54 62 L50 67 Z" fill="${dk}" stroke="#161616" stroke-width="1"/>`;
  s += mouth(m, 50, 74, 11);
  if (fangs) s += `<path d="M42 71 L45 80 L48 71 Z M52 71 L55 80 L58 71 Z" fill="#FFFFFF" stroke="#161616" stroke-width="1"/>`;
  s += `<path d="M16 62 L36 64 M16 70 L36 68 M84 62 L64 64 M84 70 L64 68" stroke="${S.W ? '#E2B04A' : '#5C2A08'}" stroke-width="1.3"/>`;
  if (!S.W) s += `<path d="M28 88 Q50 104 72 88" stroke="#F5C542" stroke-width="4" fill="none"/>`;
  if (sweat) s += `<path d="M84 26 Q80 35 84 40 Q88 35 84 26 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>`;
  return s;
}

// ---------- UI overlays ----------
const FONT = 'font-family="Liberation Sans" font-weight="bold"';
function titleBar(t) {
  const w = t.length * 8.1 + 18;
  return `<rect x="14" y="26" width="${w}" height="25" rx="4" fill="#FFFFFF"/><text x="23" y="44" ${FONT} font-size="15" fill="#111111">${t}</text>`;
}
function sub(lines, y = 336) {
  if (!lines || !lines.length) return '';
  return lines.map((l, i) => `<text x="135" y="${y + i * 21}" text-anchor="middle" ${FONT} font-size="17" fill="#FFFFFF" stroke="#111111" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke">${l}</text>`).join('');
}
const watermark = () => `<text x="135" y="250" text-anchor="middle" font-family="DejaVu Serif" font-size="15" fill="#FFFFFF" opacity="0.32">@ikanasinaflah</text>`;
const tag = (t, x, y, fill = '#E8576B') => `<rect x="${x}" y="${y}" width="${t.length * 8 + 18}" height="22" rx="11" fill="${fill}" stroke="#161616" stroke-width="1.5"/><text x="${x + 9}" y="${y + 15.5}" ${FONT} font-size="12.5" fill="#FFFFFF">${t}</text>`;
const endCard = (y = 404) => `<rect x="60" y="${y}" width="150" height="28" rx="14" fill="#FFFFFF" stroke="#161616" stroke-width="1.6"/><text x="135" y="${y + 19}" text-anchor="middle" ${FONT} font-size="13" fill="#111111">@ikanasinaflah</text>`;
const sweatDrop = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0 Q-4 9 0 14 Q4 9 0 0 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>`;
const star = (x, y, r = 6, f = '#FFE14D') => `<path transform="translate(${x} ${y}) scale(${r / 10})" d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="${f}" stroke="#161616" stroke-width="1"/>`;

function frame(body, { title, subs, subY, wm = true, extra = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 480" width="270" height="480"><defs>
<filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.55"/></radialGradient>
<radialGradient id="kelir" cx="50%" cy="42%" r="65%"><stop offset="0%" stop-color="#FFF4D2"/><stop offset="55%" stop-color="#F0D08A"/><stop offset="100%" stop-color="#7A4416"/></radialGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8F0"/><stop offset="1" stop-color="#FCE7B0"/></linearGradient>
<pattern id="parang" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#5A2A12"/><path d="M0 8 Q4 2 8 8 Q12 14 16 8" stroke="#E2B04A" stroke-width="2.2" fill="none"/><circle cx="8" cy="8" r="1.3" fill="#E2B04A"/></pattern>
</defs>${body}${wm ? watermark() : ''}${title ? titleBar(title) : ''}${sub(subs, subY)}${extra}</svg>`;
}

module.exports = { S, O, col, place, eye, mouth, phone, cumiBaby, cumiJumbo, teri, kakap, kucing, titleBar, sub, tag, endCard, sweatDrop, star, frame, FONT };
