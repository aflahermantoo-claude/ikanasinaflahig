const { Resvg } = require('@resvg/resvg-js');
const { spawn } = require('child_process');
const fs = require('fs');

const TL = JSON.parse(fs.readFileSync('timeline.json', 'utf8'));
const FPS = 24;
const ONLY = process.argv[2]; // optional: comma list of seconds to dump as PNG previews

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = p => 1 - Math.pow(1 - p, 3);
const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);
const F = 'font-family="Lilita One"';

const DEFS = `<defs>
<symbol id="cumiBaby" viewBox="0 0 100 140">
<g stroke="#E8BF8A" stroke-width="7" stroke-linecap="round" fill="none"><path d="M30 82 q-8 18 0 36"/><path d="M40 84 q-4 20 2 40"/><path d="M50 84 q0 22 0 44"/><path d="M60 84 q4 20 -2 40"/><path d="M70 82 q8 18 0 36"/></g>
<path d="M22 34 L4 24 L18 54 Z" fill="#E8BF8A"/><path d="M78 34 L96 24 L82 54 Z" fill="#E8BF8A"/>
<path d="M50 6 C72 6 84 36 82 76 Q50 92 18 76 C16 36 28 6 50 6 Z" fill="#F4D3A6"/>
<circle cx="40" cy="24" r="3" fill="#D99A6C"/><circle cx="60" cy="30" r="2.5" fill="#D99A6C"/><circle cx="52" cy="16" r="2" fill="#D99A6C"/>
<path d="M50 8 L36 1 L38 14 Z" fill="#F27BA0"/><path d="M50 8 L64 1 L62 14 Z" fill="#F27BA0"/><circle cx="50" cy="8" r="3.5" fill="#E2557F"/>
<ellipse cx="38" cy="54" rx="10" ry="11" fill="#FFFFFF"/><ellipse cx="62" cy="54" rx="10" ry="11" fill="#FFFFFF"/>
<circle cx="39" cy="56" r="6" fill="#1B1420"/><circle cx="61" cy="56" r="6" fill="#1B1420"/>
<circle cx="41" cy="53" r="2.2" fill="#FFFFFF"/><circle cx="63" cy="53" r="2.2" fill="#FFFFFF"/>
<ellipse cx="25" cy="68" rx="5" ry="3" fill="#F27BA0" opacity="0.6"/><ellipse cx="75" cy="68" rx="5" ry="3" fill="#F27BA0" opacity="0.6"/>
</symbol>
<symbol id="cBlink" viewBox="0 0 100 140"><ellipse cx="38" cy="54" rx="11" ry="12" fill="#F4D3A6"/><ellipse cx="62" cy="54" rx="11" ry="12" fill="#F4D3A6"/><path d="M29 56 Q38 61 47 56 M53 56 Q62 61 71 56" stroke="#1B1420" stroke-width="2.5" fill="none" stroke-linecap="round"/></symbol>
<symbol id="cSmile" viewBox="0 0 100 140"><path d="M43 72 Q50 79 57 72" stroke="#1B1420" stroke-width="2.5" fill="none" stroke-linecap="round"/></symbol>
<symbol id="cSad" viewBox="0 0 100 140"><path d="M43 76 Q50 70 57 76" stroke="#1B1420" stroke-width="2.5" fill="none" stroke-linecap="round"/></symbol>
<symbol id="cShock" viewBox="0 0 100 140"><ellipse cx="50" cy="75" rx="5" ry="6" fill="#1B1420"/></symbol>
<symbol id="tear" viewBox="0 0 10 16"><path d="M5 0 Q0 9 5 16 Q10 9 5 0 Z" fill="#7FC8F8"/></symbol>
<symbol id="kakap" viewBox="0 0 140 90">
<path d="M112 45 L138 22 L132 45 L138 68 Z" fill="#C8432A"/>
<path d="M40 22 L50 4 L58 18 L68 2 L76 18 L86 6 L92 24 Z" fill="#C8432A"/>
<ellipse cx="64" cy="46" rx="54" ry="30" fill="#E8603E"/><ellipse cx="60" cy="58" rx="38" ry="12" fill="#F59A76"/>
<circle cx="32" cy="38" r="8" fill="#FFFFFF"/><circle cx="34" cy="39" r="4" fill="#1B1420"/>
<path d="M22 28 L42 33" stroke="#3A1410" stroke-width="4" stroke-linecap="round"/>
<path d="M84 30 L90 24 M92 36 L100 32" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="kSmug" viewBox="0 0 140 90"><path d="M12 52 Q22 60 32 50" stroke="#3A1410" stroke-width="3" fill="none" stroke-linecap="round"/></symbol>
<symbol id="kLaugh" viewBox="0 0 140 90"><path d="M10 50 Q22 50 32 46 Q24 64 12 58 Z" fill="#3A1410"/></symbol>
<symbol id="kucing" viewBox="0 0 100 110">
<ellipse cx="50" cy="96" rx="26" ry="14" fill="#F0892E"/>
<path d="M18 30 L24 4 L42 22 Z" fill="#F0892E"/><path d="M82 30 L76 4 L58 22 Z" fill="#F0892E"/>
<circle cx="50" cy="48" r="34" fill="#F0892E"/>
<path d="M40 16 L44 26 M50 14 L50 26 M60 16 L56 26" stroke="#C96512" stroke-width="3" stroke-linecap="round"/>
<path d="M30 44 Q37 39 44 44 M56 44 Q63 39 70 44" stroke="#1B1420" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M66 28 L76 52 M66 36 L74 34 M69 44 L77 42" stroke="#8A3E0A" stroke-width="2.5" stroke-linecap="round"/>
<path d="M46 54 L54 54 L50 59 Z" fill="#8A3E0A"/>
<path d="M42 63 Q50 69 58 63" stroke="#1B1420" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M18 56 L38 58 M18 64 L38 62 M82 56 L62 58 M82 64 L62 62" stroke="#5C2A08" stroke-width="1.5"/>
<path d="M26 80 Q50 98 74 80" stroke="#F5C542" stroke-width="5" fill="none"/>
</symbol>
<symbol id="chef" viewBox="0 0 80 170">
<path d="M20 32 Q6 12 26 10 Q30 0 42 4 Q54 -2 60 10 Q76 12 62 32 Z" fill="#2A2433" stroke="#4A4060" stroke-width="2"/>
<circle cx="40" cy="44" r="16" fill="#0E0B14"/>
<path d="M14 166 L18 74 Q40 60 62 74 L66 166 Z" fill="#0E0B14"/>
</symbol>
<symbol id="star" viewBox="-10 -10 20 20"><path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="#FFE14D"/></symbol>
</defs>`;

const use = (id, x, y, w, h, extra = '') => `<use href="#${id}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
const cam = (s, cx, cy, inner) => `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;

function caption(lines, t, a, b) {
  if (t < a - 0.05 || t > b) return '';
  const p = easeOutBack(prog(t, a, 0.25)), s = 0.6 + 0.4 * p, o = clamp((t - a) / 0.12) * clamp((b - t) / 0.15);
  const ys = lines.length === 1 ? [437] : [424, 449];
  return `<g opacity="${o.toFixed(3)}">${cam(s.toFixed(3), 135, 430, `<rect x="12" y="398" width="246" height="64" rx="10" fill="#000000" opacity="0.75"/>` +
    lines.map((l, i) => `<text x="135" y="${ys[i]}" text-anchor="middle" ${F} font-size="19" fill="#FFE14D">${l}</text>`).join(''))}</g>`;
}
function bubble(lines, t, a, b, x, y, w, h, tail, size = 17) {
  if (t < a - 0.05 || t > b) return '';
  const p = easeOutBack(prog(t, a, 0.3)), cx = x + w / 2, cy = y + h / 2;
  const lh = size + 5, y0 = cy - (lines.length - 1) * lh / 2 + size * 0.35;
  return cam(Math.max(0.01, p).toFixed(3), cx, cy, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#FFFFFF"/><path d="${tail}" fill="#FFFFFF"/>` +
    lines.map((l, i) => `<text x="${cx}" y="${(y0 + i * lh).toFixed(1)}" text-anchor="middle" ${F} font-size="${size}" fill="#1B1420">${l}</text>`).join(''));
}
function rainLines(t, speed, n, color, op) {
  let s = `<g stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="${op}">`;
  for (let i = 0; i < n; i++) {
    const x = (i * 53.7) % 290 - 10, y0 = (i * 97.3) % 520;
    const y = ((y0 + t * speed) % 520) - 30;
    s += `<path d="M${(x + y * 0.3).toFixed(1)} ${y.toFixed(1)} l-6 18"/>`;
  }
  return s + '</g>';
}
const blinking = (t, times) => times.some(b => t > b && t < b + 0.13);
const tag = (txt, x, y, w, fill = '#E8576B') => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" fill="${fill}"/><text x="${x + w / 2}" y="${y + 17}" text-anchor="middle" ${F} font-size="14" fill="#FFFFFF">${txt}</text>`;
const flash = (t, at, color = '#FFFFFF') => { const d = t - at; if (d < 0 || d > 0.6) return ''; const o = d < 0.08 ? 0.9 : d < 0.18 ? 0.2 : d < 0.26 ? 0.7 : 0.7 * (1 - (d - 0.26) / 0.34); return `<rect width="270" height="480" fill="${color}" opacity="${Math.max(0, o).toFixed(3)}"/>`; };

// ---------- scenes ----------
function s1(t, D, sc) {
  const sw = 4 * Math.sin(t * 2.2), cz = 1 + 0.05 * (t / D);
  const tears = [0, 0.7, 1.4].map(o => { const p = ((t + o) % 2.1) / 2.1; return use('tear', 114 + (o * 10) % 4, 288 + p * 70, 7, 11, `opacity="${(1 - p).toFixed(2)}"`) + use('tear', 152, 288 + ((p + 0.5) % 1) * 70, 7, 11, `opacity="${(1 - (p + 0.5) % 1).toFixed(2)}"`); }).join('');
  const bolt = (t < 0.7 && Math.floor(t * 14) % 3 !== 1) ? `<polygon points="200,0 170,96 194,96 160,200 226,74 200,74 222,0" fill="#FFE14D"/>` : '';
  const inner = `<rect width="270" height="480" fill="#1E1A3A"/>${bolt}${rainLines(t, 620, 26, '#9DB4E0', 0.7)}
<line x1="16" y1="236" x2="254" y2="236" stroke="#B9A48A" stroke-width="4"/>
<line x1="22" y1="236" x2="22" y2="480" stroke="#7A6248" stroke-width="8"/><line x1="248" y1="236" x2="248" y2="480" stroke="#7A6248" stroke-width="8"/>
<g transform="rotate(${sw.toFixed(2)} 135 234)">${use('cumiBaby', 80, 226, 110, 154)}${use('cSad', 80, 226, 110, 154)}${blinking(t, [2.6]) ? use('cBlink', 80, 226, 110, 154) : ''}${tears}<rect x="128" y="226" width="14" height="16" rx="3" fill="#E8576B"/></g>`;
  return cam(cz.toFixed(4), 135, 300, inner) + flash(t, TL.thunder[0]) + caption(['AKU CUMA CUMI ASIN...', 'TAPI AKU PUNYA MIMPI!'], t, sc.vo[0] - sc.start, sc.vo[1] - sc.start + 0.8);
}
function shopper(x, y, c) { return `<g transform="translate(${x.toFixed(1)} ${y})"><circle cx="0" cy="0" r="13" fill="${c}"/><rect x="-14" y="14" width="28" height="56" rx="10" fill="${c}"/></g>`; }
function s2(t, D, sc) {
  const bob = 3 * Math.sin(t * 3), sunY = lerp(96, 60, easeOut(clamp(t / D)));
  const sh1 = lerp(-40, 320, (t / 6) % 1), sh2 = lerp(320, -40, ((t + 2.5) / 7) % 1);
  return `<rect width="270" height="480" fill="#FBD9A0"/><circle cx="222" cy="${sunY.toFixed(1)}" r="26" fill="#FFB547"/>
${shopper(sh1, 210, '#E3B27E')}${shopper(sh2, 220, '#D9A36C')}
<rect y="330" width="270" height="150" fill="#A8754C"/>
<rect x="34" y="174" width="6" height="160" fill="#7A4A2A"/><rect x="230" y="174" width="6" height="160" fill="#7A4A2A"/>
<rect x="30" y="140" width="210" height="34" fill="#FFF4E6"/>${[30, 72, 114, 156, 198].map(x => `<rect x="${x}" y="140" width="21" height="34" fill="#E8576B"/>`).join('')}
<rect x="88" y="104" width="94" height="28" rx="6" fill="#7A4A2A"/><text x="135" y="124" text-anchor="middle" ${F} font-size="14" fill="#FFF4E6">LAPAK BU SUM</text>
${use('cumiBaby', 85, 168 + bob, 100, 140)}${use('cSmile', 85, 168 + bob, 100, 140)}${blinking(t, [1.8, 4.6, 7.2]) ? use('cBlink', 85, 168 + bob, 100, 140) : ''}
<rect x="24" y="296" width="222" height="18" rx="4" fill="#7A4A2A"/><rect x="40" y="314" width="8" height="64" fill="#5C3720"/><rect x="222" y="314" width="8" height="64" fill="#5C3720"/>` +
    caption(['Di sebuah pasar kecil,', 'hiduplah Cumi Baby...'], t, sc.vo[0] - sc.start, sc.vo[1] - sc.start + 0.6);
}
function s3(t, D, sc) {
  const lt = TL.laugh - sc.start, laughing = t > lt && t < lt + 1.6;
  const kp = laughing ? 1 + 0.04 * Math.abs(Math.sin(t * 18)) : 1 + 0.01 * Math.sin(t * 3);
  const shake = t > sc.vo[0] - sc.start ? 2 * Math.sin(t * 40) : 0;
  const has = [0, 0.35, 0.7].map((o, i) => { const p = prog(t, lt + o, 0.25); if (p <= 0 || t > lt + 2.2) return ''; const pos = [[16, 312, -12], [150, 120, 10], [34, 196, -6]][i]; return `<g transform="translate(${pos[0]} ${pos[1]}) rotate(${pos[2]}) scale(${easeOutBack(p).toFixed(3)})"><text x="0" y="0" ${F} font-size="22" fill="#D63A50">HAHAHA</text></g>`; }).join('');
  const sp = prog(t, 0.2, 0.6), sparkle = sp > 0 && sp < 1 ? use('star', 180, 120, 20 * Math.sin(sp * Math.PI), 20 * Math.sin(sp * Math.PI)) : '';
  return `<rect width="270" height="480" fill="#FBD9A0"/><polygon points="20,0 110,0 200,270 -60,270" fill="#FFF6D6" opacity="${(0.7 + 0.15 * Math.sin(t * 5)).toFixed(2)}"/>
<rect y="330" width="270" height="150" fill="#A8754C"/>
${cam(kp.toFixed(3), 110, 170, use('kakap', 14, 110, 190, 122) + use(laughing ? 'kLaugh' : 'kSmug', 14, 110, 190, 122))}${sparkle}
${[10, 72, 134].map(x => `<rect x="${x}" y="228" width="60" height="40" rx="4" fill="#CDEBFA" stroke="#9FD3EE" stroke-width="2"/>`).join('')}
${bubble(['IH, BAU!', 'KERING! KERIPUT!'], t, sc.vo[0] - sc.start, D, 104, 18, 156, 70, 'M140 86 L128 110 L166 86 Z')}${has}
${use('cumiBaby', 166 + shake, 264, 86, 120)}${use('cShock', 166 + shake, 264, 86, 120)}` +
    caption(['"Siapa yang mau', 'beli kamu?!"'], t, sc.vo[0] - sc.start + 1.4, D);
}
function s4(t, D, sc) {
  const walk = easeOut(prog(t, 0, 1.6)), cx = lerp(-170, 48, walk), cy = 150 - Math.abs(Math.sin(t * 9)) * 6 * (1 - walk);
  const paw = t > 1.7 ? `<ellipse cx="${cx + 80}" cy="${cy + 90}" rx="13" ry="10" fill="#F0892E" stroke="#C96512" stroke-width="2"/>` : '';
  const sniffK = t > 0.9 && t < 1.5 ? `<text x="${cx + 10}" y="${cy + 10}" ${F} font-size="16" fill="#5E9E4A">sniff sniff</text>` : '';
  const stink = t > 1.6 ? `<g stroke="#5E9E4A" stroke-width="3" fill="none" stroke-linecap="round">${[196, 214, 232].map((x, i) => `<path d="M${x + 4 * Math.sin(t * 6 + i)} 300 q-10 -10 0 -20 q10 -10 0 -20"/>`).join('')}</g>` : '';
  const tb = TL.trombone - sc.start, droop = t > tb ? 8 * easeOut(prog(t, tb, 1.2)) : 0;
  const tearB = t > tb ? use('tear', 196, 352 + droop + ((t - tb) * 40) % 30, 6, 10) : '';
  return `<rect width="270" height="480" fill="#FBD9A0"/><rect y="330" width="270" height="150" fill="#A8754C"/>
${use('kucing', cx, cy, 160, 176)}${paw}${sniffK}${stink}
${use('cumiBaby', 176, 300 + droop, 80, 112)}${use('cSad', 176, 300 + droop, 80, 112)}${tearB}
${use('kakap', -8, 320, 130, 84)}${use(t > sc.vo[0] - sc.start && t < sc.vo[1] - sc.start ? 'kLaugh' : 'kSmug', -8, 320, 130, 84)}` +
    bubble(['"Lihat?"'], t, sc.vo[0] - sc.start, sc.vo[0] - sc.start + 1.2, 10, 270, 90, 40, 'M40 308 L44 322 L60 308 Z', 16) +
    caption(['"Bahkan kucing pun', 'jijik sama kamu!"'], t, sc.vo[0] - sc.start + 0.6, D);
}
function s5(t, D, sc) {
  const cz = 1 + 0.15 * easeInOut(clamp(t / D)), tr = 0.8 * Math.sin(t * 25);
  const rip = [0, 0.8, 1.6].map(o => { const p = ((t + o) % 2.4) / 2.4; return `<ellipse cx="138" cy="372" rx="${(20 + p * 60).toFixed(1)}" ry="${(3 + p * 6).toFixed(1)}" fill="none" stroke="#8FA6C8" stroke-width="1.5" opacity="${(1 - p).toFixed(2)}"/>`; }).join('');
  const inner = `<rect width="270" height="480" fill="#2B3A55"/><rect y="340" width="270" height="140" fill="#3A4A63"/>
<rect x="0" y="180" width="80" height="160" fill="#2F6FB5"/><path d="M20 180 L20 340 M50 180 L50 340" stroke="#24578F" stroke-width="3"/>
<ellipse cx="138" cy="372" rx="70" ry="8" fill="#5A6E8F"/>${rip}
${use('cumiBaby', 62 + tr, 140, 150, 210)}${use('cSad', 62 + tr, 140, 150, 210)}${blinking(t, [3.0, 6.2]) ? use('cBlink', 62 + tr, 140, 150, 210) : ''}
${use('tear', 103, 230 + (t * 25) % 50, 9, 14, 'opacity="0.9"')}${use('tear', 172, 230 + ((t * 25) + 25) % 50, 9, 14, 'opacity="0.9"')}
${rainLines(t, 160, 30, '#B7C9EA', 0.8)}`;
  return cam(cz.toFixed(4), 137, 260, inner) + flash(t, TL.thunder[1] - sc.start, '#DDE6FF') + (Math.floor(t * 2) % 2 ? tag('SLOW MO', 12, 14, 86) : '') +
    caption(['"Suatu hari nanti...', 'aku akan buktikan."'], t, sc.vo[0] - sc.start, D);
}
function s6(t, D, sc) {
  const carX = lerp(-200, 0, easeOut(prog(t, 0, 1.2)));
  const st = TL.steps.map(s => s - sc.start); let k = st.filter(s => t > s).length;
  const chefX = 150 + k * 11, chefO = clamp((t - 1.0) / 0.4);
  const lamp = (Math.sin(t * 13) > 0.85) ? 0.12 : 0.22;
  const taps = st.map((s, i) => t > s && t < s + 0.6 ? `<text x="${150 + i * 34}" y="${372 - (t - s) * 20}" ${F} font-size="14" fill="#F3E9DC" opacity="${(1 - (t - s) / 0.6).toFixed(2)}">tap</text>` : '').join('');
  return `<rect width="270" height="480" fill="#141022"/><circle cx="70" cy="64" r="22" fill="#F3E9DC"/>
<circle cx="140" cy="40" r="2" fill="#F3E9DC"/><circle cx="200" cy="80" r="2" fill="#F3E9DC"/><circle cx="30" cy="140" r="2" fill="#F3E9DC"/>
<circle cx="214" cy="250" r="92" fill="#F5C542" opacity="${lamp}"/><rect x="244" y="120" width="6" height="210" fill="#3A3350"/><ellipse cx="236" cy="120" rx="16" ry="6" fill="#F5C542"/>
<rect y="330" width="270" height="150" fill="#262033"/>
<g transform="translate(${carX.toFixed(1)} 0)"><path d="M10 330 L10 296 Q14 286 26 284 L46 284 L66 258 L124 258 L144 284 L160 286 Q170 290 170 300 L170 330 Z" fill="#0B0A10" stroke="#3A3350" stroke-width="2"/>
<path d="M72 264 L120 264 L136 284 L56 284 Z" fill="#2A2440"/><circle cx="46" cy="332" r="16" fill="#000000" stroke="#555555" stroke-width="4"/><circle cx="136" cy="332" r="16" fill="#000000" stroke="#555555" stroke-width="4"/>
<rect x="162" y="296" width="8" height="9" fill="#FFE14D"/><path d="M170 296 L270 270 L270 330 L170 305 Z" fill="#FFE14D" opacity="0.25"/></g>
<g opacity="${chefO.toFixed(2)}">${use('chef', chefX, 180, 70, 149)}<circle cx="${chefX + 30}" cy="218" r="2.5" fill="#F5C542"/><circle cx="${chefX + 40}" cy="218" r="2.5" fill="#F5C542"/></g>${taps}` +
    caption(['Malam itu,', 'seseorang datang...'], t, sc.vo[0] - sc.start, D);
}
function s7(t, D, sc) {
  const hits = TL.hits.map(h => h - sc.start); const k = hits.filter(h => t > h).length;
  const zs = [1, 1.4, 1.85, 2.4]; const last = k ? hits[k - 1] : 0;
  const z = k ? lerp(zs[k - 1], zs[k], easeOutBack(prog(t, last, 0.18))) : 1;
  const rot = t * 8, glow = 2.5 + 1.2 * Math.abs(Math.sin(t * 4));
  const stars = [[240, 170, 0], [112, 200, 0.5], [70, 330, 1.0], [250, 340, 1.5]].map(([x, y, o]) => { const s = 14 * Math.abs(Math.sin(t * 3 + o * 3)); return use('star', x - s / 2, y - s / 2, s, s); }).join('');
  const inner = `<rect width="270" height="480" fill="#3B1D3A"/>
<g transform="rotate(${rot.toFixed(1)} 135 260)" stroke="#5E2E5C" stroke-width="10">${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return `<path d="M135 260 L${(135 + 420 * Math.cos(a)).toFixed(0)} ${(260 + 420 * Math.sin(a)).toFixed(0)}"/>`; }).join('')}</g>
${use('chef', 10, 160, 86, 183)}<circle cx="42" cy="207" r="${glow.toFixed(1)}" fill="#F5C542"/><circle cx="54" cy="207" r="${glow.toFixed(1)}" fill="#F5C542"/>
${use('cumiBaby', 110, 160, 150, 210)}${use('cShock', 110, 160, 150, 210)}${stars}`;
  const hitFlash = k ? `<rect width="270" height="480" fill="#E8576B" opacity="${(0.35 * (1 - prog(t, last, 0.25))).toFixed(3)}"/>` : '';
  const dun = ['DUN...', 'DUN...', 'DUNN!'].slice(0, k).join(' ');
  return cam(z.toFixed(4), 185, 215, inner) + hitFlash +
    (k === 0 ? bubble(['"Aroma ini...', 'yang saya cari', 'selama 20 tahun!"'], t, sc.vo[0] - sc.start, hits[0] - 0.1, 16, 20, 238, 86, 'M60 104 L52 132 L86 104 Z', 17) : '') +
    (k ? tag('ZOOM ' + k + 'X', 170, 20, 86) + caption([dun], t, hits[0], D) : '');
}
function s8(t, D, sc) {
  const bp = prog(t, 0.1, 0.5), bs = lerp(2.6, 1, easeOut(bp));
  const ky = lerp(250, 180, easeOutBack(prog(t, 0.8, 0.7))) + (t > 1.6 ? Math.sin(t * 30) * 1.2 : 0);
  const sweat = t > 1.6 ? [0, 0.6].map(o => { const p = ((t + o) % 1.2) / 1.2; return use('tear', 54 - o * 10, ky + 14 + p * 30, 7, 11, `opacity="${(1 - p).toFixed(2)}"`); }).join('') : '';
  const cardY = lerp(500, 394, easeOutBack(prog(t, 2.4, 0.5)));
  const q = t > sc.vo[0] - sc.start ? `<text x="135" y="140" text-anchor="middle" ${F} font-size="17" fill="#E6D8C6" opacity="${clamp((t - (sc.vo[0] - sc.start)) / 0.3).toFixed(2)}">Siapakah chef misterius itu?</text>` : '';
  return `<rect width="270" height="480" fill="#141022"/>
<g opacity="${bp.toFixed(2)}">${cam(bs.toFixed(3), 135, 92, `<text x="135" y="104" text-anchor="middle" ${F} font-size="36" fill="#F5C542">BERSAMBUNG...</text>`)}</g>${q}
${use('kakap', 50, ky, 170, 109)}${use('kSmug', 50, ky, 170, 109)}${sweat}
<rect x="30" y="246" width="210" height="110" rx="8" fill="#CDEBFA" stroke="#9FD3EE" stroke-width="2"/>
<rect x="50" y="262" width="60" height="10" rx="5" fill="#FFFFFF" opacity="0.6"/>
<g transform="translate(0 ${(cardY - 394).toFixed(1)})"><rect x="20" y="394" width="230" height="66" rx="12" fill="#F5C542"/>
<text x="135" y="423" text-anchor="middle" ${F} font-size="17" fill="#1B1420">SINETRON ASIN UNIVERSE</text>
<text x="135" y="446" text-anchor="middle" ${F} font-size="15" fill="#1B1420">@ikanasinaflah</text></g>`;
}
const SC = [s1, s2, s3, s4, s5, s6, s7, s8];

function frameSvg(T) {
  let i = TL.scenes.findIndex(s => T >= s.start && T < s.start + s.dur); if (i < 0) i = 7;
  const sc = TL.scenes[i], t = T - sc.start;
  let body = SC[i](t, sc.dur, sc);
  // quick cut flash between scenes
  const fade = t < 0.12 ? 1 - t / 0.12 : 0;
  if (fade > 0 && i > 0) body += `<rect width="270" height="480" fill="#000000" opacity="${fade.toFixed(2)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 480" width="270" height="480">${DEFS}${body}</svg>`;
}
const opts = { fitTo: { mode: 'width', value: 1080 }, font: { fontFiles: ['./LilitaOne.ttf'], loadSystemFonts: false, defaultFontFamily: 'Lilita One' } };
const png = T => new Resvg(frameSvg(T), opts).render().asPng();

(async () => {
  if (ONLY === 'batch') {
    const a = +process.argv[3], b = Math.min(+process.argv[4], Math.ceil(TL.total * FPS));
    fs.mkdirSync('frames', { recursive: true });
    for (let f = a; f < b; f++) fs.writeFileSync(`frames/${String(f).padStart(5, '0')}.png`, png(f / FPS));
    return;
  }
  if (ONLY === 'count') { console.log(Math.ceil(TL.total * FPS)); return; }
  if (ONLY) { for (const s of ONLY.split(',')) fs.writeFileSync(`preview_${s}.png`, png(parseFloat(s))); return; }
  const N = Math.ceil(TL.total * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-i', 'audio.wav',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'SinetronAsin_S1E1_CumiYangTerhina.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) {
    if (!ff.stdin.write(png(f / FPS))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  ff.on('close', c => console.log('done', c, N, 'frames'));
})();
