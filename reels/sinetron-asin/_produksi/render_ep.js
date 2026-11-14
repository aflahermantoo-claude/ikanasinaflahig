// Frame renderer for Sinetron Asin Ep 2 (Kata Meledak · Animasi B) and Ep 3 (Sitcom Polos · Animasi A)
// usage: node render_ep.js ep2|ep3 [preview t1,t2,...] | [batch from to]
const path = require('path');
const SB = path.join(__dirname, 'engine');
const { Resvg } = require(SB + '/node_modules/@resvg/resvg-js');
const fs = require('fs');
const L = require(SB + '/lib');
const B = require(SB + '/bg');
const X = require(SB + '/ep2');
const { S, place, cumiBaby: CB, teri: TN, kakap: KK, kucing: KO, star } = L;

const EP = process.argv[2];
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, EP, 'timeline.json'), 'utf8'));
const FPS = TL.fps;
S.LOOK = EP === 'ep2' ? 'B' : 'A'; S.LW = EP === 'ep2' ? 2.8 : 2.2;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const prog = (t, a, d) => clamp((t - a) / d);
const easeOut = p => 1 - Math.pow(1 - p, 3);
const easeOutBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- speech helpers ----------
function amp(sh, T, spk) { // amplitude of a speaker at absolute time T
  for (const l of sh.lines) {
    if (spk && l.spk !== spk) continue;
    if (T >= l.start && T < l.end) { const i = Math.floor((T - l.start) * FPS); return l.env[Math.min(i, l.env.length - 1)] || 0; }
  }
  return 0;
}
const talking = (sh, T, spk) => amp(sh, T, spk) > 0.16;
const mouthOf = (sh, T, spk, base) => (talking(sh, T, spk) ? (Math.floor(T * 12) % 3 === 2 ? 'o' : 'talk') : base);
const blink = (T, phase = 0) => ((T + phase) % 3.4) < 0.12;
function curWord(sh, T) {
  for (const l of sh.lines) for (const w of l.words) if (T >= w.t0 - 0.02 && T < (w.t1 + 0.25)) {
    const nxt = l.words[l.words.indexOf(w) + 1]; if (nxt && T >= nxt.t0 - 0.02) continue; return { w: w.w, t0: w.t0 };
  }
  return null;
}
function curLine(sh, T) { for (const l of sh.lines) if (T >= l.start - 0.05 && T < l.end + 0.35) return l; return null; }
const cam = (s, cx, cy, inner, dx = 0, dy = 0) => `<g transform="translate(${(cx + dx).toFixed(2)} ${(cy + dy).toFixed(2)}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})">${inner}</g>`;

// ================= EP 2 — Animasi B + Kata Meledak =================
function ep2Scene(sh, t, T) {
  const A = sp => amp(sh, T, sp), bounce = sp => -A(sp) * 5 * Math.abs(Math.sin(T * 14));
  const id = sh.id;
  if (id === 'recap') {
    const z = 1 + 0.06 * t / sh.dur;
    const sn = [0, 1].map(k => { const o = ((t * 1.2 + k * 0.5) % 1); return `<path d="M${104 + o * 30} ${196 + k * 14} q10 -6 18 0 q8 6 18 0" stroke="#FFE14D" stroke-width="2" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>`; }).join('');
    return cam(z, 135, 260, X.marketB() + X.chef(18 + Math.sin(t * 2) * 2, 140, 1.15) + sn + place(CB({ lid: blink(T) ? 1 : 0.05, m: 'o', px: -0.6, brow: 'up' }), 140, 212, 0.95)) + `<rect width="270" height="480" fill="#7A4A1A" opacity="0.3"/>`;
  }
  if (id === 'reveal') {
    const cols = [['#B5651D', '#5A2E0A'], ['#1F4FD8', '#0A1E5A'], ['#1FA84F', '#0A4A20'], ['#D81F3A', '#5A0A14']];
    const hits = [0.0, 0.35, 1.05, 1.75];
    let s = `<rect width="270" height="480" fill="#111"/>`;
    cols.forEach(([c1, c2], k) => {
      const p = easeOutBack(prog(t, hits[k], 0.25)); if (p <= 0) return;
      const x = (k % 2) * 135, y = (k > 1) * 240, off = (t * 120) % 30;
      s += `<g><clipPath id="cp${k}"><rect x="${x}" y="${y}" width="135" height="240"/></clipPath><g clip-path="url(#cp${k})"><rect x="${x}" y="${y}" width="135" height="240" fill="${c2}"/>${Array.from({ length: 9 }, (_, j) => `<path d="M${x + j * 30 - 90 + off} ${y + 240} L${x + j * 30 + 10 + off} ${y}" stroke="${c1}" stroke-width="10"/>`).join('')}${cam(p, x + 67, y + 120, place(TN({ lid: blink(T, k) ? 1 : 0.1, m: 'grit', brow: 'angry' }), x + 10, y + 90, 0.95, { w: 120 }))}</g></g>`;
    });
    s += `<path d="M135 0 L135 480 M0 240 L270 240" stroke="#FFFFFF" stroke-width="3"/>`;
    const tp = easeOutBack(prog(t, 1.75, 0.3));
    if (tp > 0) s += cam(tp, 135, 245, `<text x="135" y="240" text-anchor="middle" font-family="Inter BlackIt" font-size="19" fill="#FFFFFF" stroke="#111" stroke-width="4.2" paint-order="stroke">TERI ULTIMA 3-IN-1</text><text x="135" y="262" text-anchor="middle" font-family="Inter BlackIt" font-size="15" fill="#F2C94C" stroke="#111" stroke-width="3.6" paint-order="stroke">-BERAKSI-</text>`);
    return s;
  }
  if (id === 'oh') {
    const z = 1 + 0.18 * easeOut(prog(t, 0, 0.25));
    return cam(z, 135, 240, X.rays('B') + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bounce('cb'), 2.0));
  }
  if (id === 'trio') {
    const w = curWord(sh, T), wi = w ? sh.lines[0].words.findIndex(x => x.t0 === w.t0) : -1, who = wi < 0 ? -1 : Math.floor(wi / 2) % 3;
    const ts = [0, 1, 2].map(k => place(TN({ lid: blink(T, k * 0.7) ? 1 : 0.4, m: k === who && talking(sh, T) ? 'talk' : 'flat', brow: k === who ? 'up' : undefined }), 70, 180 + k * 64 + (k === who ? bounce() : 0), 1.1, { w: 120 })).join('');
    return X.marketB() + X.chef(55, 70, 2.0, true) + ts;
  }
  if (id === 'kakap') {
    const wp = 1 - easeOut(prog(t, 0, 0.22));
    const inner = X.marketB() + place(KK({ lid: blink(T) ? 1 : 0, px: -0.3, m: mouthOf(sh, T, 'kakap', 'grin'), brow: 'up' }), 40, 228 + bounce('kakap'), 1.35) + X.ice(330) + star(40, 222, 6) + star(222, 236, 6);
    return wp > 0.02 ? `<g transform="translate(${(wp * 200).toFixed(1)} 0)" filter="url(#hblur)">${inner}</g>` : inner;
  }
  if (id === 'faint') {
    const lineEnd = sh.lines[0].end - sh.start, fallT = Math.max(0, t - lineEnd);
    const slow = fallT > 0;
    const lines = Array.from({ length: 26 }, (_, i) => `<rect x="${((i * 37) - t * (slow ? 120 : 520)) % 330 + (((i * 37) - t * (slow ? 120 : 520)) % 330 < -60 ? 330 : 0) - 40}" y="${i * 18}" width="${120 + (i * 23) % 140}" height="${4 + (i % 4) * 3}" rx="3" fill="${['#E83B3B', '#2F6FE8', '#F2C94C', '#1C1C24', '#FFFFFF', '#2FA84F'][i % 6]}" opacity="0.85"/>`).join('');
    let s = `<rect width="270" height="480" fill="#9AA0A8"/>${lines}`;
    const pos = [[40, 170, -70], [110, 220, -95], [170, 270, -120]];
    pos.forEach(([x, y, r], k) => {
      const fp = easeOut(prog(fallT, 0.1 + k * 0.4, 0.5));
      const rr = slow ? r * fp : Math.sin(T * 10 + k) * 6, yy = slow ? y + fp * 30 : y - 40 + Math.sin(T * 8 + k) * 3;
      s += place(TN({ lid: slow && fp > 0.3 ? 1 : 0.3, m: slow ? 'o' : (talking(sh, T, 'teri') && k === 1 ? 'talk' : 'frown'), brow: slow ? undefined : 'sad' }), x, yy, 0.8, { w: 120, rot: rr, cx: 60, cy: 30 });
    });
    s += place(KK({ lid: blink(T) ? 1 : 0.4, px: 0.3, m: 'smirk' }), 10, 300, 0.7);
    if (slow) s += `<rect x="16" y="66" width="74" height="22" rx="11" fill="#E8576B" stroke="#161616" stroke-width="1.5"/><text x="53" y="81.5" text-anchor="middle" font-family="Inter XB" font-size="11" fill="#FFFFFF">SLOW MO</text>`;
    return s;
  }
  if (id === 'offer') {
    const kp = easeOut(prog(t, 0.2, 0.5));
    return X.marketB() + [0, 1, 2].map(k => place(TN({ lid: blink(T, k) ? 1 : 0.4, m: k === 1 ? mouthOf(sh, T, 'teri', 'smile') : 'smile', px: 0.6 }), 18, 170 + k * 45.4 + (k === 1 ? bounce('teri') : 0), 0.78, { w: 120, flip: true })).join('') + X.kontrak(40 + 52 * kp, 236, 0.95, -8 * kp) + place(CB({ lid: blink(T) ? 1 : 0.2, m: 'o', px: -0.7, brow: 'up' }), 140, 200, 1.0);
  }
  if (id === 'gaji') {
    return X.marketB() + place(CB({ lid: blink(T) ? 1 : 0.5, m: mouthOf(sh, T, 'cb', 'flat'), px: 0.7, blush: false, brow: 'low' }), 35, 118 + bounce('cb'), 2.0);
  }
  if (id === 'deal') {
    const cbl = sh.lines[1], dealT = T - cbl.start;
    let s = X.marketB() + place(CB({ lid: blink(T) ? 1 : (dealT > 0 ? 0.55 : 0.15), m: dealT > -0.2 ? mouthOf(sh, T, 'cb', 'smile') : 'smile', brow: dealT > 0 ? 'low' : 'up' }), 75, 120 + bounce('cb'), 1.2) + X.plate(135, 345, 1.3);
    if (dealT > 0) for (let i = 0; i < 28; i++) { const a = i * 2.39, sp = 60 + (i % 5) * 18, tt = dealT; const x = 135 + Math.cos(a) * sp * tt, y = 230 + Math.sin(a) * sp * tt + 90 * tt * tt; if (tt < 1.6) s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="5" height="3" fill="${['#E83B3B', '#2F6FE8', '#F2C94C', '#2FA84F', '#FF4FA3'][i % 5]}" transform="rotate(${(i * 40 + tt * 300).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
    return s;
  }
  if (id === 'boss') {
    const eyes = blink(T, 1.3) ? '' : `<circle cx="194" cy="245" r="4" fill="#FFE14D"/><circle cx="218" cy="245" r="4" fill="#FFE14D"/>`;
    const shake = talking(sh, T, 'kakap') ? Math.sin(T * 40) * 1.2 : 0;
    return X.office('B') + place(KK({ lid: blink(T) ? 1 : 0.3, px: 0.5, m: mouthOf(sh, T, 'kakap', 'frown'), sweat: true, chain: false, brow: 'sad' }), -6 + shake, 240, 1.0, { w: 140, flip: true }) + L.phone(118 + shake, 262, 1.4, 10) +
      `<path d="M150 230 Q150 150 205 150 Q262 150 262 230 L262 360 L150 360 Z" fill="#2A0F12" stroke="#000" stroke-width="2"/>` + place(KO({ lid: 0.55, m: 'smirk', brow: 'angry' }), 168, 200, 0.9) + `<rect x="150" y="190" width="112" height="170" fill="#000" opacity="0.62"/>` + eyes;
  }
  return '';
}
// Tanda kecil brand (pengganti watermark kredit) — aturan Aflah 29 Okt 2026
const BRAND_LINE = 'Produsen Cumi Asin & Ikan Asin', BRAND_PHONE = '085776662852';
function footer() {
  return `<rect x="66" y="394" width="108" height="21" rx="10.5" fill="#141418" fill-opacity="0.55"/><text x="120" y="403" text-anchor="middle" font-family="Inter SB" font-size="6.6" fill="#FFFFFF">${esc(BRAND_LINE)}</text><text x="120" y="411.5" text-anchor="middle" font-family="Inter SB" font-size="6.6" fill="#FFFFFF">${BRAND_PHONE}</text>`;
}
function ep2Overlay(sh, t, T) {
  let o = '';
  const w = curWord(sh, T);
  if (w && sh.id !== 'reveal') {
    const p = easeOutBack(prog(T, w.t0, 0.14)), y = sh.id === 'boss' ? 172 : ['oh', 'gaji'].includes(sh.id) ? 340 : 236;
    const word = w.w.toUpperCase().replace(/^\.+/, '');
    const fs = word.length > 9 ? 22 : 28;
    o += `<g transform="translate(120 ${y}) rotate(-3) scale(${(0.5 + 0.5 * p).toFixed(3)} ${(0.5 + 0.5 * p * (1 + 0.15 * Math.sin(prog(T, w.t0, 0.2) * Math.PI))).toFixed(3)})"><text x="0" y="0" text-anchor="middle" font-family="Inter BlackIt" font-size="${fs}" fill="#FFFFFF" stroke="#111" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${esc(word)}</text></g>`;
  }
  if (sh.id === 'faint') { const le = sh.lines[0].end; const p = easeOutBack(prog(T, le + 0.35, 0.2)); if (p > 0 && !w) o += `<g transform="translate(120 236) rotate(-3) scale(${p.toFixed(3)})"><text text-anchor="middle" font-family="Inter BlackIt" font-size="28" fill="#FFFFFF" stroke="#111" stroke-width="5" paint-order="stroke">PINGSAN</text></g>`; }
  if (sh.id === 'boss') { const nar = sh.lines[1]; const p = easeOutBack(prog(T, nar.start, 0.3)); if (p > 0) o += `<g transform="translate(120 120) scale(${p.toFixed(3)})"><text text-anchor="middle" font-family="Inter BlackIt" font-size="22" fill="#F2C94C" stroke="#111" stroke-width="4.5" paint-order="stroke">BERSAMBUNG...</text></g>`; }
  o += footer();
  return o;
}

// ================= EP 3 — Animasi A + Sitcom Polos =================
function officeA() {
  return `<rect width="270" height="480" fill="#2B1D1A"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 36}" y="0" width="18" height="480" fill="#33231F"/>`).join('')}
<rect x="150" y="70" width="104" height="120" fill="#1B2440" stroke="#111" stroke-width="2.5"/><path d="M150 130 L254 130 M202 70 L202 190" stroke="#111" stroke-width="3"/>${[[165, 160], [180, 150], [220, 165], [238, 152]].map(([x, y]) => `<rect x="${x}" y="${y}" width="8" height="${190 - y}" fill="#0E1426"/><rect x="${x + 2}" y="${y + 4}" width="2" height="2" fill="#FFD66B"/>`).join('')}
<rect x="22" y="80" width="80" height="58" fill="#E9DFC6" stroke="#111" stroke-width="2.2"/><path d="M36 110 L86 110 M44 100 L44 120 M56 100 L56 120 M68 100 L68 120 M86 110 L96 102 L96 118 Z" stroke="#5A3A22" stroke-width="2" fill="#5A3A22"/>
<rect y="350" width="270" height="130" fill="#5A3A22" stroke="#111" stroke-width="2.5"/><rect y="350" width="270" height="10" fill="#6E4A2C"/>`;
}
function marketDayA() {
  let s = `<rect width="270" height="480" fill="#F7DFA8"/><circle cx="220" cy="70" r="24" fill="#FFB547" stroke="#161616" stroke-width="2"/>`;
  s += `<g stroke="#161616" stroke-width="2"><rect x="20" y="170" width="6" height="170" fill="#7A4A2A"/><rect x="244" y="170" width="6" height="170" fill="#7A4A2A"/></g>`;
  s += `<g stroke="#161616" stroke-width="1.5">${[16, 46, 76, 106, 136, 166, 196, 226].map((x, i) => `<path d="M${x} 140 L${x + 30} 140 L${x + 30} 168 Q${x + 15} 178 ${x} 168 Z" fill="${i % 2 ? '#F4EBDD' : '#C8553D'}"/>`).join('')}</g>`;
  s += `<rect x="80" y="104" width="110" height="28" rx="6" fill="#7A4A2A" stroke="#161616" stroke-width="2"/><text x="135" y="123" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="12" fill="#FFF4E6">LAPAK BU SUM</text>`;
  s += `<rect y="340" width="270" height="140" fill="#B48A5E" stroke="#161616" stroke-width="2"/>`;
  return s;
}
const counterA = () => `<g stroke="#161616" stroke-width="2.2"><rect x="0" y="300" width="270" height="16" fill="#7A4A2A"/><rect x="0" y="316" width="270" height="90" fill="#8E5D36"/></g>${[40, 95, 150, 205].map(x => `<ellipse cx="${x}" cy="300" rx="24" ry="6" fill="#C9A46A" stroke="#161616" stroke-width="1.5"/>${[-10, 0, 10].map(d => `<ellipse cx="${x + d}" cy="297" rx="4" ry="2" fill="#E8BF8A" stroke="#7A5A30" stroke-width="0.6"/>`).join('')}`).join('')}`;
const shades = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="22" y="40" width="26" height="15" rx="5" fill="#111"/><rect x="52" y="40" width="26" height="15" rx="5" fill="#111"/><path d="M48 46 L52 46" stroke="#111" stroke-width="3"/></g>`;
const paw = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="9" fill="#F0892E" stroke="#161616" stroke-width="2"/></g>`;

function ep3Scene(sh, t, T) {
  const id = sh.id;
  const kakapClose = (base, sweat) => B.living ? (X.marketA() + place(KK({ lid: blink(T) ? 1 : (base.lid ?? 0.1), px: base.px ?? 0.3, m: mouthOf(sh, T, 'kakap', base.m || 'frown'), sweat, chain: true }), -30, 150, 1.95, { w: 140, flip: true }) + L.phone(232, 236, 1.6, 15) + `<rect y="380" width="270" height="100" fill="#3A3048"/>`) : '';
  const koClose = o => officeA() + place(KO({ lid: blink(T) && (o.lid ?? 0.5) < 0.9 ? 1 : (o.lid ?? 0.5), px: o.px ?? 0, m: mouthOf(sh, T, 'ko', o.m || 'flat') }), 25, 140, 2.2) + paw(218, 262, 1.4) + L.phone(222, 236, 1.6, 12) + `<rect y="402" width="270" height="78" fill="#5A3A22" stroke="#111" stroke-width="2"/>`;
  if (id === 'k1') return kakapClose({ lid: 0, px: 0.4, m: 'grit' }, true);
  if (id === 'o1') return koClose({ lid: 1, m: 'flat' });
  if (id === 'k2') return kakapClose({ lid: 0.1, px: 0.4, m: 'frown' }, true);
  if (id === 'o2') return koClose({ lid: 0.55, px: 0.9, m: 'flat' });
  if (id === 'k3') { const shifty = Math.sin(T * 6) > 0 ? -0.9 : 0.9; return kakapClose({ lid: 0.35, px: talking(sh, T) ? 0.4 : shifty, m: 'smirk' }, true); }
  if (id === 'o3') return koClose({ lid: 0.75, px: 0.3, m: 'frown' });
  if (id === 'shop') {
    const walk = easeOut(prog(t, 0, 1.0)), kx = -150 + walk * 165;
    return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.2, m: mouthOf(sh, T, 'cb', 'smile') }), 140, 190, 1.0) + counterA() +
      place(KO({ lid: 0.5, m: 'flat' }), kx, 196 - Math.abs(Math.sin(t * 9)) * 4 * (1 - walk), 1.05) + shades(kx, 196, 1.05);
  }
  if (id === 'sniff') {
    const dn = easeOut(prog(t, 0.9, 0.35)), z = 1 + 0.06 * easeOut(prog(t, 1.0, 0.25));
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 1.0 ? `<path d="M${30 + o * 40} ${300 - k * 16} q10 -6 18 0 q8 6 18 0" stroke="#7A5A30" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 240, marketDayA() + place(KO({ lid: t > 0.9 ? 0 : 0.5, pr: t > 0.9 ? 2 : undefined, m: mouthOf(sh, T, 'ko', t > 0.9 ? 'o' : 'flat') }), 30, 120, 2.1) + shades(30, 120 + dn * 32, 2.1) + sn);
  }
  if (id === 'k4') return kakapClose({ lid: 0, px: 0.6, m: 'grit' }, true);
  if (id === 'eat') {
    const chew = Math.floor(T * 5) % 2 ? 'flat' : 'smile';
    const buzz = Math.sin(T * 50) * 1.2;
    return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.2, m: 'smile' }), 160, 196, 0.85) + counterA() + place(KO({ lid: blink(T, 1) ? 1 : 0.55, m: mouthOf(sh, T, 'ko', chew) }), 20, 170, 1.25) +
      X.plate(90, 330, 0.75) + L.phone(196 + buzz, 330, 1.2, 80) + `<text x="210" y="312" font-family="Liberation Sans" font-weight="bold" font-size="9" fill="#C8553D">Kakap</text>`;
  }
  if (id === 'end') {
    const chew = Math.floor(T * 5) % 2 ? 'flat' : 'smile';
    const pin = 1 + 0.06 * easeOut(prog(T, sh.lines[0].start, 0.25));
    return cam(pin, 135, 240, marketDayA() + place(KO({ lid: blink(T) ? 1 : 0.5, px: 0.95, py: 0.2, m: talking(sh, T) ? mouthOf(sh, T, 'ko', 'flat') : chew }), 30, 120, 2.1) + X.plate(200, 410, 0.7));
  }
  return '';
}
function subRef(lines, y) {
  const fs = Math.min(15.5, 200 / (Math.max(...lines.map(l => l.length)) * 0.55));
  return lines.map((l, i) => `<text x="120" y="${y + i * 19}" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="${fs.toFixed(1)}" fill="#FFFFFF" stroke="#111" stroke-width="3.4" stroke-linejoin="round" paint-order="stroke">${esc(l)}</text>`).join('');
}
function wrap(text, max = 26) {
  const ws = text.split(' '), out = []; let cur = '';
  for (const w of ws) { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) out.push(cur); return out;
}
function ep3Overlay(sh, t, T) {
  const ttl = TITLES[EP] || 'Bos Oren..';
  let o = `<rect x="16" y="68" width="${ttl.length * 8.1 + 18}" height="24" rx="4" fill="#FFFFFF"/><text x="25" y="85" font-family="Liberation Sans" font-weight="bold" font-size="14.5" fill="#111">${esc(ttl)}</text>`;
  const l = curLine(sh, T);
  if (l) { const ls = wrap(l.text); o += subRef(ls, ls.length > 1 ? 384 - (ls.length - 1) * 19 : 380); }
  o += footer();
  if (sh.id === 'end' && t > sh.dur - 1.6) {
    const p = easeOutBack(prog(t, sh.dur - 1.6, 0.3));
    o += cam(p, 120, 145, `<text x="120" y="150" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="24" fill="#F5C542" stroke="#111" stroke-width="3" paint-order="stroke">BERSAMBUNG...</text>`) + `<rect x="45" y="${330}" width="150" height="26" rx="13" fill="#FFFFFF" stroke="#161616" stroke-width="1.6"/><text x="120" y="347.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="12.5" fill="#111">@ikanasinaflah</text>`;
  }
  return o;
}


// ================= S2E1 — Juragan Menyamar: Hari Pertama Jadi Kuli (gaya A, sitcom deadpan) =================
const CJ = L.cumiJumbo;
function gudangA() { // gudang ikan asin siang, gaya sitcom datar
  let s = `<rect width="270" height="480" fill="#E9D3A6"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 30 + 8} 40 L${i * 30 + 8} 340" stroke="#D6BC8A" stroke-width="2"/>`).join('')}`;
  s += `<path d="M0 40 L270 40" stroke="#161616" stroke-width="3"/><rect y="0" width="270" height="40" fill="#8E5D36" stroke="#161616" stroke-width="2.2"/>`;
  // jendela besar + rak jemur ikan asin
  s += `<rect x="150" y="150" width="96" height="104" fill="#BFE3F0" stroke="#161616" stroke-width="2.4"/><circle cx="226" cy="172" r="10" fill="#FFE07A"/>`;
  s += `<path d="M154 196 L242 196 M154 226 L242 226" stroke="#7A4A2A" stroke-width="2.2"/>${[0, 1].map(r => [0, 1, 2, 3, 4].map(k => `<path d="M${162 + k * 17} ${198 + r * 30} q5 4 0 16 q-5 -12 0 -16 Z" fill="#C9A46A" stroke="#7A5A30" stroke-width="1"/>`).join('')).join('')}`;
  s += `<rect x="30" y="100" width="110" height="26" rx="5" fill="#7A4A2A" stroke="#161616" stroke-width="2"/><text x="85" y="117.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10.5" fill="#FFF4E6">GUDANG No. 37</text>`;
  s += `<rect y="340" width="270" height="140" fill="#A88458" stroke="#161616" stroke-width="2.2"/>`;
  return s;
}
const karungA = (x, y, label, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 6 Q0 -6 16 -4 L54 -4 Q70 -6 70 6 L68 40 Q35 48 2 40 Z" fill="#D8C49A" stroke="#161616" stroke-width="2"/><path d="M14 -4 Q20 -12 26 -4 M44 -4 Q50 -12 56 -4" stroke="#161616" stroke-width="1.6" fill="none"/>${label ? `<text x="35" y="24" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="8.5" fill="#6B4A22">${label}</text>` : ''}</g>`;
const stacks = () => karungA(-14, 300, 'TERI') + karungA(-6, 262, 'IKAN ASIN') + karungA(206, 300, 'CUMI') + karungA(214, 262, '');
// caping kuli (lokal: sama dengan kotak Cumi Jumbo 100 x 150)
const capingSvg = `<path d="M6 20 L50 -24 L94 20 Q50 30 6 20 Z" fill="#D9B26A" stroke="#161616" stroke-width="2.2" stroke-linejoin="round"/><path d="M28 -2 L72 -2 M18 9 L82 9 M50 -24 L50 26" stroke="#A8803E" stroke-width="1.3"/>`;
// handuk kuli menutupi kalung emas juragan
const handuk = (peek = false) => `<path d="M16 82 Q50 100 84 82 L82 94 Q50 110 18 94 Z" fill="#F4EBDD" stroke="#161616" stroke-width="2"/><path d="M24 90 Q50 102 76 90" stroke="#C8553D" stroke-width="2" fill="none"/>${peek ? `<circle cx="50" cy="104" r="4.5" fill="#F5C542" stroke="#161616" stroke-width="1.2"/>` : ''}`;
function kuli(o = {}, { caping = true, peek = false, wink = false } = {}) {
  let s = CJ({ hat: false, ...o }) + handuk(peek);
  if (wink) s += `<circle cx="63" cy="55" r="14.6" fill="#D99A5E"/><path d="M53 57 Q63 63 73 57" stroke="#161616" stroke-width="${S.LW}" fill="none" stroke-linecap="round"/>`;
  if (caping) s += capingSvg;
  return s;
}
// Mandor Kakap: helm proyek kuning, tanpa kalung
const mandor = o => KK({ chain: false, ...o }) + `<path d="M34 24 Q36 -8 66 -8 Q96 -8 98 24 Z" fill="#F5C542" stroke="#161616" stroke-width="2.2"/><ellipse cx="66" cy="24" rx="38" ry="5" fill="#F2B520" stroke="#161616" stroke-width="2"/><path d="M66 -8 L66 22" stroke="#D99A10" stroke-width="3"/>`;
const ikanAsin = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-30 0 Q-10 -12 18 -6 L32 -14 L28 0 L32 14 L18 6 Q-10 12 -30 0 Z" fill="#C9A46A" stroke="#161616" stroke-width="1.8"/><circle cx="-20" cy="-2" r="2" fill="#161616"/><path d="M-6 -6 L-6 6 M4 -6 L4 6" stroke="#9A7A44" stroke-width="1.2"/></g>`;

function s2e1Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  if (id === 'kick') {
    const lunge = Math.sin(Math.PI * prog(t, 0.0, 0.45)) * 26;
    const fly = prog(t, 0.3, 0.9), fe = easeOut(fly);
    const cap = fly > 0 ? place(capingSvg, 150 + fe * 70, 196 - Math.sin(fly * Math.PI) * 120 + fe * 40, 1.0, { rot: fe * 300, cx: 50, cy: 0 }) : '';
    return gudangA() + stacks() + place(kuli({ lid: blink(T) ? 1 : (fly > 0 ? 0.3 : 0.45), px: -0.8, m: 'flat' }, { caping: fly <= 0 }), 140, 196, 1.0) +
      place(mandor({ lid: blink(T) ? 1 : 0.1, px: -0.3, m: mouthOf(sh, T, 'kakap', 'grit'), brow: 'angry' }), 4 + lunge, 236 + bob('kakap'), 1.05, { w: 140, flip: true }) + cap;
  }
  if (id === 'maaf') return gudangA() + place(kuli({ lid: blink(T) ? 1 : 0.5, m: mouthOf(sh, T, 'cj', 'flat') }, { caping: false }), 35, 130 + bob('cj'), 2.0);
  if (id === 'hina' || id === 'ketawa' || id === 'gengsi') {
    const laugh = id === 'ketawa' ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    const o = id === 'hina' ? { lid: 0.45, px: 0.4, m: 'smirk' } : id === 'ketawa' ? { lid: 0.98, m: 'grin' } : { lid: 0.3, px: -0.8, m: 'frown', sweat: true };
    const lineEnd = sh.lines[0].end - sh.start, ring = id === 'gengsi' && t > lineEnd + 0.15;
    const buzz = ring ? Math.sin(T * 50) * 1.4 : 0;
    return gudangA() + place(mandor({ ...o, lid: blink(T) && o.lid < 0.9 ? 1 : o.lid, m: mouthOf(sh, T, 'kakap', o.m), px: ring ? 0.9 : o.px }), -30, 150 - laugh + bob('kakap'), 1.95, { w: 140, flip: true }) +
      (ring ? L.phone(212 + buzz, 300, 1.6, 12) + `<path d="M232 280 l8 -6 M234 292 l10 0 M232 304 l8 6" stroke="#161616" stroke-width="2" stroke-linecap="round"/>` : '') + `<rect y="402" width="270" height="78" fill="#A88458" stroke="#161616" stroke-width="2"/>`;
  }
  if (id === 'bisik') {
    return gudangA() + stacks() + place(kuli({ lid: blink(T) ? 1 : 0.5, px: -0.9, m: 'flat' }), 130, 180, 1.05) +
      place(TN({ lid: blink(T, 1) ? 1 : 0.35, px: -0.6, m: mouthOf(sh, T, 'teri', 'flat'), brow: 'sad' }), 20, 252 + bob('teri'), 1.15, { w: 120, flip: true });
  }
  if (id === 'sniff') {
    const narrow = t > 0.9, z = 1 + 0.05 * easeOut(prog(t, 0.9, 0.3));
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 0.9 ? `<path d="M${100 + o * 20} ${226 - k * 14} q10 -6 18 0 q8 6 18 0" stroke="#7A5A30" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 260, gudangA() + karungA(16, 222, 'IKAN ASIN', 1.45) + place(kuli({ lid: blink(T) ? 1 : (narrow ? 0.6 : 0.3), px: -0.8, py: 0.3, m: mouthOf(sh, T, 'cj', 'flat') }), 110, 120 + bob('cj'), 1.55) + sn);
  }
  if (id === 'cek') {
    const shock = t > 0.2, sp = shock ? Math.min(1, (t - 0.2) * 4) : 0;
    const stars = shock ? star(40, 150, 7 * sp) + star(200, 170, 6 * sp) + star(60, 300, 5 * sp) : '';
    return gudangA() + place(TN({ lid: shock ? 0 : 0.4, pr: shock ? 2 : undefined, px: 0.6, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), 15, 170 + bob('teri'), 1.75, { w: 120, flip: true }) +
      ikanAsin(150, 320, 1.6, -10 + Math.sin(T * 10) * 3) + `<path d="M176 352 q4 8 0 14 M190 350 q4 8 0 14" stroke="#7FC0D8" stroke-width="2.4" fill="none" stroke-linecap="round"/>` + stars;
  }
  if (id === 'umum') {
    const l2 = sh.lines[1], point = T >= l2.start - 0.1;
    return gudangA() + `<g stroke="#161616" stroke-width="2"><rect x="70" y="276" width="110" height="60" fill="#8E5D36"/><path d="M70 296 L180 296 M70 316 L180 316" stroke-width="1.4"/></g>` +
      place(mandor({ lid: blink(T) ? 1 : 0.1, px: point ? 0.8 : -0.2, m: mouthOf(sh, T, 'kakap', 'grit'), brow: 'angry', sweat: !point }), 60, 196 + bob('kakap'), 1.05, { w: 140, flip: point }) + (point ? '' : L.phone(70, 236, 1.2, -10)) +
      place(TN({ lid: 0.3, m: 'o' }), -10, 352, 1.0, { w: 120, flip: true }) + place(kuli({ lid: point ? 0.5 : 0.35, px: point ? -0.5 : -0.2, m: 'flat' }), 168, 300, 0.9);
  }
  if (id === 'siap') return gudangA() + place(kuli({ lid: blink(T) ? 1 : 0.55, px: 0, m: mouthOf(sh, T, 'cj', 'flat') }), 35, 130 + bob('cj'), 2.0);
  if (id === 'end') {
    const wink = t > 0.25 && t < 1.4, z = 1 + 0.08 * easeOut(prog(t, 0.2, 0.3));
    const gleam = t > 1.4 ? star(135, 345, 7 * (0.6 + 0.4 * Math.sin(T * 8))) : '';
    return cam(z, 135, 250, gudangA() + place(kuli({ lid: 0.3, px: 0.2, py: 0.2, m: wink ? 'smirk' : 'flat' }, { wink, peek: t > 1.4 }), 35, 130, 2.0) + gleam);
  }
  return '';
}

// ================= S3E1 — Mertua Cumi Jumbo: Tinggalkan Anak Saya! (gaya A, sitcom deadpan) =================
function ruangMakanA() { // ruang makan rumah juragan, malam
  let s = `<rect width="270" height="480" fill="#5E2A2A"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 32}" y="0" width="14" height="480" fill="#6B3131"/>`).join('')}`;
  s += `<path d="M135 0 L135 44" stroke="#161616" stroke-width="2"/><path d="M105 44 L165 44 L155 62 L115 62 Z" fill="#F5C542" stroke="#161616" stroke-width="2"/>${[112, 126, 144, 158].map(x => `<circle cx="${x}" cy="68" r="3.4" fill="#FFF1B8" stroke="#161616" stroke-width="1.2"/>`).join('')}<ellipse cx="135" cy="70" rx="60" ry="22" fill="#FFE8A0" opacity="0.12"/>`;
  s += `<rect x="24" y="112" width="70" height="86" fill="#C9A04A" stroke="#161616" stroke-width="2.4"/><rect x="32" y="120" width="54" height="70" fill="#3A2A22" stroke="#161616" stroke-width="1.4"/><path d="M47 142 Q48 128 59 128 Q70 128 71 142 Z" fill="#1F1F22"/><ellipse cx="59" cy="142" rx="17" ry="3.5" fill="#1F1F22"/><path d="M49 145 C49 160 69 160 69 145 Z" fill="#D99A5E"/>`;
  s += `<rect x="170" y="110" width="76" height="96" fill="#12203A" stroke="#161616" stroke-width="2.4"/><path d="M208 110 L208 206 M170 158 L246 158" stroke="#161616" stroke-width="2.4"/><circle cx="226" cy="130" r="8" fill="#FFF1B8"/>`;
  s += `<rect y="330" width="270" height="150" fill="#F4EBDD" stroke="#161616" stroke-width="2.2"/><path d="M0 344 L270 344" stroke="#C8553D" stroke-width="3"/>${[30, 80, 130, 180, 230].map(x => `<path d="M${x} 344 l10 14 l10 -14" fill="#F4EBDD" stroke="#C8553D" stroke-width="1.6"/>`).join('')}`;
  return s;
}
const meja = () => `<rect y="402" width="270" height="78" fill="#F4EBDD" stroke="#161616" stroke-width="2"/><path d="M0 414 L270 414" stroke="#C8553D" stroke-width="3"/>`;
const amplop = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-6" y="-26" width="22" height="18" fill="#7FBF7A" stroke="#161616" stroke-width="1.4" transform="rotate(-12)"/><rect x="4" y="-24" width="22" height="18" fill="#8ED089" stroke="#161616" stroke-width="1.4" transform="rotate(8)"/><rect x="-26" y="-16" width="52" height="32" rx="2" fill="#E9D3A6" stroke="#161616" stroke-width="2"/><path d="M-26 -16 L0 4 L26 -16" stroke="#161616" stroke-width="1.6" fill="none"/></g>`;
const nasgor = (x, y, s = 1, empty = false, steamT = 0) => {
  let g = `<ellipse cx="0" cy="0" rx="46" ry="12" fill="#FFFFFF" stroke="#161616" stroke-width="2"/><ellipse cx="0" cy="-1" rx="34" ry="7" fill="#EDEDED"/>`;
  if (!empty) {
    g += `<path d="M-34 -2 Q-28 -30 0 -32 Q28 -30 34 -2 Q0 6 -34 -2 Z" fill="#D9963E" stroke="#161616" stroke-width="1.8"/>${[[-18, -14], [-4, -22], [10, -12], [20, -20], [-10, -6], [4, -4]].map(([a, b], i) => `<path d="M${a} ${b} q5 -3 10 0 l3 -2 l0 4 l-3 -2 q-5 3 -10 0 Z" fill="#DCE5EC" stroke="#5A6A78" stroke-width="0.8" transform="rotate(${(i * 37) % 50 - 25} ${a + 5} ${b})"/>`).join('')}<path d="M14 -30 q4 -4 8 0" stroke="#3FA34D" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    g += [0, 1, 2].map(k => { const o = ((steamT * 0.8 + k * 0.33) % 1); return `<path d="M${-14 + k * 14} ${-36 - o * 22} q-5 -8 0 -16" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${(0.9 * (1 - o)).toFixed(2)}"/>`; }).join('');
  } else g += `<circle cx="-8" cy="-2" r="1.6" fill="#D9963E"/><circle cx="10" cy="0" r="1.4" fill="#D9963E"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
};
const papa = o => CJ({ hat: true, ...o });
function s3e1Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  if (id === 'banting') {
    const drop = easeOut(prog(t, 0, 0.18)), shake = t > 0.15 && t < 0.45 ? Math.sin(T * 70) * 2.2 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + ruangMakanA() + place(papa({ lid: blink(T) ? 1 : 0.15, px: 0.6, m: mouthOf(sh, T, 'cj', 'grit') }), 8, 186 + bob('cj'), 1.3) +
      place(TN({ lid: t > 0.15 ? 0 : 0.35, pr: t > 0.15 ? 2 : undefined, px: -0.4, m: 'o' }), 150, 286, 0.95, { w: 120 }) + amplop(128, 290 + (1 - drop) * -90, 1.15, -6) + (t > 0.15 && t < 0.6 ? star(100, 282, 6) + star(158, 276, 5) : '') + `</g>`;
  }
  if (id === 'tolak') {
    const push = easeOut(prog(t, 0.6, 0.8));
    return ruangMakanA() + place(TN({ lid: blink(T) ? 1 : 0.4, px: -0.2, m: mouthOf(sh, T, 'teri', 'frown'), sweat: true }), 70, 238 + bob('teri'), 1.7, { w: 120 }) + meja() + amplop(150 - push * 110, 420, 1.2, -4) +
      `<path d="M58 216 Q54 226 58 232 Q62 226 58 216 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>`;
  }
  if (id === 'hina' || id === 'sinis' || id === 'syarat') {
    const laugh = id === 'sinis' ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    const o = id === 'hina' ? { lid: 0.5, px: -0.4, m: 'smirk' } : id === 'sinis' ? { lid: 0.98, m: 'grin' } : { lid: 0.55, px: 0, m: 'flat' };
    const z = id === 'syarat' ? 1 + 0.06 * easeOut(prog(t, 0, sh.dur)) : 1;
    return cam(z, 135, 240, ruangMakanA() + place(papa({ ...o, lid: blink(T) && o.lid < 0.9 ? 1 : o.lid, m: mouthOf(sh, T, 'cj', o.m) }), 35, 140 - laugh + bob('cj'), 2.0)) + meja();
  }
  if (id === 'bela') {
    return ruangMakanA() + place(CB({ lid: blink(T) ? 1 : 0.3, px: 0.6, m: mouthOf(sh, T, 'cb', 'frown') }), 35, 135 + bob('cb'), 2.0) + meja();
  }
  if (id === 'saji') {
    const slide = easeOut(prog(t, 0.2, 0.9));
    return ruangMakanA() + place(papa({ lid: blink(T) ? 1 : 0.6, px: 0.7, m: 'flat' }), 0, 196, 1.2) +
      place(TN({ lid: blink(T, 1) ? 1 : 0.35, px: -0.4, m: mouthOf(sh, T, 'teri', 'smile') }), 150, 276 + bob('teri'), 1.0, { w: 120 }) + nasgor(200 - slide * 80, 352, 1.15, false, t);
  }
  if (id === 'cicip') {
    const wow = t > 1.1, z = 1 + 0.08 * easeOut(prog(t, 1.1, 0.25));
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 1.1 ? `<path d="M${118 - o * 10} ${330 - o * 40 - k * 10} q6 -6 0 -12 q-6 -6 0 -12" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    const sp = wow ? Math.min(1, (t - 1.1) * 4) : 0;
    return cam(z, 135, 250, ruangMakanA() + place(papa({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, py: wow ? 0 : 0.5, m: mouthOf(sh, T, 'cj', wow ? 'o' : 'flat') }), 35, 140 + bob('cj'), 2.0) + meja() + nasgor(135, 420, 1.5, false, t) + sn +
      (wow ? star(36, 160, 8 * sp) + star(228, 176, 7 * sp) + star(214, 300, 5 * sp) : ''));
  }
  if (id === 'habis') {
    const l2 = sh.lines[1], ngeles = T >= l2.start - 0.1;
    return ruangMakanA() + `<rect x="176" y="150" width="86" height="190" fill="#2A1414" stroke="#161616" stroke-width="2.4"/>` +
      place(CB({ lid: blink(T) ? 1 : (ngeles ? 0.55 : 0), pr: ngeles ? undefined : 2, px: -0.7, m: mouthOf(sh, T, 'cb', ngeles ? 'flat' : 'o') }), 178, 196 + bob('cb'), 0.82) +
      place(papa({ lid: blink(T) ? 1 : 0.2, px: ngeles ? -0.9 : 0.8, m: mouthOf(sh, T, 'cj', 'frown'), sweat: true }), 6, 180 + bob('cj'), 1.3) +
      `<circle cx="78" cy="292" r="1.8" fill="#FFFFFF" stroke="#161616" stroke-width="0.6"/>` + nasgor(70, 318, 0.95, true);
  }
  if (id === 'end') {
    const z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6);
    let s = `<rect width="270" height="480" fill="#12100F"/><rect x="0" y="330" width="270" height="150" fill="#1E1A18"/>${[40, 100, 160, 220].map(x => `<path d="M${x} 90 L${x} 120" stroke="#2A2420" stroke-width="2"/><circle cx="${x}" cy="126" r="7" fill="none" stroke="#2A2420" stroke-width="2"/>`).join('')}`;
    s += `<ellipse cx="135" cy="200" rx="90" ry="150" fill="#2A2420" opacity="0.5"/>`;
    s += `<g stroke="#000" stroke-width="2"><path d="M100 150 Q94 108 112 104 Q118 84 135 88 Q152 84 158 104 Q176 108 170 150 Z" fill="#4A4644"/><rect x="104" y="146" width="62" height="12" fill="#3A3634"/></g><g fill="#050505" stroke="#000" stroke-width="2"><path d="M100 158 Q100 200 135 200 Q170 200 170 158 Z"/><path d="M90 340 Q88 210 135 200 Q182 210 180 340 Z"/></g>`;
    s += `<circle cx="122" cy="246" r="5" fill="#FFE14D" opacity="${glow.toFixed(2)}"/><circle cx="148" cy="246" r="5" fill="#FFE14D" opacity="${glow.toFixed(2)}"/>`;
    s += `<g transform="translate(196 250) rotate(18)"><rect x="-2.5" y="0" width="5" height="44" rx="2" fill="#3A2A22" stroke="#000" stroke-width="1"/><path d="M-10 -30 L10 -30 L8 0 L-8 0 Z" fill="#9AA3AD" stroke="#000" stroke-width="1.4"/><path d="M-4 -24 L-4 -6 M0 -24 L0 -6 M4 -24 L4 -6" stroke="#5A626B" stroke-width="1.4"/></g>` + star(188, 226, 5 * glow);
    return cam(z, 135, 240, s);
  }
  return '';
}

// ================= S1E4 — Cumi yang Terhina: Kakap Ditinggal Bos (gaya A, sitcom deadpan) =================
const chefHat = `<path d="M14 19 Q2 6 16 3 Q20 -8 32 -4 Q44 -8 47 4 Q58 7 50 19 Z" fill="#FFFFFF" stroke="#161616" stroke-width="2.2" stroke-linejoin="round"/><rect x="15" y="15" width="34" height="6" fill="#F2F2F2" stroke="#161616" stroke-width="1.6"/>`;
const teriChef = o => TN({ blangkon: false, ...o }) + chefHat;
const lapakEs = () => `<rect x="70" y="104" width="130" height="28" rx="6" fill="#2F6FB0" stroke="#161616" stroke-width="2"/><text x="135" y="123" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="12" fill="#FFFFFF">ES KAKAP SEGAR</text>`;
const flies = T => [0, 1, 2].map(k => { const a = T * (3 + k) + k * 2.1, x = 150 + Math.cos(a) * (26 + k * 8), y = 210 + Math.sin(a * 1.3) * 14 - k * 10; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#161616"/><path d="M${(x - 3).toFixed(1)} ${(y - 3).toFixed(1)} l2 2 M${(x + 3).toFixed(1)} ${(y - 3).toFixed(1)} l-2 2" stroke="#161616" stroke-width="0.8"/>`; }).join('');
function s1e4Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const kakapBig = (bg, o, ground, ph = false) => bg + place(KK({ chain: true, ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'kakap', o.m || 'frown') }), -30, 150 + bob('kakap'), 1.95, { w: 140, flip: true }) + (ph ? L.phone(232, 236, 1.6, 15) : '') + `<rect y="380" width="270" height="100" fill="${ground}"/>`;
  if (id === 'tutup') {
    const shake = talking(sh, T, 'kakap') ? Math.sin(T * 40) * 1.4 : 0;
    const tut = t < 0.55 ? `<path d="M240 196 l10 -8 M244 208 l14 0 M240 220 l10 8" stroke="#FFE14D" stroke-width="2.4" stroke-linecap="round"/>` : '';
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + kakapBig(X.marketA(), { lid: 0, px: 0.5, m: 'grit', sweat: true, brow: 'sad' }, '#3A3048', true) + tut + `</g>`;
  }
  if (id === 'sepi') {
    return marketDayA() + lapakEs() + place(KK({ lid: blink(T) ? 1 : 0.75, px: -0.2, m: mouthOf(sh, T, 'kakap', 'frown'), chain: true }), 70, 232, 1.0, { w: 140, flip: true }) + X.ice(296) + flies(T) +
      `<path d="M${(40 + (t * 40) % 220).toFixed(1)} 330 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0" fill="none" stroke="#9A7A44" stroke-width="2" transform="rotate(${(t * 200).toFixed(0)} ${(40 + (t * 40) % 220).toFixed(1)} 330)"/>`;
  }
  if (id === 'hina') {
    const second = T >= sh.lines[1].start - 0.1, laugh = second ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return kakapBig(marketDayA(), second ? { lid: 0.98, m: 'grin' } : { lid: 0.45, px: 0.4, m: 'smirk' }, '#B48A5E').replace('translate(', `translate(0 ${(-laugh).toFixed(2)}) translate(`);
  }
  if (id === 'oh') return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bob('cb'), 2.0);
  if (id === 'teri') {
    const slide = 1 - easeOut(prog(t, 0, 0.35));
    const speed = slide > 0.05 ? [0, 1, 2].map(k => `<path d="M${200 + k * 12} ${200 + k * 34} L${262} ${200 + k * 34}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="${slide.toFixed(2)}"/>`).join('') : '';
    const pant = Math.abs(Math.sin(T * 9)) * 3;
    return marketDayA() + speed + place(teriChef({ lid: blink(T) ? 1 : 0.15, px: -0.2, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), 15 + slide * 220, 170 - pant + bob('teri'), 1.75, { w: 120, flip: true }) +
      L.sweatDrop(40, 180, 1.4) + L.sweatDrop(214, 196, 1.2);
  }
  if (id === 'antre') {
    const z = 1.45 - 0.45 * easeOut(prog(t, 0.2, 0.7)), shock = t > 0.3, sp = shock ? Math.min(1, (t - 0.3) * 4) : 0;
    let q = '';
    for (let k = 7; k >= 0; k--) { const x = 250 - k * 22 + (k % 2) * 4, y = 268 - k * 13; q += place(TN({ lid: blink(T, k * 0.4) ? 1 : 0.35, px: -0.6, m: 'smile' }), x, y, 0.42 + k * -0.015, { w: 120 }); }
    const inner = marketDayA() + `<rect x="0" y="200" width="270" height="140" fill="#E7C68D"/>` + q + place(CB({ lid: blink(T) ? 1 : 0.2, m: 'smile' }), 32, 196, 0.62) + counterA().replace(/<rect x="0" y="300" width="270"/, '<rect x="0" y="300" width="140"').replace(/<rect x="0" y="316" width="270"/, '<rect x="0" y="316" width="140"') +
      place(KK({ lid: shock ? 0 : 0.4, pr: shock ? 2 : undefined, px: 0.5, m: mouthOf(sh, T, 'kakap', 'o'), brow: 'up', chain: true }), 96, 236 + bob('kakap'), 0.9, { w: 140 });
    return cam(z, 200, 260, inner) + (shock ? star(96, 236, 7 * sp) + star(232, 250, 6 * sp) : '');
  }
  if (id === 'bos') {
    const walk = easeOut(prog(t, 0, 0.6));
    return marketDayA() + place(KO({ lid: 0.5, m: mouthOf(sh, T, 'ko', 'flat') }), 35 + (1 - walk) * 200, 140, 2.0) + shades(35 + (1 - walk) * 200, 140, 2.0);
  }
  if (id === 'panik') return kakapBig(marketDayA(), { lid: 0, px: 0.8, m: 'grit', sweat: true, brow: 'sad' }, '#B48A5E');
  if (id === 'makan') {
    const chew = Math.floor(T * 5) % 2 ? 'flat' : 'smile';
    return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.2, m: 'smile' }), 160, 196, 0.85) + counterA() + place(KO({ lid: blink(T, 1) ? 1 : 0.55, m: talking(sh, T, 'ko') ? mouthOf(sh, T, 'ko', 'flat') : chew }), 20, 170, 1.25) + shades(20, 170, 1.25) + X.plate(90, 330, 0.75);
  }
  if (id === 'telp') {
    const sly = Math.sin(T * 5) > 0 ? -0.9 : 0.9;
    return kakapBig(X.marketA(), { lid: 0.55, px: talking(sh, T, 'kakap') ? 0.4 : sly, m: 'smirk' }, '#1A1626', true) + `<rect width="270" height="480" fill="#0A0814" opacity="0.38"/>`;
  }
  if (id === 'end') {
    const rise = easeOut(prog(t, 0.2, 1.6)), z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6);
    let s = `<rect width="270" height="480" fill="#06121E"/><rect y="250" width="270" height="230" fill="#0B2236"/>`;
    s += [0, 1, 2].map(k => `<path d="M0 ${252 + k * 26} ${Array.from({ length: 10 }, (_, j) => `q13.5 ${j % 2 ? 6 : -6} 27 0`).join(' ')}" transform="translate(${(-((T * 14 + k * 9) % 27)).toFixed(1)} 0)" stroke="#1D4A6B" stroke-width="2" fill="none"/>`).join('');
    const fy = 252 - rise * 120;
    s += `<path d="M86 252 L${150} ${fy.toFixed(1)} Q166 ${(fy + 40).toFixed(1)} 178 252 Z" fill="#3A4A58" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<circle cx="112" cy="312" r="5.5" fill="#FF3B2F" opacity="${(glow * rise).toFixed(2)}"/><circle cx="160" cy="312" r="5.5" fill="#FF3B2F" opacity="${(glow * rise).toFixed(2)}"/>`;
    return cam(z, 135, 240, s);
  }
  return '';
}

// ---------- daftar episode ----------
// Episode baru (gaya Ep 3 / sitcom deadpan): tulis fungsi <ep>Scene(sh, t, T) dengan karakter gaya A,
// ================= S2E2 — Juragan Menyamar: Salah Sembah (gaya A, sitcom deadpan) =================
function gerbangA() { // gerbang gudang ikan asin, pagi
  let s = `<rect width="270" height="340" fill="url(#sky)"/><circle cx="214" cy="150" r="16" fill="#FFE07A" stroke="#161616" stroke-width="1.6"/>`;
  s += `<rect x="40" y="170" width="190" height="170" fill="#E9D3A6" stroke="#161616" stroke-width="2.4"/><path d="M30 172 L135 118 L240 172 Z" fill="#8E5D36" stroke="#161616" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<rect x="96" y="232" width="78" height="108" fill="#6B4A2A" stroke="#161616" stroke-width="2.2"/><path d="M135 232 L135 340" stroke="#161616" stroke-width="1.8"/>`;
  s += `<rect x="60" y="184" width="150" height="26" rx="5" fill="#7A4A2A" stroke="#161616" stroke-width="2"/><text x="135" y="201.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#FFF4E6">GUDANG IKAN ASIN No. 37</text>`;
  s += `<g stroke="#161616" stroke-width="2.2"><rect x="4" y="150" width="22" height="190" fill="#B9B2A6"/><rect x="244" y="150" width="22" height="190" fill="#B9B2A6"/></g>`;
  s += `<rect y="340" width="270" height="140" fill="#C9B48A" stroke="#161616" stroke-width="2.2"/>`;
  return s;
};
const rakA = (x, y) => `<g stroke="#161616" stroke-width="2"><rect x="${x}" y="${y}" width="80" height="8" fill="#8E5D36"/><rect x="${x}" y="${y + 44}" width="80" height="8" fill="#8E5D36"/><rect x="${x + 2}" y="${y}" width="6" height="74" fill="#7A4A2A"/><rect x="${x + 72}" y="${y}" width="6" height="74" fill="#7A4A2A"/></g>`;
function s2e2Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = `<rect y="402" width="270" height="78" fill="#C9B48A" stroke="#161616" stroke-width="2"/>`;
  const mandorClose = (o, extra = '') => gerbangA() + place(mandor({ ...o, lid: blink(T) && o.lid < 0.9 ? 1 : o.lid, m: mouthOf(sh, T, 'kakap', o.m) }), -30, 150 + (o.dy || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + extra + ground;
  if (id === 'siaga') {
    const lunge = Math.sin(Math.PI * prog(t, 0.0, 0.4)) * 18;
    return gerbangA() + place(kuli({ lid: blink(T) ? 1 : 0.45, px: -0.8, m: 'flat' }), 150, 200, 1.0) +
      place(mandor({ lid: blink(T) ? 1 : 0.1, px: -0.3, m: mouthOf(sh, T, 'kakap', 'grit'), brow: 'angry' }), 4 + lunge, 236 + bob('kakap'), 1.05, { w: 140, flip: true });
  }
  if (id === 'siap') return gerbangA() + place(kuli({ lid: blink(T) ? 1 : 0.5, m: mouthOf(sh, T, 'cj', 'flat') }), 35, 130 + bob('cj'), 2.0);
  if (id === 'hina') return mandorClose({ lid: 0.45, px: 0.4, m: 'smirk' });
  if (id === 'ketawa') return mandorClose({ lid: 0.98, m: 'grin', dy: -Math.abs(Math.sin(T * 16)) * 3 });
  if (id === 'bisik') {
    return gerbangA() + karungA(-10, 300, 'IKAN ASIN') + karungA(200, 300, 'CUMI') + place(kuli({ lid: blink(T) ? 1 : 0.5, px: -0.9, m: 'flat' }), 130, 180, 1.05) +
      place(TN({ lid: blink(T, 1) ? 1 : 0.35, px: -0.6, m: mouthOf(sh, T, 'teri', 'flat'), brow: 'sad' }), 20, 252 + bob('teri'), 1.15, { w: 120, flip: true });
  }
  if (id === 'tunjuk') {
    const z = 1 + 0.04 * easeOut(prog(t, 0.2, 0.5));
    const arrow = `<g transform="translate(${104 + Math.sin(T * 8) * 3} 262) rotate(35) scale(1.6)"><path d="M0 0 l-18 10 l4 -6 l-14 -4 l14 -4 l-4 -6 Z" fill="#F5C542" stroke="#161616" stroke-width="1.4"/></g>`;
    return cam(z, 135, 260, gerbangA() + rakA(176, 214) + place(kuli({ lid: blink(T) ? 1 : 0.4, px: -0.8, py: 0.5, m: mouthOf(sh, T, 'cj', 'flat') }), 120, 120 + bob('cj'), 1.3) + karungA(14, 290, 'TERI', 1.0) + arrow);
  }
  if (id === 'telp') {
    const ringing = t < 0.8, buzz = ringing ? Math.sin(T * 50) * 1.4 : 0;
    const waves = ringing ? `<path d="M232 280 l8 -6 M234 292 l10 0 M232 304 l8 6" stroke="#161616" stroke-width="2" stroke-linecap="round"/>` : '';
    const lid = t < 0.8 ? 0.3 : t > 3.0 ? 0 : 0.2;
    return mandorClose({ lid, px: t < 0.8 ? 0.9 : 0.6, m: t > 3.0 ? 'o' : 'frown', sweat: t > 3.0, brow: t > 3.0 ? 'up' : undefined }, L.phone(212 + buzz, 300, 1.6, ringing ? 12 : -8) + waves);
  }
  if (id === 'loh') {
    const sp = Math.min(1, t * 4), z = 1 + 0.1 * easeOutBack(prog(t, 0.0, 0.3));
    const stars = star(40, 140, 7 * sp) + star(214, 160, 6 * sp) + star(50, 300, 5 * sp);
    return cam(z, 120, 240, mandorClose({ lid: 0, pr: 2, px: 0, m: 'o', brow: 'up', sweat: true }, L.phone(212, 300, 1.6, -8))) + stars;
  }
  if (id === 'curiga') {
    const shifty = Math.sin(T * 5) > 0 ? -0.9 : 0.9;
    return gerbangA() + place(TN({ lid: 0.35, px: 0.2, m: 'flat' }), -14, 236, 1.0, { w: 120, flip: true }) + place(kuli({ lid: 0.5, px: 0, m: 'flat' }), 176, 206, 0.85) +
      place(mandor({ lid: 0.55, px: shifty, m: mouthOf(sh, T, 'kakap', 'frown'), sweat: true }), 72, 196 + bob('kakap'), 0.95, { w: 140, flip: true });
  }
  if (id === 'sembah') {
    const l2 = sh.lines[1], bow = easeOut(prog(t, 0.0, 0.35));
    const teriTalk = T >= l2.start - 0.05;
    return gerbangA() + place(kuli({ lid: blink(T) ? 1 : 0.55, px: -0.6, m: 'flat' }), 186, 206, 0.8) +
      place(TN({ lid: teriTalk ? 0 : 0.3, pr: teriTalk ? 2 : undefined, px: 0.6, m: mouthOf(sh, T, 'teri', teriTalk ? 'o' : 'flat'), brow: 'up' }), -6, 176 + bob('teri'), 1.1, { w: 120, flip: true }) +
      place(mandor({ lid: 0.6, px: 0.9, py: 0.6, m: mouthOf(sh, T, 'kakap', 'frown'), sweat: true }), 62, 196 + bow * 14 + bob('kakap'), 0.95, { w: 140, rot: 35 * bow, cx: 70, cy: 120 }) +
      (teriTalk ? `<text x="56" y="176" font-family="Liberation Sans" font-weight="bold" font-size="28" fill="#161616" stroke="#FFFFFF" stroke-width="2" paint-order="stroke">?</text>` : '');
  }
  if (id === 'end') {
    const z = 1 + 0.09 * easeOut(prog(t, 0.2, 2.5));
    const gleam = t > 1.2 ? star(232, 280, 7 * (0.6 + 0.4 * Math.sin(T * 8))) : '';
    return cam(z, 135, 250, gerbangA() + place(kuli({ lid: 0.3, px: 0.2, py: 0.2, m: t > 1.2 ? 'smirk' : 'flat' }, { peek: t > 1.2 }), 35, 130, 2.0) + karungA(176, 284, 'TERI', 1.1) + gleam);
  }
  return '';
}

// lalu daftarkan di sini: SCENES.<ep> = [<ep>Scene, ep3Overlay]; TITLES.<ep> = 'Judul bar..';
const SCENES = { ep2: [ep2Scene, ep2Overlay], ep3: [ep3Scene, ep3Overlay] };
const TITLES = { ep3: 'Bos Oren..' };
SCENES.s2e1 = [s2e1Scene, ep3Overlay]; TITLES.s2e1 = 'Juragan Menyamar..';
SCENES.s3e1 = [s3e1Scene, ep3Overlay]; TITLES.s3e1 = 'Mertua Cumi Jumbo..';
SCENES.s1e4 = [s1e4Scene, ep3Overlay]; TITLES.s1e4 = 'Kakap Ditinggal Bos..';
SCENES.s2e2 = [s2e2Scene, ep3Overlay]; TITLES.s2e2 = 'Juragan Menyamar..';

// ================= S3E2 — Mertua Cumi Jumbo: Chef Tak Terkalahkan (gaya A, sitcom deadpan) =================
function dapurA(dark = false) { // dapur rumah juragan, malam
  let s = `<rect width="270" height="480" fill="#CFE3DD"/>`;
  for (let y = 0; y < 330; y += 22) for (let x = (y / 22) % 2 ? -11 : 0; x < 270; x += 22) s += `<rect x="${x}" y="${y}" width="22" height="22" fill="none" stroke="#B3CCC5" stroke-width="1.2"/>`;
  s += `<rect x="170" y="70" width="80" height="90" fill="#12203A" stroke="#161616" stroke-width="2.4"/><path d="M210 70 L210 160 M170 115 L250 115" stroke="#161616" stroke-width="2.4"/><circle cx="230" cy="88" r="7" fill="#FFF1B8"/>`;
  s += `<rect x="16" y="96" width="120" height="7" fill="#8E5D36" stroke="#161616" stroke-width="1.8"/>`;
  s += [[34, 0], [70, 1], [106, 0]].map(([x, k]) => `<path d="M${x} 103 L${x} 112" stroke="#161616" stroke-width="1.6"/><circle cx="${x}" cy="${126 + k * 4}" r="${13 + k * 3}" fill="#5A5F66" stroke="#161616" stroke-width="2"/><rect x="${x - 2}" y="${108}" width="4" height="${6 + k * 2}" fill="#3A2A22"/>`).join('');
  s += `<rect y="330" width="270" height="150" fill="#8E5D36" stroke="#161616" stroke-width="2.4"/><rect y="330" width="270" height="12" fill="#E9DFC6" stroke="#161616" stroke-width="2"/>${[50, 135, 220].map(x => `<rect x="${x - 30}" y="360" width="60" height="80" rx="3" fill="#7A4A2A" stroke="#161616" stroke-width="1.8"/><circle cx="${x + 20}" cy="400" r="3" fill="#F5C542" stroke="#161616" stroke-width="1"/>`).join('')}`;
  if (dark) s += `<rect width="270" height="480" fill="#0A0814" opacity="0.55"/>`;
  return s;
}
const chefKakap = o => KK({ chain: false, ...o }) + `<g transform="translate(31 -12) scale(1.15)">${chefHat}</g>`;
const menuMewah = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="46" ry="12" fill="#FFFFFF" stroke="#161616" stroke-width="2"/><ellipse cx="0" cy="-1" rx="34" ry="7" fill="#F2F2F2"/><path d="M-14 -4 Q-12 -16 2 -16 Q14 -14 14 -4 Z" fill="#B5673A" stroke="#161616" stroke-width="1.6"/><path d="M-24 -2 q4 -4 8 0 q4 4 8 0 q4 -4 8 0 q4 4 8 0 q4 -4 8 0" stroke="#7A2E5A" stroke-width="2" fill="none"/><circle cx="6" cy="-18" r="2.4" fill="#3FA34D" stroke="#161616" stroke-width="0.8"/></g>`;
const cumiKering = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-6 -22 Q0 -30 6 -22 L8 6 Q0 10 -8 6 Z" fill="#E7C08A" stroke="#161616" stroke-width="1.6"/>${[-6, -2, 2, 6].map(d => `<path d="M${d} 6 Q${d * 1.4} 16 ${d * 1.2} 22" stroke="#C9965A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join('')}<circle cx="-2" cy="-4" r="1.4" fill="#161616"/></g>`;
const spoon = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-1.6" y="0" width="3.2" height="30" rx="1.5" fill="#B9C0C8" stroke="#161616" stroke-width="1"/><ellipse cx="0" cy="-4" rx="6" ry="8" fill="#D2D8DE" stroke="#161616" stroke-width="1.4"/></g>`;
function s3e2Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const kkBig = (o, bg = dapurA()) => bg + place(chefKakap({ ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'kakap', o.m || 'smirk') }), -30, 170 + bob('kakap'), 1.95, { w: 140, flip: true }) + `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>`;
  const papaBig = (o, extra = '') => dapurA() + place(papa({ ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 + bob('cj'), 2.0) + meja() + extra;
  if (id === 'duel') {
    const shake = t > 0.05 && t < 0.4 ? Math.sin(T * 70) * 2.2 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + dapurA() + place(TN({ lid: blink(T, 1) ? 1 : 0.35, px: 0.6, m: 'flat' }), 2, 250, 0.82, { w: 120 }) +
      place(chefKakap({ lid: blink(T, 2) ? 1 : 0.5, px: -0.6, m: 'smirk' }), 166, 262, 0.72) +
      place(papa({ lid: blink(T) ? 1 : 0.1, px: 0, m: mouthOf(sh, T, 'cj', 'grit') }), 72, 168 + bob('cj'), 1.25) + (t < 0.6 ? star(60, 300, 6) + star(210, 300, 6) : '') + `</g>`;
  }
  if (id === 'sombong') { const slide = 1 - easeOut(prog(t, 0, 0.3)); return `<g transform="translate(${(slide * 220).toFixed(1)} 0)">` + kkBig({ lid: 0.55, px: 0.4, m: 'smirk' }) + `</g>`; }
  if (id === 'hina') {
    const laugh = T > sh.lines[0].end - 1.2 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return kkBig({ lid: laugh ? 0.98 : 0.45, px: 0.8, m: laugh ? 'grin' : 'smirk' }).replace('translate(', `translate(0 ${(-laugh).toFixed(2)}) translate(`) + karungA(108, 424, '', 0.75) + karungA(186, 424, '', 0.75);
  }
  if (id === 'khawatir') return dapurA() + place(CB({ lid: blink(T) ? 1 : 0.35, px: 0.6, m: mouthOf(sh, T, 'cb', 'frown'), brow: 'sad' }), 35, 135 + bob('cb'), 2.0) + `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>`;
  if (id === 'tenang') {
    return dapurA() + place(TN({ lid: blink(T) ? 1 : 0.55, px: 0, m: mouthOf(sh, T, 'teri', 'flat') }), 30, 170 + bob('teri'), 1.6, { w: 120 }) + `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>` +
      karungA(-2, 296, 'CUMI', 0.75) + karungA(216, 296, 'TERI', 0.75) + cumiKering(240, 252, 1.2, 12);
  }
  if (id === 'cicip1') {
    const chew = Math.floor(T * 5) % 2 ? 'flat' : 'smile';
    return papaBig({ lid: 0.75, px: 0, m: talking(sh, T, 'cj') ? 'flat' : chew }, menuMewah(135, 432, 1.5));
  }
  if (id === 'cicip2') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 1.0 ? `<path d="M${118 - o * 10} ${330 - o * 40 - k * 10} q6 -6 0 -12 q-6 -6 0 -12" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 250, dapurA() + place(papa({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, py: wow ? 0 : 0.5, m: mouthOf(sh, T, 'cj', wow ? 'o' : 'flat') }), 35, 140 + bob('cj'), 2.0) + meja() + nasgor(135, 420, 1.5, false, t) + cumiKering(176, 404, 0.8, 70) + sn +
      (wow ? star(36, 160, 8 * sp) + star(228, 176, 7 * sp) + star(214, 300, 5 * sp) : ''));
  }
  if (id === 'curi') {
    const shock = t > 0.55, sp = shock ? Math.min(1, (t - 0.55) * 4) : 0, lift = easeOut(prog(t, 0, 0.4));
    return dapurA() + place(chefKakap({ lid: shock ? 0 : (blink(T) ? 1 : 0.5), pr: shock ? 2 : undefined, px: 0.9, m: mouthOf(sh, T, 'kakap', shock ? 'o' : 'flat'), brow: shock ? 'up' : undefined }), 10, 170, 1.6, { w: 140, flip: true }) +
      spoon(196, 330 - lift * 40, -30) + meja() + nasgor(200, 420, 1.0, false, t) + (shock ? star(40, 170, 7 * sp) + star(236, 190, 6 * sp) : '');
  }
  if (id === 'tuduh') {
    const shake = talking(sh, T, 'kakap') ? Math.sin(T * 40) * 1.4 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + kkBig({ lid: 0, px: 0.6, m: 'grit', sweat: true, brow: 'angry' }) + `</g>`;
  }
  if (id === 'rahasia') {
    const raise = easeOut(prog(t, 0.2, 0.6));
    return dapurA() + place(TN({ lid: blink(T) ? 1 : 0.55, px: -0.3, m: mouthOf(sh, T, 'teri', 'smile') }), 40, 170 + bob('teri'), 1.6, { w: 120 }) + `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>` +
      cumiKering(222, 380 - raise * 90, 1.7, 8) + (raise > 0.9 ? `<g opacity="${(0.5 + 0.5 * Math.sin(T * 8)).toFixed(2)}">${star(236, 300, 5)}${star(196, 314, 4)}</g>` : '');
  }
  if (id === 'menang') {
    const sly = t > sh.dur - 1.2;
    return papaBig({ lid: 0.6, px: sly ? -0.9 : 0.95, m: 'frown', sweat: true }, nasgor(135, 432, 1.4, true));
  }
  if (id === 'bisik') {
    return dapurA(true) + place(papa({ lid: blink(T) ? 1 : 0.15, px: 0.9, m: 'frown' }), -20, 190, 1.35) +
      place(chefKakap({ lid: 0.55, px: -0.6, m: mouthOf(sh, T, 'kakap', 'smirk') }), 128, 214 + bob('kakap'), 1.0) + `<rect y="402" width="270" height="78" fill="#2A1E16" stroke="#161616" stroke-width="2"/>`;
  }
  if (id === 'end') {
    const z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6), flip = easeOut(prog(t, 0.6, 0.6));
    let s = `<rect width="270" height="480" fill="#12100F"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 32}" y="0" width="14" height="480" fill="#1A1614"/>`).join('')}`;
    s += `<g transform="translate(135 230) rotate(${(-6 + 6 * flip).toFixed(1)})"><rect x="-62" y="-80" width="124" height="150" fill="#C9A04A" stroke="#000" stroke-width="3"/><rect x="-50" y="-68" width="100" height="126" fill="#2A2420" stroke="#000" stroke-width="1.6"/>`;
    s += `<path d="M-30 58 Q-34 -6 0 -10 Q34 -6 30 58 Z" fill="#050505"/><circle cx="0" cy="-30" r="22" fill="#050505"/><path d="M-26 -40 L26 -40 L18 -56 L-18 -56 Z" fill="#050505"/>`;
    s += `<circle cx="-9" cy="-30" r="4" fill="#FF3B2F" opacity="${(glow * flip).toFixed(2)}"/><circle cx="9" cy="-30" r="4" fill="#FF3B2F" opacity="${(glow * flip).toFixed(2)}"/></g>`;
    s += `<text x="222" y="210" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="44" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.5 * glow).toFixed(2)}">?</text>`;
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s3e2 = [s3e2Scene, ep3Overlay]; TITLES.s3e2 = 'Mertua Cumi Jumbo..';

// ================= S1E5 — Cumi yang Terhina: Juragan Hiu (gaya A, sitcom deadpan) =================
// Juragan Hiu: 140 x 100, menghadap KIRI (seperti Kakap)
function hiuA(o = {}) {
  const { lid = 0.4, px = -0.4, py = 0, m = 'flat', sweat = false, tear = false } = o;
  const lw = S.LW, gr = '#6F8796', dg = '#4F6573', ln = '#161616';
  let s = `<path d="M114 48 L140 14 L132 48 L140 82 Z" fill="${dg}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="M52 22 L72 -16 L90 22 Z" fill="${dg}" stroke="${ln}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<ellipse cx="66" cy="50" rx="56" ry="32" fill="${gr}" stroke="${ln}" stroke-width="${lw}"/>`;
  s += `<path d="M14 58 Q60 86 112 60 Q64 72 14 58 Z" fill="#DDE6EA"/>`;
  s += `<path d="M80 36 q-5 12 0 24 M88 36 q-5 12 0 24 M96 38 q-5 11 0 22" stroke="${dg}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M62 66 L76 88 L86 66 Z" fill="${dg}" stroke="${ln}" stroke-width="${lw * 0.8}" stroke-linejoin="round"/>`;
  s += L.eye(34, 40, 11, { side: 1, lid, px, py, skin: gr, lw, pr: o.pr, brow: o.brow, m });
  s += `<path d="M22 25 L46 31" stroke="#26323A" stroke-width="${lw * 1.8}" stroke-linecap="round"/><path d="M50 22 L58 34 M53 26 L57 24 M55 30 L59 28" stroke="#C8D2D8" stroke-width="1.6" stroke-linecap="round"/>`;
  if (m === 'teeth') s += `<path d="M10 58 Q24 70 40 60 Z" fill="#3A1414" stroke="${ln}" stroke-width="${lw * 0.8}"/><path d="M13 60 l3 4 l3 -3 l3 4 l3 -3 l3 4 l3 -3 l3 3" stroke="#FFFFFF" stroke-width="1.6" fill="none"/>`;
  else s += L.mouth(m, 22, 60, 12);
  s += `<path d="M30 76 Q56 94 86 78" stroke="#F5C542" stroke-width="4.2" fill="none" stroke-dasharray="4 1.6"/><rect x="50" y="82" width="12" height="12" rx="2" fill="#F5C542" stroke="${ln}" stroke-width="1.2"/><text x="56" y="91.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="8" fill="#7A5A10">H</text>`;
  if (tear) s += `<path d="M30 54 Q26 63 30 68 Q34 63 30 54 Z" fill="#8FD0F5" stroke="${ln}" stroke-width="1.2"/>`;
  if (sweat) s += `<path d="M98 16 Q94 25 98 30 Q102 25 98 16 Z" fill="#8FD0F5" stroke="${ln}" stroke-width="1.2"/>`;
  return s;
}
const karungCumi = (x, y, sc = 1, rot = 0) => `<g transform="rotate(${rot} ${x + 35 * sc} ${y + 20 * sc})">${karungA(x, y, 'CUMI', sc)}</g>`;
function s1e5Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = c => `<rect y="402" width="270" height="78" fill="${c}" stroke="#161616" stroke-width="2"/>`;
  const kkBig = (o, bg = marketDayA(), g = '#B48A5E') => bg + place(KK({ chain: true, ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'kakap', o.m || 'frown') }), -30, 150 + (o.dy || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + ground(g);
  const hiuBig = (o, extra = '') => marketDayA() + place(hiuA({ ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'hiu', o.m || 'flat') }), -40, 150 + bob('hiu'), 1.95, { w: 140, flip: true }) + extra + ground('#B48A5E');
  if (id === 'sunyi') {
    const pass = prog(t, 0.0, sh.dur), sx = 300 - pass * 420;
    return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.2, px: 0.6, m: 'o' }), 140, 196, 0.85) + counterA() + place(KK({ lid: 0, pr: 2, px: 0.6, m: 'o', chain: true }), 6, 236, 0.85, { w: 140, flip: true }) +
      `<g opacity="0.78"><path d="M${sx} 300 L${sx + 60} 140 Q${sx + 90} 240 ${sx + 130} 300 Z" fill="#1B2430"/></g><rect y="0" width="270" height="480" fill="#0B1220" opacity="${(0.12 + 0.12 * Math.sin(pass * Math.PI)).toFixed(2)}"/>`;
  }
  if (id === 'minggir') { const shout = Math.sin(T * 30) * (talking(sh, T, 'kakap') ? 1.2 : 0); return `<g transform="translate(${shout.toFixed(2)} 0)">` + kkBig({ lid: 0.1, px: 0.6, m: 'grit', brow: 'angry' }) + `</g>`; }
  if (id === 'hiu') { const z = 1 + 0.08 * easeOut(prog(t, 0, 0.4)); return cam(z, 135, 260, hiuBig({ lid: 0.55, px: 0.6, py: 0.4, m: 'smirk' })); }
  if (id === 'ejek') { const laugh = Math.abs(Math.sin(T * 16)) * 3; return kkBig({ lid: 0.98, m: 'grin', dy: -laugh }); }
  if (id === 'oh') {
    const push = easeOut(prog(t, 0.9, 0.5));
    return marketDayA() + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bob('cb'), 2.0) + ground('#8E5D36') + `<g transform="translate(${(60 * push).toFixed(1)} 0)">${X.plate(90, 452, 0.95)}${cumiKering(102, 436, 0.75, 70)}${cumiKering(128, 438, 0.75, 100)}</g>`;
  }
  if (id === 'endus') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    const sn = [0, 1, 2].map(k => { const o = ((t * 1.3 + k * 0.33) % 1); return t < 1.0 ? `<path d="M${210 - o * 120} ${300 - k * 14} q10 -6 18 0 q8 6 18 0" stroke="#B5803E" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 250, hiuBig({ lid: wow ? 0 : 0.98, pr: wow ? 2 : undefined, px: 0.2, m: wow ? 'o' : 'flat', tear: t > 1.6 }) + sn + (wow ? star(36, 150, 8 * sp) + star(230, 170, 7 * sp) : ''));
  }
  if (id === 'kaget') { const sp = Math.min(1, t * 4); return kkBig({ lid: 0, pr: 2, px: 0.5, m: 'o', brow: 'up', sweat: true }) + star(40, 160, 7 * sp) + star(228, 176, 6 * sp); }
  if (id === 'borong') {
    return marketDayA() + karungCumi(150, 300, 1.4) + karungCumi(196, 262, 1.0, 8) + place(hiuA({ lid: blink(T) ? 1 : 0.3, px: 0.5, m: mouthOf(sh, T, 'hiu', 'smirk') }), -10, 200 + bob('hiu'), 1.3, { w: 140, flip: true }) + ground('#B48A5E');
  }
  if (id === 'oren') {
    const walk = easeOut(prog(t, 0, 0.6)), x = 35 + (1 - walk) * 220;
    return marketDayA() + place(KO({ lid: 0.5, m: mouthOf(sh, T, 'ko', 'flat') }), x, 140 + bob('ko'), 2.0) + shades(x, 140 + bob('ko'), 2.0) + ground('#B48A5E');
  }
  if (id === 'tantang') {
    const z = 1 + 0.05 * easeOut(prog(t, 0, sh.dur));
    let s = `<g><clipPath id="cl"><rect width="135" height="480"/></clipPath><g clip-path="url(#cl)">${marketDayA()}${place(hiuA({ lid: 0.5, px: 0.8, m: mouthOf(sh, T, 'hiu', 'teeth') }), -60, 170 + bob('hiu'), 1.5, { w: 140, flip: true })}</g></g>`;
    s += `<g><clipPath id="cr"><rect x="135" width="135" height="480"/></clipPath><g clip-path="url(#cr)"><rect x="135" width="135" height="480" fill="#F7DFA8"/>${place(KO({ lid: 0.5, px: -0.8, m: 'frown' }), 150, 160, 1.4)}${shades(150, 160, 1.4)}</g></g>`;
    s += `<path d="M135 0 L135 480" stroke="#FFFFFF" stroke-width="4"/>` + ground('#B48A5E');
    return cam(z, 135, 240, s);
  }
  if (id === 'curi') {
    const tip = Math.sin(T * 6) * 3, sly = Math.sin(T * 5) > 0 ? -0.9 : 0.9;
    return marketDayA() + `<rect width="270" height="480" fill="#0A0814" opacity="0.45"/>` + place(KK({ lid: 0.55, px: talking(sh, T, 'kakap') ? 0.4 : sly, m: mouthOf(sh, T, 'kakap', 'smirk'), chain: true }), 30, 200 + tip, 1.3, { w: 140, flip: true }) +
      karungCumi(4, 176 + tip, 1.25, 14) + ground('#2A2236');
  }
  if (id === 'end') {
    const z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6);
    let s = marketDayA() + `<rect width="270" height="480" fill="#0A0814" opacity="0.62"/>` + counterA();
    s += [0, 1, 2, 3, 4, 5].map(k => `<path d="M${120 + k * 26} ${360 + k * 6} q8 -3 16 0" stroke="#7A5A30" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>`).join('');
    s += `<text x="135" y="270" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="54" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.5 * glow).toFixed(2)}">?</text>`;
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s1e5 = [s1e5Scene, ep3Overlay]; TITLES.s1e5 = 'Cumi yang Terhina..';

// ================= S2E3 — Juragan Menyamar: Juragan di Gerbang (gaya A, sitcom deadpan) =================
const helmTeri = `<g transform="translate(6 -6) scale(0.72)"><path d="M34 24 Q36 -8 66 -8 Q96 -8 98 24 Z" fill="#F5C542" stroke="#161616" stroke-width="2.6"/><ellipse cx="66" cy="24" rx="38" ry="5" fill="#F2B520" stroke="#161616" stroke-width="2.4"/><path d="M66 -8 L66 22" stroke="#D99A10" stroke-width="3"/></g>`;
const kakapCaping = o => KK({ chain: false, ...o }) + `<g transform="translate(18 -8) scale(0.95)">${capingSvg}</g>`;
function gudang100A() { // gerbang gudang No. 100, malam
  return gerbangA() + `<rect x="60" y="184" width="150" height="26" rx="5" fill="#7A4A2A" stroke="#161616" stroke-width="2"/><text x="135" y="201.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#FFF4E6">GUDANG IKAN ASIN No. 100</text>` +
    `<rect width="270" height="480" fill="#0A0814" opacity="0.6"/><circle cx="214" cy="150" r="15" fill="#F4F1DE" opacity="0.85"/>`;
}
function s2e3Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = `<rect y="402" width="270" height="78" fill="#C9B48A" stroke="#161616" stroke-width="2"/>`;
  const mandorClose = (o, extra = '') => gerbangA() + place(mandor({ ...o, lid: blink(T) && o.lid < 0.9 ? 1 : o.lid, m: mouthOf(sh, T, 'kakap', o.m) }), -30, 150 + (o.dy || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + extra + ground;
  if (id === 'ampun') {
    const rock = Math.abs(Math.sin(T * 7)) * 6;
    return gerbangA() + place(kuli({ lid: blink(T) ? 1 : 0.5, px: -0.7, m: 'flat' }), 186, 206, 0.8) + karungA(196, 318, 'TERI', 0.8) +
      place(TN({ lid: 0.1, pr: 2, px: 0.6, m: 'o', brow: 'up' }), -6, 176, 1.1, { w: 120, flip: true }) +
      place(mandor({ lid: 0.6, px: 0.9, py: 0.6, m: mouthOf(sh, T, 'kakap', 'frown'), sweat: true }), 62, 210 + rock + bob('kakap'), 0.95, { w: 140, rot: 35, cx: 70, cy: 120 });
  }
  if (id === 'bingung') {
    const q = `<text x="200" y="${150 + Math.sin(T * 5) * 4}" font-family="Liberation Sans" font-weight="bold" font-size="40" fill="#161616" stroke="#FFFFFF" stroke-width="2" paint-order="stroke">?</text>`;
    return gerbangA() + place(TN({ lid: blink(T) ? 1 : 0.2, px: 0.5, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), 15, 180 + bob('teri'), 1.75, { w: 120, flip: true }) + q + ground;
  }
  if (id === 'usir') {
    const lunge = Math.sin(Math.PI * prog(t, 0.0, 0.4)) * 16;
    return gerbangA() + place(kuli({ lid: blink(T) ? 1 : 0.45, px: -0.8, m: 'flat' }), 150, 200, 1.0) + karungA(170, 300, 'TERI', 1.0) +
      place(mandor({ lid: blink(T) ? 1 : 0.1, px: -0.3, m: mouthOf(sh, T, 'kakap', 'grit'), brow: 'angry' }), 4 + lunge, 236 + bob('kakap'), 1.05, { w: 140, flip: true });
  }
  if (id === 'rak') {
    const lineEnd = sh.lines[0].end - sh.start, put = easeOut(prog(t, lineEnd - 0.2, 0.3));
    return gerbangA() + rakA(176, 214) + place(kuli({ lid: blink(T) ? 1 : 0.5, px: 0.7, m: mouthOf(sh, T, 'cj', 'flat') }), 40, 130 + bob('cj'), 1.5) +
      karungA(182, 300 - put * 54, 'TERI', 0.95) + ground;
  }
  if (id === 'telp') return mandorClose({ lid: 0.55, px: 0.5, m: 'smile' }, L.phone(212, 300, 1.6, -8));
  if (id === 'jawab') {
    const k = prog(t, 0, sh.dur);
    return mandorClose({ lid: 0.2 - k * 0.2, px: 0.7, m: k > 0.6 ? 'o' : 'frown', sweat: k > 0.4, brow: k > 0.6 ? 'up' : undefined }, L.phone(212, 300, 1.6, -8));
  }
  if (id === 'loh') {
    const turn = easeOut(prog(t, 0.0, 0.6)), shock = t > 0.5, sp = shock ? Math.min(1, (t - 0.5) * 4) : 0;
    const z = 1 + 0.1 * easeOutBack(prog(t, 0.5, 0.3));
    const stars = shock ? star(40, 140, 7 * sp) + star(200, 120, 6 * sp) + star(50, 300, 5 * sp) : '';
    return cam(z, 135, 240, gerbangA() + place(kuli({ lid: 0.5, px: -0.6, m: 'flat' }), 160, 200, 1.0) + karungA(176, 300, 'TERI', 0.95) +
      place(mandor({ lid: shock ? 0 : 0.4, pr: shock ? 2 : undefined, px: -0.2 - turn * 0.7, m: mouthOf(sh, T, 'kakap', shock ? 'o' : 'frown'), brow: shock ? 'up' : undefined, sweat: true }), -10, 210 + bob('kakap'), 1.2, { w: 140, flip: true }) + L.phone(120, 300, 1.2, -8)) + stars;
  }
  if (id === 'buka') {
    const lift = easeOut(prog(t, 0.0, 0.6));
    const cap = place(capingSvg, 35 + lift * 120, 130 - lift * 90, 2.0, { rot: lift * 40, cx: 50, cy: 0 });
    const gleam = t > 0.5 ? star(135, 340, 8 * (0.6 + 0.4 * Math.sin(T * 8))) : '';
    return gerbangA() + place(CJ({ hat: false, lid: blink(T) ? 1 : 0.35, px: 0, m: mouthOf(sh, T, 'cj', 'flat') }), 35, 130 + bob('cj'), 2.0) + cap + gleam;
  }
  if (id === 'putus') {
    const l2 = sh.lines[1], teriTalk = T >= l2.start - 0.05, swap = easeOut(prog(T, sh.lines[0].start + 0.8, 0.5));
    return gerbangA() + place(CJ({ hat: false, lid: blink(T) ? 1 : 0.35, px: -0.4, m: mouthOf(sh, T, 'cj', 'flat') }), 150, 196, 1.0) +
      place(TN({ lid: teriTalk ? 0 : 0.3, pr: teriTalk ? 2 : undefined, px: 0.6, m: mouthOf(sh, T, 'teri', teriTalk ? 'o' : 'flat'), brow: 'up' }) + (swap > 0.5 ? helmTeri : ''), 10, 186 + bob('teri'), 1.0, { w: 120, flip: true }) +
      place((swap > 0.5 ? kakapCaping : mandor)({ lid: 0.6, px: 0.2, m: 'frown', sweat: true }), 40, 418 + Math.abs(Math.sin(T * 9)) * 2, 0.7, { w: 140, flip: true }) + karungA(160, 420, 'TERI', 0.8);
  }
  if (id === 'bisik') {
    const sly = Math.sin(T * 5) > 0 ? -0.9 : 0.9;
    return gudangA() + stacks() + `<rect width="270" height="480" fill="#0A0814" opacity="0.55"/>` +
      place(kakapCaping({ lid: 0.55, px: talking(sh, T, 'kakap') ? 0.4 : sly, m: mouthOf(sh, T, 'kakap', 'smirk') }), -30, 150 + bob('kakap'), 1.95, { w: 140, flip: true }) +
      L.phone(212, 300, 1.6, -8) + `<rect y="402" width="270" height="78" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  }
  if (id === 'end') {
    const z = 1 + 0.09 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6);
    return cam(z, 135, 240, gudang100A() +
      `<text x="135" y="305" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="48" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.5 * glow).toFixed(2)}">?</text>`);
  }
  return '';
}
SCENES.s2e3 = [s2e3Scene, ep3Overlay]; TITLES.s2e3 = 'Juragan Menyamar..';

// ================= S3E3 — Mertua Cumi Jumbo: Anak Siapa? (gaya A, sitcom deadpan) =================
const piringCumi = (x, y, s = 1, steamT = 0) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="46" ry="12" fill="#FFFFFF" stroke="#161616" stroke-width="2"/><ellipse cx="0" cy="-1" rx="34" ry="7" fill="#EDEDED"/></g>` + cumiKering(x - 16 * s, y - 14 * s, 0.9 * s, -60) + cumiKering(x + 4 * s, y - 16 * s, 0.9 * s, -80) + cumiKering(x + 20 * s, y - 12 * s, 0.85 * s, -100) +
  [0, 1].map(k => { const o = ((steamT * 0.7 + k * 0.5) % 1); return `<path d="M${x - 8 + k * 18} ${y - 24 * s - o * 20} q-5 -8 0 -16" stroke="#B5803E" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="${(0.8 * (1 - o)).toFixed(2)}"/>`; }).join('');
const fotoDermaga = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-30" width="80" height="60" fill="#C9A04A" stroke="#161616" stroke-width="2.4"/><rect x="-33" y="-23" width="66" height="46" fill="#E9D3A6" stroke="#161616" stroke-width="1.2"/><rect x="-33" y="6" width="66" height="17" fill="#7FA9C9"/><path d="M-33 6 L33 6" stroke="#5A3A22" stroke-width="3"/>${[-24, -8, 8, 24].map(d => `<path d="M${d} 6 L${d} 16" stroke="#5A3A22" stroke-width="2"/>`).join('')}<circle cx="-10" cy="-6" r="7" fill="#8C6A4A" stroke="#161616" stroke-width="1"/><path d="M-16 -10 L-10 -18 L-4 -10 Z" fill="#D9B26A" stroke="#161616" stroke-width="0.8"/><circle cx="12" cy="-5" r="7.5" fill="#B5673A" stroke="#161616" stroke-width="1"/><path d="M-6 4 L28 4" stroke="#C8553D" stroke-width="1.6" stroke-dasharray="3 2"/></g>`;
function s3e3Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const papaBig = (o, extra = '', bg = ruangMakanA()) => bg + place(papa({ ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 - (o.up || 0) + bob('cj'), 2.0) + meja() + extra;
  const kkBig = o => ruangMakanA() + place(chefKakap({ ...o, lid: blink(T) && (o.lid ?? 0.3) < 0.9 ? 1 : (o.lid ?? 0.3), m: mouthOf(sh, T, 'kakap', o.m || 'smirk') }), -30, 170 - (o.up || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + meja();
  if (id === 'bentak') {
    const shake = t > 0.0 && t < 0.4 ? Math.sin(T * 70) * 2.4 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + ruangMakanA() + place(TN({ lid: t > 0.1 ? 0 : 0.35, pr: t > 0.1 ? 2 : undefined, px: -0.5, m: 'o', sweat: true }), 160, 276, 0.9, { w: 120 }) +
      place(papa({ lid: blink(T) ? 1 : 0.1, px: 0.7, m: mouthOf(sh, T, 'cj', 'grit'), brow: 'angry' }), 4, 180 + bob('cj'), 1.32) + meja() + (t < 0.6 ? star(60, 396, 7) + star(140, 392, 6) : '') + `</g>`;
  }
  if (id === 'jawab') return ruangMakanA() + place(TN({ lid: blink(T) ? 1 : 0.45, px: -0.2, py: 0.4, m: mouthOf(sh, T, 'teri', 'frown'), sweat: true }), 70, 238 + bob('teri'), 1.7, { w: 120 }) + meja();
  if (id === 'ejek') { const slide = 1 - easeOut(prog(t, 0, 0.3)); const laugh = Math.abs(Math.sin(T * 16)) * 3 * (t > 0.3 ? 1 : 0); return `<g transform="translate(${(slide * 220).toFixed(1)} 0)">` + kkBig({ lid: laugh ? 0.98 : 0.5, px: 0.5, m: talking(sh, T, 'kakap') ? 'grin' : 'smirk', up: laugh }) + `</g>`; }
  if (id === 'mimpi') return papaBig({ lid: 0.55, px: -0.4, m: 'smirk' });
  if (id === 'bela') return ruangMakanA() + place(CB({ lid: blink(T) ? 1 : 0.3, px: 0.6, m: mouthOf(sh, T, 'cb', 'frown'), brow: 'angry' }), 35, 135 + bob('cb'), 2.0) + meja();
  if (id === 'sodor') {
    const slide = easeOut(prog(t, 0.2, 0.9));
    return ruangMakanA() + place(papa({ lid: blink(T) ? 1 : 0.6, px: 0.7, m: 'frown' }), 0, 196, 1.2) +
      place(TN({ lid: blink(T, 1) ? 1 : 0.45, px: -0.4, m: mouthOf(sh, T, 'teri', 'flat') }), 150, 276 + bob('teri'), 1.0, { w: 120 }) + `<rect x="60" y="352" width="150" height="10" rx="3" fill="#8E5D36" stroke="#161616" stroke-width="1.8"/>` + piringCumi(200 - slide * 70, 350, 1.4, t);
  }
  if (id === 'endus') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 1.0 ? `<path d="M${118 - o * 10} ${330 - o * 40 - k * 10} q6 -6 0 -12 q-6 -6 0 -12" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 250, ruangMakanA() + place(papa({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, py: wow ? 0 : 0.5, m: mouthOf(sh, T, 'cj', wow ? 'o' : 'flat') }), 35, 140 + bob('cj'), 2.0) + meja() + piringCumi(135, 424, 1.5, t) + sn +
      (wow ? star(36, 160, 8 * sp) + star(228, 176, 7 * sp) + star(214, 300, 5 * sp) : ''));
  }
  if (id === 'kakap') {
    const drop = easeOut(prog(t, 0.2, 0.4)), sp = Math.min(1, t * 4);
    return ruangMakanA() + place(chefKakap({ lid: 0, pr: 2, px: 0.6, m: mouthOf(sh, T, 'kakap', 'o'), brow: 'up', sweat: true }), 10, 170 + bob('kakap'), 1.6, { w: 140, flip: true }) +
      meja() + spoon(206, 300 + drop * 100, -30 + drop * 80) + star(40, 170, 7 * sp) + star(236, 190, 6 * sp);
  }
  if (id === 'dermaga') {
    const shake = talking(sh, T, 'cj') ? Math.sin(T * 30) * 1.0 : 0, z = 1 + 0.05 * easeOut(prog(t, 0, sh.dur));
    const bg = ruangMakanA().replace(/<rect x="24" y="112"[\s\S]*?fill="#D99A5E"\/>/, '') + fotoDermaga(62, 150, 1.0);
    return cam(z, 135, 240, `<g transform="translate(${shake.toFixed(2)} 0)">` + bg + place(papa({ lid: blink(T) ? 1 : 0.15, px: -0.5, m: mouthOf(sh, T, 'cj', 'grit'), brow: 'angry', sweat: true }), 90, 196 + bob('cj'), 1.45) + meja() + `</g>`);
  }
  if (id === 'kenal') return ruangMakanA() + place(CB({ lid: blink(T) ? 1 : 0.1, pr: 2, px: 0.5, m: mouthOf(sh, T, 'cb', 'o'), brow: 'sad' }), 35, 135 + bob('cb'), 2.0) + meja();
  if (id === 'larang') {
        return ruangMakanA() + `<rect x="196" y="150" width="66" height="190" fill="#2A1414" stroke="#161616" stroke-width="2.4"/><circle cx="208" cy="250" r="3" fill="#F5C542" stroke="#161616" stroke-width="1"/>` +
      place(TN({ lid: 0.6, px: 0.6, m: 'frown', sweat: true }), 186, 290, 0.7, { w: 120 }) +
      place(papa({ lid: blink(T) ? 1 : 0.25, px: 0.9, m: mouthOf(sh, T, 'cj', 'frown'), brow: 'angry' }), -10, 170 + bob('cj'), 1.45) +
      meja();
  }
  if (id === 'end') {
    const z = 1 + 0.08 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6), open = easeOut(prog(t, 1.0, 1.0));
    const knock = [0.1, 0.4, 0.7].some(k => t > k && t < k + 0.12) ? 1 : 0;
    let s = `<rect width="270" height="480" fill="#12100F"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 32}" y="0" width="14" height="480" fill="#1A1614"/>`).join('')}<rect y="340" width="270" height="140" fill="#1E1A18"/>`;
    s += `<rect x="70" y="110" width="130" height="240" fill="#0B0A12" stroke="#000" stroke-width="3"/>`;
    s += `<g opacity="${(0.25 + 0.75 * open).toFixed(2)}"><path d="M98 140 L135 104 L172 140 Q135 150 98 140 Z" fill="#2A2420" stroke="#000" stroke-width="2"/><circle cx="135" cy="168" r="28" fill="#050505"/><path d="M92 350 Q90 210 135 196 Q180 210 178 350 Z" fill="#050505"/>`;
    s += `<circle cx="124" cy="166" r="4.5" fill="#FFE14D" opacity="${(glow * open).toFixed(2)}"/><circle cx="146" cy="166" r="4.5" fill="#FFE14D" opacity="${(glow * open).toFixed(2)}"/></g>`;
    s += `<rect x="70" y="110" width="${(130 - open * 96).toFixed(1)}" height="240" fill="#5A2E22" stroke="#000" stroke-width="3"/><circle cx="${(190 - open * 96).toFixed(1)}" cy="236" r="3.5" fill="#F5C542" stroke="#000" stroke-width="1"/>`;
    if (knock) s += `<path d="M206 200 l14 -6 M208 214 l16 0 M206 228 l14 6" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/>`;
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s3e3 = [s3e3Scene, ep3Overlay]; TITLES.s3e3 = 'Mertua Cumi Jumbo..';

// ================= S1E6 — Cumi yang Terhina: Duel di Dermaga (gaya A, sitcom deadpan) =================
function dermagaA(T = 0, { pier = true, dusk = false } = {}) { // dermaga siang: langit, laut, lantai papan
  let s = `<rect width="270" height="480" fill="${dusk ? '#F2A36B' : '#BFE3F0'}"/><circle cx="214" cy="${dusk ? 214 : 74}" r="22" fill="${dusk ? '#FF7A3D' : '#FFE07A'}" stroke="#161616" stroke-width="2"/>`;
  s += `<rect y="228" width="270" height="252" fill="${dusk ? '#2E5E86' : '#3C8DC0'}" stroke="#161616" stroke-width="2"/>`;
  s += [0, 1, 2, 3].map(k => `<path d="M-30 ${246 + k * 22} ${Array.from({ length: 12 }, (_, j) => `q13.5 ${j % 2 ? 5 : -5} 27 0`).join(' ')}" transform="translate(${(-((T * 12 + k * 11) % 27)).toFixed(1)} 0)" stroke="${dusk ? '#4F84AE' : '#7CC0E6'}" stroke-width="2" fill="none"/>`).join('');
  if (pier) {
    s += `<g stroke="#161616" stroke-width="2">${[18, 96, 174, 250].map(x => `<rect x="${x}" y="300" width="10" height="60" fill="#5A3A22"/>`).join('')}</g>`;
    s += `<rect y="330" width="270" height="150" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>${[352, 378, 404, 430, 456].map(y => `<path d="M0 ${y} L270 ${y}" stroke="#7A5232" stroke-width="1.6"/>`).join('')}`;
    s += `<rect x="20" y="276" width="70" height="20" rx="4" fill="#7A4A2A" stroke="#161616" stroke-width="1.8"/><text x="55" y="290" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="9" fill="#FFF4E6">DERMAGA</text>`;
  }
  return s;
}
const jemuranCumi = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><g stroke="#161616" stroke-width="2"><rect x="0" y="0" width="6" height="70" fill="#7A4A2A"/><rect x="104" y="0" width="6" height="70" fill="#7A4A2A"/></g><path d="M0 8 L110 8 M0 36 L110 36" stroke="#7A4A2A" stroke-width="2.4"/></g>` +
  [0, 1].map(r => [0, 1, 2, 3, 4].map(k => cumiKering(x + (14 + k * 20) * s, y + (20 + r * 28) * s, 0.55 * s, 0)).join('')).join('');
const perahuA = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 -8 L70 -8 Q60 26 -56 26 Z" fill="#C8553D" stroke="#161616" stroke-width="2.4" stroke-linejoin="round"/><path d="M-66 0 L66 0" stroke="#F4EBDD" stroke-width="4"/><text x="0" y="19" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="9" fill="#FFF4E6">KAKAP 1</text></g>`;
const dayung = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot.toFixed(1)})"><rect x="-2.5" y="-40" width="5" height="70" fill="#8E5D36" stroke="#161616" stroke-width="1.6"/><ellipse cx="0" cy="36" rx="7" ry="12" fill="#8E5D36" stroke="#161616" stroke-width="1.6"/></g>`;
const aromaUap = (t, x0, y0, n = 3, dx = 1) => [...Array(n).keys()].map(k => { const o = ((t * 1.2 + k / n) % 1); return `<path d="M${(x0 + dx * o * 90).toFixed(1)} ${(y0 - k * 14 - o * 10).toFixed(1)} q8 -6 16 0 q8 6 16 0" stroke="#B5803E" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${(0.9 * (1 - o)).toFixed(2)}"/>`; }).join('');
function s1e6Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>`;
  const hiuBig = (o, extra = '') => dermagaA(T) + place(hiuA({ ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'hiu', o.m || 'flat') }), -40, 150 + bob('hiu'), 1.95, { w: 140, flip: true }) + extra + ground;
  const wind = [0, 1, 2].map(k => { const x = ((T * 260 + k * 110) % 380) - 60; return `<path d="M${x.toFixed(1)} ${200 + k * 34} l40 0 q10 0 10 -8" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>`; }).join('');
  if (id === 'tatap') {
    const z = 1 + 0.06 * easeOut(prog(t, 0, sh.dur));
    return cam(z, 135, 280, dermagaA(T) + place(hiuA({ lid: 0.55, px: 0.9, m: 'frown' }), 0, 196, 1.05, { w: 140, flip: true }) +
      place(KO({ lid: 0.5, px: -0.8, m: 'frown' }), 156, 176, 1.05) + shades(156, 176, 1.05) + wind);
  }
  if (id === 'syarat') return hiuBig({ lid: 0.5, px: 0.7, m: talking(sh, T, 'hiu') ? mouthOf(sh, T, 'hiu', 'teeth') : 'teeth' }, wind);
  if (id === 'setuju') {
    const z = 1 + 0.05 * easeOut(prog(T, sh.lines[0].start, 0.3));
    return cam(z, 135, 240, dermagaA(T) + place(KO({ lid: 0.5, m: mouthOf(sh, T, 'ko', 'flat') }), 35, 140 + bob('ko'), 2.0) + shades(35, 140 + bob('ko'), 2.0) + ground);
  }
  if (id === 'perahu') {
    const away = easeOut(prog(t, 0, sh.dur)), bx = 120 + away * 40, by = 262, rock = Math.sin(T * 3) * 3;
    const laugh = talking(sh, T, 'kakap') ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    const second = T >= sh.lines[1].start - 0.1;
    return dermagaA(T, { pier: false }) + `<rect x="-10" y="300" width="80" height="180" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>` +
      `<g transform="rotate(${rock.toFixed(1)} ${bx} ${by})">` + place(KK({ lid: second ? 0.45 : 0.98, px: -0.5, m: mouthOf(sh, T, 'kakap', second ? 'smirk' : 'grin'), chain: true }), bx - 70, by - 120 - laugh + bob('kakap'), 1.0, { w: 140 }) +
      karungCumi(bx + 4, by - 44, 0.8, 10) + dayung(bx - 50, by - 20, -30 + Math.sin(T * 4) * 20) + perahuA(bx, by, 1.0) + `</g>` +
      `<path d="M${bx - 80} ${by + 30} q20 -6 40 0 q20 6 40 0 q20 -6 40 0 q20 6 40 0" stroke="#FFFFFF" stroke-width="2.4" fill="none"/>`;
  }
  if (id === 'oh') return dermagaA(T) + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bob('cb'), 2.0) + ground;
  if (id === 'teri') {
    const slide = 1 - easeOut(prog(t, 0, 0.4)), pant = Math.abs(Math.sin(T * 9)) * 3, gx = 30 + slide * 240;
    return dermagaA(T) + jemuranCumi(140, 252, 1.0) + aromaUap(t, 150, 250, 3) +
      place(teriChef({ lid: blink(T) ? 1 : 0.15, px: 0.3, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), gx - 30, 160 - pant + bob('teri'), 1.35, { w: 120, flip: true }) +
      `<g transform="translate(${gx + 80} -40)"><rect x="0" y="330" width="96" height="40" fill="#8E5D36" stroke="#161616" stroke-width="2"/><circle cx="18" cy="376" r="10" fill="#4A4F57" stroke="#161616" stroke-width="2"/><circle cx="78" cy="376" r="10" fill="#4A4F57" stroke="#161616" stroke-width="2"/></g>` +
      karungCumi(gx + 82, 256, 0.7) + karungCumi(gx + 130, 260, 0.6, 8) + karungCumi(gx + 104, 232, 0.6, -6) + L.sweatDrop(gx + 4, 170, 1.4);
  }
  if (id === 'loh') {
    const wow = t > 0.85, z = 1 + 0.08 * easeOut(prog(t, 0.85, 0.25)), sp = wow ? Math.min(1, (t - 0.85) * 4) : 0;
    const sn = t < 0.85 ? aromaUap(t, 250, 300, 3, -1) : '';
    return cam(z, 135, 250, hiuBig({ lid: wow ? 0 : 0.98, pr: wow ? 2 : undefined, px: 0.2, m: wow ? mouthOf(sh, T, 'hiu', 'o') : 'flat', sweat: wow }, sn) + (wow ? star(36, 150, 8 * sp) + star(230, 170, 7 * sp) : ''));
  }
  if (id === 'rebut') {
    const tug = Math.sin(T * 7) * 10, second = T >= sh.lines[1].start - 0.1;
    return dermagaA(T) + karungA(196, 300, 'CUMI', 0.8) + karungA(214, 276, 'CUMI', 0.7) + karungA(0, 300, 'CUMI', 0.8) +
      place(hiuA({ lid: blink(T) ? 1 : 0.2, px: 0.9, m: mouthOf(sh, T, 'hiu', 'grit'), brow: 'angry' }), -30 + tug, 196 + bob('hiu'), 1.05, { w: 140, flip: true }) +
      place(KO({ lid: second ? 0.5 : 0.6, px: -0.8, m: mouthOf(sh, T, 'ko', 'flat') }), 150 + tug, 174 + bob('ko'), 1.0) + shades(150 + tug, 174 + bob('ko'), 1.0) +
      karungA(100 + tug, 276, 'CUMI', 1.0) + (t > sh.dur - 0.6 ? star(135, 260, 8) : '');
  }
  if (id === 'goyang') {
    const rk = Math.sin(T * (4 + t * 2)) * (2 + t * 3), bx = 135, by = 330;
    const shock = T >= sh.lines[0].end - 1.1;
    return dermagaA(T, { pier: false, dusk: true }) + `<g transform="rotate(${rk.toFixed(1)} ${bx} ${by})">` +
      place(KK({ lid: shock ? 0 : 0.6, pr: shock ? 2 : undefined, px: shock ? 0.6 : -0.3, m: mouthOf(sh, T, 'kakap', shock ? 'o' : 'smile'), chain: true, sweat: shock }), bx - 105, by - 190 + bob('kakap'), 1.5, { w: 140 }) +
      karungCumi(bx + 10, by - 58, 1.0, 6) + perahuA(bx, by, 1.4) + `</g>` + aromaUap(t, 150, 270, 2) + `<rect width="270" height="480" fill="#1A0E20" opacity="0.18"/>`;
  }
  if (id === 'end') {
    const rise = easeOut(prog(t, 0.2, 2.2)), z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur)), glow = 0.6 + 0.4 * Math.sin(T * 6), rk = Math.sin(T * 5) * 4;
    let s = `<rect width="270" height="480" fill="#04101C"/><rect width="270" height="120" fill="#1D4A6B"/><path d="M0 120 ${Array.from({ length: 10 }, (_, j) => `q13.5 ${j % 2 ? 4 : -4} 27 0`).join(' ')}" stroke="#4F84AE" stroke-width="2" fill="none"/>`;
    s += `<g transform="rotate(${rk.toFixed(1)} 135 112)"><path d="M85 104 L185 104 Q178 126 95 126 Z" fill="#0B0A12" stroke="#000" stroke-width="2"/></g>`;
    s += [0, 1, 2, 3].map(k => { const o = (t * 0.5 + k / 4) % 1; return `<circle cx="${100 + k * 22}" cy="${(330 - o * 200).toFixed(1)}" r="${2 + k % 2}" fill="none" stroke="#4F84AE" stroke-width="1.2" opacity="${(1 - o).toFixed(2)}"/>`; }).join('');
    const sy = 480 - rise * 210;
    s += `<ellipse cx="135" cy="${sy.toFixed(1)}" rx="150" ry="80" fill="#0A1A28"/><path d="M-10 ${(sy - 10).toFixed(1)} L-40 ${(sy - 60).toFixed(1)} L-30 ${(sy + 20).toFixed(1)} Z" fill="#0A1A28"/>`;
    s += `<circle cx="96" cy="${(sy - 30).toFixed(1)}" r="7" fill="#FFE14D" opacity="${(glow * rise).toFixed(2)}"/><circle cx="174" cy="${(sy - 30).toFixed(1)}" r="7" fill="#FFE14D" opacity="${(glow * rise).toFixed(2)}"/>`;
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s1e6 = [s1e6Scene, ep3Overlay]; TITLES.s1e6 = 'Cumi yang Terhina..';

// ================= S2E4 — Juragan Menyamar: Gudang Nomor Seratus (gaya A, sitcom deadpan) =================
const teriMandor = o => TN({ blangkon: false, ...o }) + helmTeri;
const gembokA = (x, y, open = 0) => `<g transform="translate(${x} ${y})"><path d="M-9 0 L-9 ${-12 - open * 8} Q-9 ${-22 - open * 8} 0 ${-22 - open * 8} Q9 ${-22 - open * 8} 9 ${-12 - open * 8} L9 ${-6 - open * 8}" stroke="#9AA3AD" stroke-width="4" fill="none"/><rect x="-13" y="0" width="26" height="22" rx="3" fill="#F5C542" stroke="#161616" stroke-width="2"/><circle cx="0" cy="10" r="3" fill="#161616"/></g>`;
const senterBeam = (x, y, a = 1) => `<path d="M${x} ${y} L${x - 210} ${y - 80} L${x - 210} ${y + 90} Z" fill="#FFF6B0" opacity="${(0.32 * a).toFixed(2)}"/>`;
function dalam100A() { // dalam gudang No. 100, malam, rak karung cumi
  let s = gudangA() + `<rect x="30" y="100" width="110" height="26" rx="5" fill="#7A4A2A" stroke="#161616" stroke-width="2"/><text x="85" y="117.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10.5" fill="#FFF4E6">GUDANG No. 100</text>`;
  s += rakA(170, 250) + karungA(176, 236, 'CUMI', 0.95) + karungA(176, 280, 'CUMI', 0.95) + karungA(-10, 300, 'CUMI') + karungA(-4, 262, 'CUMI');
  return s + `<rect width="270" height="480" fill="#0A0814" opacity="0.5"/>`;
}
const karungBuka = (x, y, sc, t) => karungA(x, y, 'CUMI', sc) + cumiKering(x + 26 * sc, y - 4 * sc, 0.8 * sc, -70) + cumiKering(x + 40 * sc, y - 6 * sc, 0.8 * sc, -95) +
  [0, 1].map(k => { const o = ((t * 0.8 + k * 0.5) % 1); return `<path d="M${x + 25 * sc + k * 20} ${y - 18 * sc - o * 26} q-6 -8 0 -16 q6 -8 0 -16" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(0.85 * (1 - o)).toFixed(2)}"/>`; }).join('');
function trukA(x, y, door = 0) {
  return `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="150" height="90" fill="#3D4A5C" stroke="#161616" stroke-width="2.4"/><rect x="150" y="26" width="58" height="64" rx="6" fill="#52627A" stroke="#161616" stroke-width="2.4"/><rect x="164" y="34" width="34" height="24" fill="#22303F" stroke="#161616" stroke-width="1.6"/>` +
    `<rect x="${4 + door * -40}" y="4" width="70" height="82" fill="#2C3746" stroke="#161616" stroke-width="2"/><circle cx="40" cy="98" r="14" fill="#1A1A1A" stroke="#161616" stroke-width="2"/><circle cx="180" cy="98" r="14" fill="#1A1A1A" stroke="#161616" stroke-width="2"/><circle cx="206" cy="74" r="6" fill="#FFF3A0" stroke="#161616" stroke-width="1.4"/></g>`;
}
function s2e4Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const groundN = `<rect y="402" width="270" height="78" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  if (id === 'gembok') {
    const op = easeOut(prog(t, sh.dur - 1.0, 0.3));
    return gudang100A() + place(kakapCaping({ lid: blink(T) ? 1 : 0.55, px: talking(sh, T, 'kakap') ? 0.4 : (Math.sin(T * 5) > 0 ? -0.9 : 0.9), m: mouthOf(sh, T, 'kakap', 'smirk') }), -30, 150 + bob('kakap'), 1.95, { w: 140, flip: true }) +
      L.phone(212, 300, 1.6, -8) + gembokA(246, 324, op) + groundN;
  }
  if (id === 'senter') {
    const on = easeOut(prog(t, 0, 0.25));
    return gudang100A() + `<path d="M196 262 L270 200 L270 340 Z" fill="#FFF6B0" opacity="${(0.4 * on).toFixed(2)}"/>` + place(teriMandor({ lid: blink(T) ? 1 : 0.1, px: 0.5, m: mouthOf(sh, T, 'teri', 'frown'), brow: 'angry' }), 0, 196 + bob('teri'), 1.6, { w: 120, flip: true }) +
      `<rect x="176" y="254" width="28" height="14" rx="3" fill="#C8553D" stroke="#161616" stroke-width="1.6"/>` + groundN;
  }
  if (id === 'ejek') {
    const laugh = !talking(sh, T, 'kakap') && t > 0.4 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return gudang100A() + senterBeam(300, 260, 0.6) + place(kakapCaping({ lid: laugh ? 0.98 : 0.5, px: 0.5, m: mouthOf(sh, T, 'kakap', 'grin') }), -30, 150 - laugh + bob('kakap'), 1.95, { w: 140, flip: true }) + groundN;
  }
  if (id === 'bela') return dalam100A() + place(teriMandor({ lid: blink(T) ? 1 : 0.35, px: -0.5, m: mouthOf(sh, T, 'teri', 'flat') }), 30, 196 + bob('teri'), 1.6, { w: 120 }) + groundN;
  if (id === 'muncul') {
    const fade = easeOut(prog(t, 0.0, 0.9));
    return dalam100A() + `<g opacity="${fade.toFixed(2)}">` + place(CJ({ hat: false, lid: blink(T) ? 1 : 0.4, px: 0, m: mouthOf(sh, T, 'cj', 'flat') }), 35, 140 + (1 - fade) * 30 + bob('cj'), 2.0) + `</g>` +
      (t > 0.6 ? star(135, 340, 8 * (0.6 + 0.4 * Math.sin(T * 8))) : '');
  }
  if (id === 'endus') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    return cam(z, 135, 250, dalam100A() + place(kakapCaping({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, px: 0.3, py: wow ? 0 : 0.6, m: mouthOf(sh, T, 'kakap', wow ? 'o' : 'flat'), brow: wow ? 'up' : undefined, sweat: wow }), -20, 150 + bob('kakap'), 1.8, { w: 140, flip: true }) +
      groundN + karungBuka(168, 318, 1.0, t) + (wow ? star(40, 150, 8 * sp) + star(226, 170, 7 * sp) + star(214, 300, 5 * sp) : ''));
  }
  if (id === 'antre') {
    const l2 = sh.lines[1], cjTalk = T >= l2.start - 0.05;
    return dalam100A() + place(teriMandor({ lid: blink(T) ? 1 : (cjTalk ? 0.3 : 0), pr: cjTalk ? undefined : 2, px: 0.6, m: mouthOf(sh, T, 'teri', cjTalk ? 'flat' : 'o'), brow: cjTalk ? undefined : 'up' }), 4, 206 + bob('teri'), 1.0, { w: 120, flip: true }) +
      place(CJ({ hat: false, lid: blink(T, 1) ? 1 : 0.4, px: -0.5, m: mouthOf(sh, T, 'cj', 'flat') }), 140, 186 + bob('cj'), 1.05) + groundN;
  }
  if (id === 'truk') {
    const lights = easeOut(prog(t, 0, 0.5)), point = Math.sin(Math.PI * prog(t, 0.8, 0.4)) * 6;
    return gudang100A() + `<path d="M270 300 L20 220 L20 420 Z" fill="#FFF6B0" opacity="${(0.35 * lights).toFixed(2)}"/>` + place(trukA(0, 0), 150, 260, 0.9) +
      place(kakapCaping({ lid: blink(T) ? 1 : 0.2, px: 0.9, m: mouthOf(sh, T, 'kakap', 'grin') }), 0 + point, 210 + bob('kakap'), 1.15, { w: 140 }) + groundN;
  }
  if (id === 'kenal') return gudang100A() + `<path d="M270 300 L20 220 L20 420 Z" fill="#FFF6B0" opacity="0.25"/>` + place(CJ({ hat: false, lid: blink(T) ? 1 : 0.55, px: 0.7, m: mouthOf(sh, T, 'cj', 'flat') }), 35, 140 + bob('cj'), 2.0) + groundN;
  if (id === 'end') {
    const z = 1 + 0.12 * easeOut(prog(t, 0, sh.dur)), door = easeOut(prog(t, 0.3, 1.2)), step = easeOut(prog(t, 1.4, 1.2));
    const sil = `<g opacity="${step.toFixed(2)}"><g transform="translate(${88 - step * 30} ${236 + step * 20}) scale(0.95)"><path d="M50 2 C72 2 86 40 85 84 Q50 100 15 84 C14 40 28 2 50 2 Z" fill="#0E0B14" stroke="#000" stroke-width="2"/>${capingSvg}</g></g>`;
    return cam(z, 120, 300, gudang100A() + `<path d="M270 300 L20 220 L20 420 Z" fill="#FFF6B0" opacity="0.2"/>` + place(trukA(0, 0, door), 60, 250, 0.95) + sil + groundN +
      `<text x="135" y="232" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="40" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.4 * Math.sin(T * 6)).toFixed(2)}">?</text>`);
  }
  return '';
}
SCENES.s2e4 = [s2e4Scene, ep3Overlay]; TITLES.s2e4 = 'Juragan Menyamar..';

// ================= S3E4 — Mertua Cumi Jumbo: Tamu Tengah Malam (gaya A, sitcom deadpan) =================
// Tokoh baru: Bapak Teri ("Teri Besar") — teri tua, sisik lebih abu, kumis & alis putih, caping, memikul karung cumi asin.
const bapakTeri = (o = {}, { karung = true } = {}) => (karung ? `<g transform="translate(52 -6) rotate(8) scale(0.55)">${karungA(0, 0, 'CUMI', 1)}</g>` : '') +
  TN({ blangkon: false, ...o }).replace(/#DCE5EC/g, '#BAC4CC').replace(/#AFC0CE/g, '#94A3B0') +
  `<path d="M17 14 Q26 10 35 14" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M17 14 Q26 10 35 14" stroke="#161616" stroke-width="0.6" fill="none"/>` +
  `<path d="M6 33 Q12 29 20 32 Q14 37 6 33 Z" fill="#FFFFFF" stroke="#161616" stroke-width="1.1"/>` +
  `<g transform="translate(-4 4) scale(0.62)">${capingSvg}</g>`;
function pintuDepanA(open = 1) { // pintu depan rumah juragan, malam
  let s = `<rect width="270" height="480" fill="#3E1E1E"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 32}" y="0" width="14" height="480" fill="#4A2424"/>`).join('')}<rect y="350" width="270" height="130" fill="#2A1A14" stroke="#161616" stroke-width="2"/>`;
  s += `<rect x="110" y="96" width="140" height="256" fill="#0E1A30" stroke="#161616" stroke-width="3"/><circle cx="214" cy="128" r="9" fill="#FFF1B8"/>${[[136, 120], [180, 150], [232, 170], [150, 190]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#FFF1B8"/>`).join('')}`;
  s += `<rect x="110" y="96" width="${(140 * (1 - open)).toFixed(1)}" height="256" fill="#5A2E22" stroke="#161616" stroke-width="3"/>`;
  return s;
}
const surat = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-34 -44 L34 -44 L34 44 L-34 44 Z" fill="#E9D3A6" stroke="#161616" stroke-width="2"/><path d="M-34 -44 L-28 -38 L-34 -30 M34 30 L28 38 L34 44" stroke="#C9A46A" stroke-width="1.4" fill="none"/>${[-30, -20, -10, 0, 10].map(d => `<path d="M-24 ${d} L${d % 20 ? 20 : 24} ${d}" stroke="#8C6A4A" stroke-width="1.6"/>`).join('')}<text x="8" y="32" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="11" fill="#2A3A6A" transform="rotate(-8 8 32)">Jumbo</text><path d="M-14 36 Q8 30 30 34" stroke="#2A3A6A" stroke-width="1.4" fill="none"/></g>`;
function s3e4Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const lidOf = (o, d = 0.3) => blink(T) && (o.lid ?? d) < 0.9 ? 1 : (o.lid ?? d);
  const papaBig = (o, extra = '') => ruangMakanA() + place(papa({ ...o, lid: lidOf(o), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 - (o.up || 0) + bob('cj'), 2.0) + meja() + extra;
  const kkBig = o => ruangMakanA() + place(chefKakap({ ...o, lid: lidOf(o), m: mouthOf(sh, T, 'kakap', o.m || 'smirk') }), -30, 170 - (o.up || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + meja();
  const btBig = (o, bg = ruangMakanA(), extra = '', karung = true) => bg + place(bapakTeri({ ...o, lid: lidOf(o, 0.5), m: mouthOf(sh, T, 'bt', o.m || 'flat') }, { karung }), 54, 236 + bob('bt'), 1.75, { w: 120 }) + extra;
  if (id === 'pintu') {
    const open = easeOut(prog(t, 0.35, 0.5)), knock = [0.0, 0.3].some(k => t > k && t < k + 0.12) ? 1 : 0;
    let s = pintuDepanA(open);
    s += `<g opacity="${(0.3 + 0.7 * open).toFixed(2)}">` + place(bapakTeri({ lid: 0.5, px: -0.6, m: 'flat' }), 150, 230, 0.95, { w: 120 }) + `</g>`;
    if (knock) s += `<path d="M246 200 l12 -6 M248 214 l14 0 M246 228 l12 6" stroke="#F5C542" stroke-width="3" stroke-linecap="round"/>`;
    s += place(papa({ lid: open > 0.5 ? 0 : 0.4, pr: open > 0.5 ? 2 : undefined, px: 0.9, m: mouthOf(sh, T, 'cj', open > 0.5 ? 'o' : 'flat'), brow: open > 0.5 ? 'up' : undefined, sweat: open > 0.5 }), -10, 196 + bob('cj'), 1.3);
    return cam(1 + 0.05 * easeOut(prog(t, 0.4, 0.3)), 135, 240, s);
  }
  if (id === 'tamu') return btBig({ lid: 0.5, px: -0.2, m: 'flat' }, pintuDepanA(1));
  if (id === 'ejek') { const slide = 1 - easeOut(prog(t, 0, 0.3)); const laugh = Math.abs(Math.sin(T * 16)) * 3 * (t > 0.3 ? 1 : 0); return `<g transform="translate(${(slide * 220).toFixed(1)} 0)">` + kkBig({ lid: laugh ? 0.98 : 0.5, px: 0.5, m: talking(sh, T, 'kakap') ? 'grin' : 'smirk', up: laugh }) + `</g>`; }
  if (id === 'modal') return papaBig({ lid: 0.6, px: -0.5, m: 'smirk' });
  if (id === 'mohon') return ruangMakanA() + place(CB({ lid: lidOf({}, 0.25), px: 0.6, m: mouthOf(sh, T, 'cb', 'frown'), brow: 'sad' }), 35, 135 + bob('cb'), 2.0) + meja();
  if (id === 'buka') {
    const drop = easeOut(prog(t, 0.0, 0.3));
    return ruangMakanA() + place(bapakTeri({ lid: lidOf({}, 0.6), px: 0.3, py: 0.4, m: mouthOf(sh, T, 'bt', 'frown'), brow: 'sad' }, { karung: false }), 120, 250 + bob('bt'), 1.15, { w: 120 }) +
      place(papa({ lid: lidOf({}, 0.6), px: 0.8, m: 'frown' }), -6, 200, 1.15) + meja() + karungBuka(70, 296 + (1 - drop) * -50, 1.3, t);
  }
  if (id === 'endus') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 1.0 ? `<path d="M${118 - o * 10} ${330 - o * 40 - k * 10} q6 -6 0 -12 q-6 -6 0 -12" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    return cam(z, 135, 250, ruangMakanA() + place(papa({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, py: wow ? 0 : 0.5, m: mouthOf(sh, T, 'cj', wow ? 'o' : 'flat') }), 35, 140 + bob('cj'), 2.0) + meja() + karungBuka(150, 300, 1.1, t) + sn +
      (wow ? star(36, 160, 8 * sp) + star(228, 176, 7 * sp) + star(214, 300, 5 * sp) : ''));
  }
  if (id === 'kakap') {
    const drop = easeOut(prog(t, 0.2, 0.4)), sp = Math.min(1, t * 4);
    return ruangMakanA() + place(chefKakap({ lid: 0, pr: 2, px: 0.6, m: mouthOf(sh, T, 'kakap', 'o'), brow: 'up', sweat: true }), 10, 170 + bob('kakap'), 1.6, { w: 140, flip: true }) +
      meja() + spoon(206, 300 + drop * 100, -30 + drop * 80) + star(40, 170, 7 * sp) + star(236, 190, 6 * sp);
  }
  if (id === 'pulang') {
    const z = 1 + 0.05 * easeOut(prog(t, 0, sh.dur));
    const bg = ruangMakanA().replace(/<rect x="24" y="112"[\s\S]*?fill="#D99A5E"\/>/, '') + fotoDermaga(62, 150, 1.0);
    return cam(z, 135, 240, bg + place(bapakTeri({ lid: lidOf({}, 0.55), px: -0.3, m: mouthOf(sh, T, 'bt', 'frown'), brow: 'sad' }, { karung: false }), 70, 250 + bob('bt'), 1.6, { w: 120 }) + meja());
  }
  if (id === 'pergi') return ruangMakanA() + place(CB({ lid: lidOf({}, 0.1), pr: 2, px: 0.5, m: mouthOf(sh, T, 'cb', 'o'), brow: 'sad' }), 35, 135 + bob('cb'), 2.0) + meja();
  if (id === 'cukup') {
    const hit = t > 0.15 && t < 0.55, shake = hit ? Math.sin(T * 70) * 2.4 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + papaBig({ lid: 0.1, px: 0, m: 'grit', brow: 'angry', sweat: true }, hit ? star(50, 396, 7) + star(220, 392, 6) : '') + `</g>`;
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur)), pull = easeOut(prog(t, 0.6, 1.0)), glow = 0.85 + 0.15 * Math.sin(T * 4);
    let s = ruangMakanA() + meja() + `<rect width="270" height="480" fill="#08060A" opacity="0.78"/>`;
    s += `<path d="M135 0 L60 480 L210 480 Z" fill="#FFF1B8" opacity="${(0.16 * glow).toFixed(2)}"/>`;
    s += karungA(150, 300, 'CUMI', 1.2);
    s += place(TN({ blangkon: false, lid: 0, pr: 2, px: 0.4, py: 0.6, m: 'o', sweat: true }), 20, 250, 1.25, { w: 120 });
    s += surat(150 - pull * 20, 330 - pull * 80, 0.7 + pull * 0.5, 18 - pull * 22);
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s3e4 = [s3e4Scene, ep3Overlay]; TITLES.s3e4 = 'Mertua Cumi Jumbo..';

// ================= S1E7 — Cumi yang Terhina: Penghuni Laut Dalam (gaya A, sitcom deadpan) =================
const GUR = '#7A3E8C', GUR2 = '#5E2C6E';
function tentakel(x0, y0, x1, y1, bend = 40, w = 16, T = 0) { // tentakel tebal bergaris, pakai lingkaran isap
  const mx = (x0 + x1) / 2 + bend + Math.sin(T * 3) * 6, my = (y0 + y1) / 2 - Math.abs(bend) * 0.4;
  const d = `M${x0} ${y0} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1} ${y1}`;
  let s = `<path d="${d}" stroke="#161616" stroke-width="${w + 4.4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${GUR}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  for (let k = 1; k < 6; k++) { const u = k / 6, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1; s += `<circle cx="${x.toFixed(1)}" cy="${(y + w * 0.18).toFixed(1)}" r="${(w * 0.17 * (1.2 - u * 0.5)).toFixed(1)}" fill="#E7B6EF" stroke="#161616" stroke-width="1"/>`; }
  return s;
}
function guritaA(cx, cy, s = 1, o = {}) { // kepala Penghuni Laut Dalam, mata piring
  const { lid = 0.3, px = 0, py = 0, m = 'flat' } = o;
  let g = `<path d="M-90 40 Q-100 -90 0 -96 Q100 -90 90 40 Z" fill="${GUR}" stroke="#161616" stroke-width="3"/>`;
  g += [[-50, -50, 9], [40, -64, 7], [60, -20, 6], [-20, -78, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GUR2}"/>`).join('');
  g += L.eye(-36, 0, 24, { side: -1, lid, px, py, skin: GUR, lw: 3, pr: 7 }) + L.eye(36, 0, 24, { side: 1, lid, px, py, skin: GUR, lw: 3, pr: 7 });
  g += m === 'o' ? `<ellipse cx="0" cy="40" rx="10" ry="${o.open || 8}" fill="#3A1414" stroke="#161616" stroke-width="2.4"/>` : `<path d="M-12 40 L12 40" stroke="#161616" stroke-width="3" stroke-linecap="round"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">${g}</g>`;
}
const karungKempis = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 20 Q4 8 20 10 L60 10 Q76 8 76 20 L74 30 Q38 36 2 30 Z" fill="#D8C49A" stroke="#161616" stroke-width="2"/><text x="38" y="26" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="8" fill="#6B4A22">CUMI</text></g>`;
const tetes = (T, x, y, n = 3) => [...Array(n).keys()].map(k => { const o = (T * 1.6 + k / n) % 1; return L.sweatDrop(x + k * 34, y + o * 60, 1.1).replace('<path', `<path opacity="${(1 - o).toFixed(2)}"`); }).join('');
function s1e7Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>`;
  if (id === 'angkat') {
    const up = easeOut(prog(t, 0.2, 2.2)), bx = 135, by = 300 - up * 40, rk = Math.sin(T * 6) * (2 + up * 4);
    let s = dermagaA(T, { pier: false, dusk: true });
    s += `<ellipse cx="135" cy="448" rx="130" ry="34" fill="#1E3E5C" opacity="0.85"/>`;
    s += `<circle cx="100" cy="440" r="8" fill="#FFE14D" stroke="#161616" stroke-width="1.5" opacity="${(0.4 + 0.6 * up).toFixed(2)}"/><circle cx="170" cy="440" r="8" fill="#FFE14D" stroke="#161616" stroke-width="1.5" opacity="${(0.4 + 0.6 * up).toFixed(2)}"/>`;
    s += `<g transform="rotate(${rk.toFixed(1)} ${bx} ${by})">` + place(KK({ lid: 0, pr: 2, px: 0.4, m: 'o', chain: true, sweat: true }), bx - 105, by - 165, 1.5, { w: 140 }) + karungCumi(bx + 10, by - 58, 1.0, 6) + perahuA(bx, by, 1.4) + `</g>`;
    s += [0, 1, 2, 3].map(k => `<path d="M${40 + k * 60} ${(by + 34).toFixed(1)} q8 -10 16 0" stroke="#FFFFFF" stroke-width="2.4" fill="none"/>`).join('');
    return cam(1 + 0.05 * up, 135, 260, s);
  }
  if (id === 'tarik') {
    const pull = easeOut(prog(t, 0.3, 1.8)), fall = prog(t, 2.6, 0.5), bx = 135, by = 300;
    let s = dermagaA(T, { pier: false, dusk: true });
    const kx = 150 + pull * 30, ky = 240 - pull * 80;
    s += tentakel(262, 470, kx + 40, ky + 30, -50, 20, T);
    s += karungCumi(kx, ky, 1.0, 20 + pull * 30);
    s += `<g transform="rotate(${(Math.sin(T * 9) * 6).toFixed(1)} ${bx} ${by})">` + place(KK({ lid: blink(T) ? 1 : 0, pr: 2, px: 0.8, m: mouthOf(sh, T, 'kakap', 'o'), chain: true, sweat: true }), bx - 130, by - 165 + fall * 160 + bob('kakap'), 1.5, { w: 140 }) + perahuA(bx - 30, by, 1.4) + `</g>`;
    if (fall > 0) s += `<path d="M40 ${330} q20 -40 40 -10 q20 -50 40 0 q20 -40 40 10" stroke="#FFFFFF" stroke-width="3" fill="#BFE3F0" opacity="${fall.toFixed(2)}"/>`;
    return s + `<rect width="270" height="480" fill="#1A0E20" opacity="0.15"/>`;
  }
  if (id === 'basah') {
    const second = T >= sh.lines[1].start - 0.1, shake = Math.sin(T * 30) * (second ? 0 : 1.5);
    return dermagaA(T) + place(KK({ lid: second ? 0.45 : 0.2, px: -0.6, m: mouthOf(sh, T, 'kakap', second ? 'smirk' : 'frown'), chain: true, brow: second ? undefined : 'angry' }), 40 + shake, 130 + bob('kakap'), 1.6, { w: 140 }) +
      `<path d="M40 160 q-6 -14 6 -18 M200 150 q8 -12 -2 -18" stroke="#8FD0F5" stroke-width="3" fill="none" stroke-linecap="round"/>` + tetes(T, 80, 170) + `<ellipse cx="140" cy="398" rx="90" ry="8" fill="#5FA8D3" opacity="0.7"/>` + ground;
  }
  if (id === 'oh') return dermagaA(T) + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bob('cb'), 2.0) + ground;
  if (id === 'karung') {
    const reach = easeOut(prog(t, 0, 0.6)), drop = prog(t, 0.5, 0.2), back = easeOut(prog(t, 1.4, 0.8));
    const tx = 250 - reach * 80 + back * 80, ty = 300 - reach * 40 + back * 120;
    let s = dermagaA(T) + karungA(0, 300, 'CUMI', 0.8) + karungA(10, 272, 'CUMI', 0.7);
    s += place(teriChef({ lid: blink(T) ? 1 : 0.1, pr: 2, px: 0.7, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), -10, 130 + bob('teri'), 1.4, { w: 120 });
    s += karungKempis(150, 290 - (1 - drop) * 50, 1.3);
    if (back < 1) s += tentakel(300, 470, tx, ty, -40, 18, T);
    return s;
  }
  if (id === 'loh') {
    const wow = t > 0.65, z = 1 + 0.08 * easeOut(prog(t, 0.65, 0.25)), sp = wow ? Math.min(1, (t - 0.65) * 4) : 0, sh8 = wow ? Math.sin(T * 40) * 1.5 : 0;
    const eyes = `<circle cx="214" cy="232" r="8" fill="#FFE14D" opacity="${(0.5 + 0.5 * Math.sin(T * 5)).toFixed(2)}" stroke="#161616" stroke-width="1.5"/><circle cx="250" cy="232" r="8" fill="#FFE14D" opacity="${(0.5 + 0.5 * Math.sin(T * 5)).toFixed(2)}" stroke="#161616" stroke-width="1.5"/><path d="M194 244 Q232 218 270 244" stroke="#5E2C6E" stroke-width="6" fill="none"/>`;
    return cam(z, 135, 250, dermagaA(T) + eyes + place(hiuA({ lid: wow ? 0 : 0.98, pr: wow ? 2 : undefined, px: 0.6, m: wow ? mouthOf(sh, T, 'hiu', 'o') : 'flat', sweat: wow }), -40 + sh8, 150 + bob('hiu'), 1.95, { w: 140, flip: true }) + ground + (wow ? star(30, 150, 8 * sp) : ''));
  }
  if (id === 'teri2') return dermagaA(T) + karungKempis(160, 296, 1.2) + aromaUap(t, 180, 300, 3) + place(teriChef({ lid: blink(T) ? 1 : 0.55, px: 0.6, py: 0.6, m: mouthOf(sh, T, 'teri', 'flat') }), 10, 130 + bob('teri'), 1.6, { w: 120 }) + ground;
  if (id === 'jaga') {
    const second = T >= sh.lines[1].start - 0.1, creep = easeOut(prog(t, 0, sh.dur));
    let s = dermagaA(T);
    s += [0, 1, 2].map(r => [0, 1, 2, 3].map(k => karungA(150 + k * 30 - r * 10, 340 - r * 24, r === 0 ? 'CUMI' : '', 0.55)).join('')).join('');
    s += tentakel(290, 300, 250 - creep * 30, 420 - creep * 20, 30, 14, T) + tentakel(-20, 300, 20 + creep * 30, 440, -30, 14, T + 1);
    s += place(hiuA({ lid: second ? 0.1 : 0.3, px: 0.8, m: mouthOf(sh, T, 'hiu', 'frown'), sweat: true }), 0, 214 + Math.sin(T * 30) * 1.2 + bob('hiu'), 0.9, { w: 140, flip: true });
    s += place(KO({ lid: 0.55, px: -0.6, m: mouthOf(sh, T, 'ko', 'flat') }), 80, 180 + bob('ko'), 1.25) + shades(80, 180 + bob('ko'), 1.25);
    return s;
  }
  if (id === 'maju') {
    const rise = easeOut(prog(t, 0, sh.dur)), cx = 135 - t * 6;
    let s = `<rect width="270" height="480" fill="#7E8C9A"/><rect y="228" width="270" height="252" fill="#2E5E86" stroke="#161616" stroke-width="2"/>`;
    s += guritaA(150, 260 - rise * 50, 1.05, { lid: 0.35, px: -0.2, py: 0.5 });
    s += `<rect y="300" width="270" height="20" fill="#2E5E86"/><rect y="330" width="270" height="150" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>`;
    s += `<g transform="translate(${cx + 60} 270) scale(0.75)"><ellipse cx="0" cy="40" rx="32" ry="40" fill="#F2D3B0" stroke="#161616" stroke-width="2.4"/>${[-18, -6, 6, 18].map(d => `<path d="M${d} 74 Q${d * 1.3} 96 ${d} 108" stroke="#C9965A" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
    return s;
  }
  if (id === 'end') {
    const z = 1 + 0.12 * easeOut(prog(t, 0, sh.dur)), open = t > sh.dur - 1.8 ? 3 + Math.min(8, (t - (sh.dur - 1.8)) * 10) : 0;
    let s = `<rect width="270" height="480" fill="#56606C"/><rect y="300" width="270" height="180" fill="#244A6C"/>`;
    s += guritaA(110, 200, 1.15, { lid: blink(T) ? 1 : 0.15, px: 0.1, py: 0.8, m: open ? 'o' : 'flat', open });
    s += `<rect y="360" width="270" height="120" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>`;
    s += place(CB({ lid: 0.62, px: -0.7, py: -0.6, m: 'flat', blush: false, brow: 'low' }), 168, 196, 0.72);
    return cam(z, 135, 240, s + `<rect width="270" height="480" fill="#0A0A1A" opacity="0.2"/>`);
  }
  return '';
}
SCENES.s1e7 = [s1e7Scene, ep3Overlay]; TITLES.s1e7 = 'Cumi yang Terhina..';

// ================= S2E5 — Juragan Menyamar: Caping Kembar (gaya A, sitcom deadpan) =================
const hiuCaping = (o, lift = 0) => hiuA(o) + `<g transform="translate(${14 + lift * 40} ${-30 - lift * 30}) rotate(${(lift * -25).toFixed(1)} 50 0)">${capingSvg}</g>`;
const lampuTruk = (a = 0.3) => `<path d="M270 300 L20 220 L20 420 Z" fill="#FFF6B0" opacity="${a.toFixed(2)}"/>`;
function deretGudangA(T, open = 1) { // deretan gudang malam, pintu terbuka, banyak lampu truk
  let s = `<rect width="270" height="480" fill="#141226"/><circle cx="220" cy="80" r="13" fill="#F4F1DE" opacity="0.85"/>`;
  [[-20, 210, 0.8, 99], [70, 200, 0.85, 98], [160, 210, 0.8, 97]].forEach(([x, y, k, n]) => {
    s += `<g transform="translate(${x} ${y}) scale(${k})"><rect x="0" y="40" width="120" height="110" fill="#5A4E46" stroke="#000" stroke-width="2.4"/><path d="M-8 42 L60 0 L128 42 Z" fill="#3E2F24" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<rect x="34" y="${70}" width="52" height="80" fill="#0B0A12" stroke="#000" stroke-width="2"/><rect x="${34 - open * 30}" y="70" width="26" height="80" fill="#6B4A2A" stroke="#000" stroke-width="1.8"/><rect x="${60 + open * 30}" y="70" width="26" height="80" fill="#6B4A2A" stroke="#000" stroke-width="1.8"/>` +
      `<rect x="30" y="48" width="60" height="16" rx="3" fill="#7A4A2A" stroke="#000" stroke-width="1.4"/><text x="60" y="60" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#FFF4E6">No. ${n}</text></g>`;
  });
  s += `<rect y="330" width="270" height="150" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  [[30, 360], [110, 372], [190, 360], [250, 380]].forEach(([x, y], k) => { const g = 0.6 + 0.4 * Math.sin(T * 5 + k); s += `<circle cx="${x}" cy="${y}" r="9" fill="#FFF3A0" opacity="${g.toFixed(2)}" stroke="#161616" stroke-width="1.4"/><circle cx="${x + 22}" cy="${y}" r="9" fill="#FFF3A0" opacity="${g.toFixed(2)}" stroke="#161616" stroke-width="1.4"/><path d="M${x - 10} ${y} L${x - 60} ${y - 40} L${x + 80} ${y - 40} L${x + 32} ${y} Z" fill="#FFF6B0" opacity="0.12"/>`; });
  return s;
}
function s2e5Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const groundN = `<rect y="402" width="270" height="78" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  const bg = () => gudang100A() + lampuTruk(0.25);
  const hiuBig = (o, extra = '', dy = 0) => bg() + place(hiuA({ ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'hiu', o.m || 'flat') }), -40, 150 + dy + bob('hiu'), 1.95, { w: 140, flip: true }) + extra + groundN;
  const cjBig = (o, extra = '') => bg() + place(CJ({ hat: false, ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 + bob('cj'), 2.0) + groundN + extra;
  if (id === 'caping') {
    const lift = easeOut(prog(t, 0.9, 0.8)), z = 1 + 0.06 * easeOut(prog(t, 0, sh.dur));
    return cam(z, 135, 240, bg() + place(trukA(0, 0, 1), 150, 250, 0.9) + place(hiuCaping({ lid: blink(T) ? 1 : 0.45, px: 0.3, m: mouthOf(sh, T, 'hiu', 'smirk') }, lift), -10, 236 + bob('hiu'), 1.4, { w: 140, flip: true }) + groundN);
  }
  if (id === 'kenalkan') {
    const point = Math.sin(Math.PI * prog(t, 0.2, 0.5)) * 8;
    return bg() + place(trukA(0, 0, 1), 170, 236, 0.75) + place(hiuA({ lid: blink(T, 1) ? 1 : 0.45, px: -0.6, m: 'smirk' }), 130, 236, 0.95) +
      place(kakapCaping({ lid: blink(T) ? 1 : 0.2, px: 0.9, m: mouthOf(sh, T, 'kakap', 'grin') }), -6 + point, 250 + bob('kakap'), 0.95, { w: 140, flip: true }) + groundN;
  }
  if (id === 'ejek') return hiuBig({ lid: 0.5, px: 0.5, m: 'smirk' }, '', 20);
  if (id === 'pakan') {
    const laugh = !talking(sh, T, 'kakap') && t > 0.3 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return bg() + place(kakapCaping({ lid: laugh ? 0.98 : 0.45, px: 0.6, m: mouthOf(sh, T, 'kakap', 'grin') }), -30, 160 - laugh + bob('kakap'), 1.85, { w: 140, flip: true }) + groundN + karungCumi(186, 296, 1.0, 6);
  }
  if (id === 'cium') {
    const slide = easeOut(prog(t, 0.1, 0.5));
    return cjBig({ lid: 0.45, px: 0.6, m: 'flat' }, karungBuka(160 + (1 - slide) * 120, 300, 1.1, t));
  }
  if (id === 'endus') {
    const wow = t > 1.0, z = 1 + 0.08 * easeOut(prog(t, 1.0, 0.25)), sp = wow ? Math.min(1, (t - 1.0) * 4) : 0;
    return cam(z, 135, 250, bg() + place(hiuA({ lid: wow ? 0 : (t > 0.5 ? 0.98 : 0.6), pr: wow ? 2 : undefined, px: 0.4, py: wow ? 0 : 0.6, m: mouthOf(sh, T, 'hiu', wow ? 'o' : 'flat'), tear: wow, sweat: wow }), -40, 170 + bob('hiu'), 1.85, { w: 140, flip: true }) +
      groundN + karungBuka(186, 300, 0.95, t) + (wow ? star(40, 150, 8 * sp) + star(226, 160, 7 * sp) + star(220, 300, 5 * sp) : ''));
  }
  if (id === 'nangis') {
    const sob = Math.abs(Math.sin(T * 9)) * 2;
    return bg() + place(hiuA({ lid: 0.7, px: 0.6, py: 0.6, m: 'frown', tear: true }), 120, 214 - sob, 0.95) +
      place(teriMandor({ lid: blink(T) ? 1 : 0, pr: 2, px: 0.8, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up' }), -6, 236 + bob('teri'), 1.25, { w: 120, flip: true }) + groundN;
  }
  if (id === 'resep') return cjBig({ lid: 0.5, px: 0.3, m: 'flat' }, place(capingSvg, -6, 300, 0.7) + place(capingSvg, 206, 300, 0.7));
  if (id === 'angkut') {
    const shake = t < 0.4 ? Math.sin(T * 70) * 2 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + hiuBig({ lid: 0.1, px: 0.9, m: 'grit', brow: 'angry', sweat: true }, '', 20) + `</g>`;
  }
  if (id === 'jual') return cjBig({ lid: 0.55, px: 0.7, m: 'flat' });
  if (id === 'telp') {
    const buzz = t < 0.9 ? Math.sin(T * 50) * 1.5 : 0;
    return bg() + place(teriMandor({ lid: t > 0.9 ? 0 : 0.3, pr: t > 0.9 ? 2 : undefined, px: 0.6, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: t > 0.9 }), 0, 196 + bob('teri'), 1.6, { w: 120, flip: true }) + L.phone(212 + buzz, 300, 1.6, -8) + groundN;
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur)), open = easeOut(prog(t, 0.2, 1.4));
    return cam(z, 135, 260, deretGudangA(T, open));
  }
  return '';
}
SCENES.s2e5 = [s2e5Scene, ep3Overlay]; TITLES.s2e5 = 'Juragan Menyamar..';

// ================= S3E5 — Mertua Cumi Jumbo: Surat di Dasar Karung (gaya A, sitcom deadpan) =================
const suratBesar = (T) => { // close-up surat lama, tulisan tangan
  let s = `<rect width="270" height="480" fill="#2A1414"/><rect width="270" height="480" fill="#08060A" opacity="0.35"/>`;
  s += `<g transform="rotate(-3 135 200)"><path d="M34 104 L236 110 L232 300 L38 294 Z" fill="#E9D3A6" stroke="#161616" stroke-width="2.6"/><path d="M34 104 L48 118 L36 134 M232 282 L218 290 L232 300" stroke="#C9A46A" stroke-width="1.6" fill="none"/>`;
  s += `<circle cx="200" cy="140" r="16" fill="#D8BC86" opacity="0.7"/><circle cx="76" cy="266" r="12" fill="#D8BC86" opacity="0.6"/>`;
  const rows = ['Jemuran cumi asin ini', 'milik kita berdua.', 'Separuh untuk', 'Teri Besar.'];
  s += rows.map((r, i) => `<text x="52" y="${146 + i * 27}" font-family="DejaVu Serif" font-size="13.2" fill="#3A2A1A">${esc(r)}</text>`).join('');
  s += `<text x="182" y="268" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="19" fill="#2A3A6A" transform="rotate(-8 182 268)">Jumbo</text><path d="M146 278 Q182 268 218 274" stroke="#2A3A6A" stroke-width="1.8" fill="none"/></g>`;
  return s;
};
const pagarA = (T) => { // luar pagar rumah juragan, malam
  let s = `<rect width="270" height="480" fill="#100E1C"/><circle cx="210" cy="78" r="12" fill="#F4F1DE" opacity="0.8"/>`;
  s += `<rect y="300" width="270" height="180" fill="#1E1A26" stroke="#161616" stroke-width="2"/>`;
  s += `<path d="M0 214 L270 214 M0 292 L270 292" stroke="#3A3446" stroke-width="5"/>${Array.from({ length: 14 }, (_, i) => `<path d="M${8 + i * 20} 300 L${8 + i * 20} 200 L${4 + i * 20} 192 L${8 + i * 20} 184 L${12 + i * 20} 192 L${8 + i * 20} 200" stroke="#3A3446" stroke-width="4" fill="#3A3446"/>`).join('')}`;
  return s;
};
function s3e5Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const lidOf = (o, d = 0.3) => blink(T) && (o.lid ?? d) < 0.9 ? 1 : (o.lid ?? d);
  const papaBig = (o, extra = '') => ruangMakanA() + place(papa({ ...o, lid: lidOf(o), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 - (o.up || 0) + bob('cj'), 2.0) + meja() + extra;
  const kkBig = (o, extra = '') => ruangMakanA() + place(chefKakap({ ...o, lid: lidOf(o), m: mouthOf(sh, T, 'kakap', o.m || 'smirk') }), -30, 170 - (o.up || 0) + bob('kakap'), 1.95, { w: 140, flip: true }) + meja() + extra;
  if (id === 'surat') {
    const lift = easeOut(prog(t, 0, 0.35)), z = 1 + 0.06 * easeOut(prog(t, 0.2, 0.3));
    let s = ruangMakanA() + `<rect width="270" height="480" fill="#08060A" opacity="0.35"/>` + karungA(170, 310, 'CUMI', 1.2);
    s += place(TN({ blangkon: false, lid: lidOf({}, 0), pr: 2, px: 0.5, py: -0.2, m: mouthOf(sh, T, 'teri', 'o'), sweat: true }), 10, 230 + bob('teri'), 1.5, { w: 120 });
    s += surat(196, 260 - lift * 70, 0.95, 14 - lift * 10) + (t > 0.3 ? star(160, 150, 6) + star(236, 168, 5) : '');
    return cam(z, 135, 240, s + meja());
  }
  if (id === 'bentak') {
    const hit = t > 0.1 && t < 0.45, shake = hit ? Math.sin(T * 70) * 2.4 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + papaBig({ lid: 0.05, px: 0.4, m: 'grit', brow: 'angry', sweat: true }, hit ? star(44, 396, 6) + star(226, 392, 6) : '') + `</g>`;
  }
  if (id === 'rebut') {
    const slide = 1 - easeOut(prog(t, 0, 0.3)), laugh = Math.abs(Math.sin(T * 16)) * 3 * (t > 0.3 ? 1 : 0);
    return `<g transform="translate(${(slide * 220).toFixed(1)} 0)">` + kkBig({ lid: laugh ? 0.98 : 0.5, px: 0.5, m: talking(sh, T, 'kakap') ? 'grin' : 'smirk', up: laugh }, surat(206, 292 - laugh, 0.75, 22) + `<path d="M228 258 q4 -8 0 -14 M236 262 q4 -8 0 -14" stroke="#B5803E" stroke-width="2" fill="none" stroke-linecap="round"/>`) + `</g>`;
  }
  if (id === 'buang') return papaBig({ lid: 0.6, px: -0.5, m: 'smirk' });
  if (id === 'baca') {
    const grab = easeOut(prog(t, 0, 0.3));
    return ruangMakanA() + place(CB({ lid: lidOf({}, 0.2), px: 0.6, m: mouthOf(sh, T, 'cb', 'frown'), brow: 'angry' }), 35, 135 + bob('cb'), 2.0) + meja() + surat(232 - (1 - grab) * -60, 300, 0.75, -10);
  }
  if (id === 'isi') return cam(1 + 0.05 * easeOut(prog(t, 0, sh.dur)), 135, 190, suratBesar(T));
  if (id === 'kakap') {
    const drop = easeOut(prog(t, 0.2, 0.4)), sp = Math.min(1, t * 4);
    return ruangMakanA() + place(chefKakap({ lid: 0, pr: 2, px: 0.6, m: mouthOf(sh, T, 'kakap', 'o'), brow: 'up', sweat: true }), 10, 170 + bob('kakap'), 1.6, { w: 140, flip: true }) +
      meja() + spoon(206, 300 + drop * 100, -30 + drop * 80) + star(40, 170, 7 * sp) + star(236, 190, 6 * sp);
  }
  if (id === 'endus') {
    const wow = t > 0.9, z = 1 + 0.08 * easeOut(prog(t, 0.9, 0.25)), sp = wow ? Math.min(1, (t - 0.9) * 4) : 0;
    const sn = [0, 1].map(k => { const o = ((t * 1.4 + k * 0.5) % 1); return t < 0.9 ? `<path d="M${150 - o * 10} ${330 - o * 40 - k * 10} q6 -6 0 -12 q-6 -6 0 -12" stroke="#B5803E" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${(1 - o).toFixed(2)}"/>` : ''; }).join('');
    const tear = wow ? `<path d="M74 250 Q70 259 74 264 Q78 259 74 250 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.2"/>` : '';
    return cam(z, 135, 250, ruangMakanA() + place(papa({ lid: wow ? 0.35 : (t > 0.4 ? 0.98 : 0.6), py: wow ? 0 : 0.5, m: mouthOf(sh, T, 'cj', wow ? 'o' : 'flat'), brow: wow ? 'sad' : undefined }), 35, 140 + bob('cj'), 2.0) + meja() + surat(160, 340, 0.85, -6) + sn + tear +
      (wow ? star(36, 160, 8 * sp) + star(228, 176, 7 * sp) : ''));
  }
  if (id === 'janji') {
    const z = 1 + 0.05 * easeOut(prog(t, 0, sh.dur));
    const bg = ruangMakanA().replace(/<rect x="24" y="112"[\s\S]*?fill="#D99A5E"\/>/, '') + fotoDermaga(62, 150, 1.0);
    return cam(z, 135, 240, bg + place(bapakTeri({ lid: lidOf({}, 0.55), px: -0.3, m: mouthOf(sh, T, 'bt', 'flat') }, { karung: true }), 70, 250 + bob('bt'), 1.6, { w: 120 }) + meja());
  }
  if (id === 'ragu') return papaBig({ lid: 0.5, px: 0.7, py: 0.4, m: 'frown', brow: 'sad' }, surat(214, 404, 0.6, 8));
  if (id === 'kabur') {
    const grab = easeOut(prog(t, 0, 0.25)), run = easeOut(prog(t, 2.0, 1.0)), hop = Math.abs(Math.sin(T * 14)) * 5 * (t > 2.0 ? 1 : 0);
    let s = ruangMakanA() + place(papa({ lid: lidOf({}, 0), pr: 2, px: 0.8, m: 'o', brow: 'up', sweat: true }), -10, 210, 1.1) + meja();
    s += `<g transform="translate(${(run * 260).toFixed(1)} ${(-hop).toFixed(1)})">` + place(chefKakap({ lid: 0, pr: 2, px: -0.8, m: mouthOf(sh, T, 'kakap', 'grit'), sweat: true }), 100, 220 + bob('kakap'), 1.05, { w: 140, flip: true }) + surat(232, 300, 0.55, 30 - grab * 30) + `</g>`;
    if (t > 2.0) s += `<path d="M${(110 + run * 200).toFixed(0)} 270 l-40 0 M${(110 + run * 200).toFixed(0)} 290 l-56 0 M${(110 + run * 200).toFixed(0)} 310 l-40 0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`;
    return s;
  }
  if (id === 'end') {
    const z = 1 + 0.08 * easeOut(prog(t, 0, sh.dur)), glow = 0.75 + 0.25 * Math.sin(T * 5), run = easeOut(prog(t, 0.2, 1.4));
    let s = pagarA(T);
    s += `<path d="M178 286 L270 220 L270 360 Z" fill="#FFF6B0" opacity="${(0.18 * glow).toFixed(2)}"/>`;
    s += `<g transform="translate(150 196) scale(0.62)">` + trukA(0, 0) + `<circle cx="206" cy="74" r="9" fill="#FFF3A0" opacity="${glow.toFixed(2)}"/><rect x="40" y="26" width="40" height="40" rx="6" fill="#F5C542" stroke="#161616" stroke-width="2"/><text x="60" y="56" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="30" fill="#7A5A10">H</text></g>`;
    s += `<g transform="translate(${(-60 + run * 150).toFixed(1)} 0)"><g fill="#050505" stroke="#000" stroke-width="2"><ellipse cx="60" cy="290" rx="34" ry="22"/><path d="M92 290 L112 274 L108 290 L112 306 Z"/><path d="M40 270 Q52 250 70 268"/></g><circle cx="44" cy="284" r="3.2" fill="#FFE14D" opacity="${glow.toFixed(2)}"/>${surat(66, 258, 0.38, -20)}</g>`;
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s3e5 = [s3e5Scene, ep3Overlay]; TITLES.s3e5 = 'Mertua Cumi Jumbo..';

// ================= S1E8 — Cumi yang Terhina: Kata Pertama (gaya A, sitcom deadpan) =================
function ujungA(T, { dark = 0 } = {}) { // ujung dermaga mendung (lanjutan S1E7 'maju'/'end')
  return `<rect width="270" height="480" fill="#56606C"/><rect y="300" width="270" height="180" fill="#244A6C"/>` +
    [0, 1].map(k => `<path d="M-30 ${316 + k * 20} ${Array.from({ length: 12 }, (_, j) => `q13.5 ${j % 2 ? 5 : -5} 27 0`).join(' ')}" transform="translate(${(-((T * 10 + k * 11) % 27)).toFixed(1)} 0)" stroke="#3E6A90" stroke-width="2" fill="none"/>`).join('') +
    (dark ? `<rect width="270" height="480" fill="#0A0A1A" opacity="${dark}"/>` : '');
}
const papanA = (y = 360) => `<rect y="${y}" width="270" height="${480 - y}" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>${[y + 24, y + 50, y + 76].map(v => `<path d="M0 ${v} L270 ${v}" stroke="#7A5232" stroke-width="1.6"/>`).join('')}`;
const airMata = (T, x, y) => [0, 1].map(k => { const o = (T * 1.3 + k * 0.5) % 1; return `<path d="M${x} ${(y + o * 50).toFixed(1)} q-12 20 0 28 q12 -8 0 -28 Z" fill="#8FD0F5" stroke="#161616" stroke-width="1.4" opacity="${(1 - o * 0.7).toFixed(2)}"/>`; }).join('');
function s1e8Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const ground = `<rect y="402" width="270" height="78" fill="#8E5D36" stroke="#161616" stroke-width="2"/>`;
  const pldMouth = (o = 0) => talking(sh, T, 'pld') ? { m: 'o', open: 4 + amp(sh, T, 'pld') * 9 } : { m: o ? 'o' : 'flat', open: o };
  if (id === 'bicara') {
    const z = 1 + 0.06 * easeOut(prog(t, 0, sh.dur)), shk = t < 0.5 ? Math.sin(T * 60) * 2.5 : 0;
    let s = ujungA(T) + guritaA(110, 200, 1.15, { lid: 0.15, px: 0.1, py: 0.8, ...pldMouth(3) }) + papanA(360);
    s += place(CB({ lid: blink(T) ? 1 : 0.62, px: -0.7, py: -0.6, m: 'flat', blush: false, brow: 'low' }), 168, 196, 0.72);
    return `<g transform="translate(${shk.toFixed(2)} 0)">` + cam(z, 135, 240, s) + `</g>`;
  }
  if (id === 'tunjuk') {
    const slide = 1 - easeOut(prog(t, 0, 0.3));
    return `<g transform="translate(${(-slide * 200).toFixed(1)} 0)">` + dermagaA(T) + place(KK({ lid: 0, pr: 2, px: -0.8, m: mouthOf(sh, T, 'kakap', 'o'), chain: true, sweat: true, brow: 'up' }), 40, 130 + bob('kakap'), 1.6, { w: 140 }) + tetes(T, 80, 170) + ground + `</g>` +
      `<path d="M30 250 l-16 0 M34 266 l-22 0 M30 282 l-16 0" stroke="#161616" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  if (id === 'ejek') {
    const laugh = Math.abs(Math.sin(T * 14)) * 2.5 * (talking(sh, T, 'kakap') ? 1 : 0);
    return dermagaA(T) + karungA(176, 288, 'CUMI', 1.1) + aromaUap(t, 186, 284, 2) + place(KK({ lid: 0.5, px: 0.6, m: mouthOf(sh, T, 'kakap', 'smirk'), chain: true }), 10, 130 - laugh + bob('kakap'), 1.6, { w: 140 }) + tetes(T, 50, 170, 2) + ground;
  }
  if (id === 'bisik') {
    const peek = easeOut(prog(t, 0, 0.5)), tr = Math.sin(T * 32) * 1.3;
    let s = dermagaA(T);
    s += place(hiuA({ lid: 0.1, px: 0.8, m: mouthOf(sh, T, 'hiu', 'frown'), sweat: true }), -60 + peek * 60 + tr, 170 + bob('hiu'), 1.1, { w: 140, flip: true });
    s += place(KO({ lid: 0.55, px: -0.6, m: 'flat' }), 90, 160, 1.4) + shades(90, 160, 1.4);
    return s + ground;
  }
  if (id === 'jemur') return dermagaA(T) + place(CB({ lid: blink(T) ? 1 : 0.62, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 35, 118 + bob('cb'), 2.0) + ground;
  if (id === 'kangen') {
    const wow = t > 0.9, z = 1 + 0.08 * easeOut(prog(t, 0.9, 0.3));
    let s = ujungA(T) + guritaA(135, 215, 1.55, { lid: wow ? 0.45 : 0.98, px: 0, py: 0.4, ...pldMouth() });
    if (!wow) s += aromaUap(t, 70, 420, 3);
    if (wow) s += airMata(T, 79, 254) + airMata(T + 0.4, 191, 254);
    return cam(z, 135, 250, s + papanA(420) + (wow ? star(30, 140, 7 * Math.min(1, (t - 0.9) * 4)) + star(240, 150, 6 * Math.min(1, (t - 0.9) * 4)) : ''));
  }
  if (id === 'loh') {
    const sp = Math.min(1, t * 4), z = 1 + 0.08 * easeOut(prog(t, 0, 0.25));
    return cam(z, 135, 250, dermagaA(T) + place(teriChef({ lid: 0, pr: 2, px: 0.7, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: true }), 0, 150 + bob('teri'), 2.1, { w: 120 }) + ground + star(36, 150, 8 * sp) + star(236, 170, 7 * sp));
  }
  if (id === 'kacamata') {
    const off = easeOut(prog(t, 0.1, 0.5));
    return dermagaA(T) + place(KO({ lid: blink(T) ? 1 : 0.5, px: 0.2, m: mouthOf(sh, T, 'ko', 'flat') }), 20, 120 + bob('ko'), 2.0) + shades(20 + off * 30, 120 - off * 90 + bob('ko'), 2.0) + ground;
  }
  if (id === 'milik') {
    const creep = easeOut(prog(t, 0, sh.dur)), shk = t < 0.4 ? Math.sin(T * 60) * 2 : 0;
    let s = dermagaA(T, { dusk: true }) + guritaA(135, 190, 0.85, { lid: 0.55, px: 0, py: 0.6, ...pldMouth() });
    s += `<rect y="330" width="270" height="150" fill="#A8784A" stroke="#161616" stroke-width="2.2"/>`;
    s += [0, 1, 2].map(r => [0, 1, 2, 3, 4].map(k => karungA(10 + k * 50 - r * 8, 400 - r * 26, r === 0 && k % 2 === 0 ? 'CUMI' : '', 0.62)).join('')).join('');
    s += tentakel(300, 320, 220 - creep * 40, 400, 40, 14, T) + tentakel(-30, 320, 50 + creep * 40, 410, -40, 14, T + 1) + tentakel(140, 300, 130, 360 + creep * 30, 30, 12, T + 2);
    return `<g transform="translate(${shk.toFixed(2)} 0)">` + s + `</g>` + `<rect width="270" height="480" fill="#1A0E20" opacity="0.15"/>`;
  }
  if (id === 'tolak') {
    let s = ujungA(T) + guritaA(135, 150, 1.2, { lid: 0.3, px: 0, py: 1, m: 'flat' }) + papanA(380);
    s += place(CB({ lid: blink(T) ? 1 : 0.62, px: 0, py: -0.9, m: mouthOf(sh, T, 'cb', 'flat'), blush: false, brow: 'low' }), 75, 220 + bob('cb'), 1.3);
    return s;
  }
  if (id === 'teman') {
    const sink = easeOut(prog(t, 1.4, sh.dur - 1.4));
    let s = `<rect width="270" height="480" fill="#56606C"/>` + guritaA(135, 230 + sink * 150, 1.1, { lid: 0.4, px: 0, py: 0.6, ...pldMouth() });
    s += `<rect y="300" width="270" height="180" fill="#244A6C" opacity="0.92"/>` + [0, 1, 2].map(k => `<circle cx="${100 + k * 34}" cy="${(300 - ((T * 40 + k * 20) % 50)).toFixed(1)}" r="${3 + k}" fill="none" stroke="#BFE3F0" stroke-width="1.5"/>`).join('');
    return s + papanA(400);
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur));
    let s = `<rect width="270" height="480" fill="#050B16"/><path d="M0 0 L270 0 L270 60 Q135 90 0 60 Z" fill="#0E2238"/>`;
    const pos = [[60, 130], [190, 110], [120, 210], [30, 260], [230, 230], [100, 290], [170, 250], [140, 140], [40, 180], [220, 300], [120, 270], [70, 230], [200, 190], [250, 270], [20, 300]];
    pos.forEach(([x, y], k) => {
      const o = easeOut(prog(t, 0.3 + k * 0.18, 0.25)), r = 5 + (k % 3) * 2;
      if (o > 0) s += [-1, 1].map(d => `<ellipse cx="${x + d * r * 1.4}" cy="${y}" rx="${r}" ry="${(r * o).toFixed(2)}" fill="#FFE14D" stroke="#161616" stroke-width="1.2" opacity="${(0.6 + 0.4 * Math.sin(T * 4 + k)).toFixed(2)}"/><circle cx="${x + d * r * 1.4}" cy="${y}" r="${(r * 0.35 * o).toFixed(2)}" fill="#161616"/>`).join('');
    });
    return cam(z, 135, 240, s);
  }
  return '';
}
SCENES.s1e8 = [s1e8Scene, ep3Overlay]; TITLES.s1e8 = 'Cumi yang Terhina..';

// ================= S2E6 — Juragan Menyamar: Truk Tengah Malam (gaya A, sitcom deadpan) =================
const ceklis = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-26" y="-34" width="52" height="68" rx="3" fill="#F4EBDD" stroke="#161616" stroke-width="2"/><rect x="-10" y="-38" width="20" height="8" rx="2" fill="#8E5D36" stroke="#161616" stroke-width="1.4"/>${[-20, -6, 8, 22].map(d => `<path d="M-18 ${d} l4 4 l7 -8" stroke="#3FA34D" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M-2 ${d} L18 ${d}" stroke="#8C6A4A" stroke-width="1.6"/>`).join('')}</g>`;
function kepungA(T) { // gerbang gudang seratus dikelilingi lampu truk
  let s = gudang100A();
  [[10, 330], [60, 350], [120, 340], [180, 352], [236, 334]].forEach(([x, y], k) => { const g = 0.6 + 0.4 * Math.sin(T * 6 + k); s += `<path d="M${x} ${y} L${x - 40} ${y - 120} L${x + 40} ${y - 120} Z" fill="#FFF6B0" opacity="${(0.13 * g).toFixed(2)}"/><circle cx="${x - 9}" cy="${y}" r="7" fill="#FFF3A0" opacity="${g.toFixed(2)}" stroke="#161616" stroke-width="1.2"/><circle cx="${x + 9}" cy="${y}" r="7" fill="#FFF3A0" opacity="${g.toFixed(2)}" stroke="#161616" stroke-width="1.2"/>`; });
  return s;
}
function dermagaMalamA(T) {
  let s = dermagaA(T) + `<rect width="270" height="480" fill="#06081A" opacity="0.72"/><circle cx="214" cy="74" r="14" fill="#F4F1DE" opacity="0.85"/>`;
  s += [0, 1, 2].map(k => { const o = ((T * 0.5 + k / 3) % 1); return `<ellipse cx="150" cy="262" rx="${(20 + o * 90).toFixed(1)}" ry="${(5 + o * 18).toFixed(1)}" fill="none" stroke="#BFE3F0" stroke-width="2" opacity="${(0.8 * (1 - o)).toFixed(2)}"/>`; }).join('');
  return s;
}
function s2e6Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const groundN = `<rect y="402" width="270" height="78" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  const bg = () => gudang100A() + lampuTruk(0.25);
  const hiuBig = (o, extra = '', dy = 0) => bg() + place(hiuA({ ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'hiu', o.m || 'flat') }), -40, 150 + dy + bob('hiu'), 1.95, { w: 140, flip: true }) + extra + groundN;
  const cjBig = (o, extra = '', base = bg) => base() + place(CJ({ hat: false, ...o, lid: blink(T) && (o.lid ?? 0.4) < 0.9 ? 1 : (o.lid ?? 0.4), m: mouthOf(sh, T, 'cj', o.m || 'flat') }), 35, 140 + bob('cj'), 2.0) + groundN + extra;
  if (id === 'truk') {
    const laugh = Math.abs(Math.sin(T * 14)) * 2;
    return deretGudangA(T, 1) + place(hiuA({ lid: blink(T) ? 1 : 0.5, px: 0.4, m: mouthOf(sh, T, 'hiu', 'smirk') }), -30, 168 - laugh + bob('hiu'), 1.75, { w: 140, flip: true });
  }
  if (id === 'keriput') {
    const laugh = !talking(sh, T, 'kakap') && t > 0.3 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return bg() + place(kakapCaping({ lid: laugh ? 0.98 : 0.45, px: 0.6, m: mouthOf(sh, T, 'kakap', 'grin') }), -30, 160 - laugh + bob('kakap'), 1.85, { w: 140, flip: true }) + groundN + karungCumi(186, 296, 1.0, 6);
  }
  if (id === 'kuli') return hiuBig({ lid: 0.6, px: 0.5, m: 'smirk' }, '', 20);
  if (id === 'buka') return cjBig({ lid: 0.5, px: 0.6, m: 'flat' });
  if (id === 'loh') {
    const wow = t > 0.8, sp = wow ? Math.min(1, (t - 0.8) * 4) : 0, buzz = !wow ? Math.sin(T * 50) * 1.5 : 0, z = 1 + 0.07 * easeOut(prog(t, 0.8, 0.25));
    return cam(z, 135, 250, bg() + place(teriMandor({ lid: wow ? 0 : 0.3, pr: wow ? 2 : undefined, px: 0.6, m: mouthOf(sh, T, 'teri', wow ? 'o' : 'flat'), brow: wow ? 'up' : undefined, sweat: wow }), 0, 196 + bob('teri'), 1.6, { w: 120, flip: true }) + L.phone(212 + buzz, 300, 1.6, -8) + groundN +
      (wow ? star(40, 150, 8 * sp) + star(226, 160, 7 * sp) : ''));
  }
  if (id === 'kosong') {
    const shake = t < 0.4 ? Math.sin(T * 70) * 2 : 0;
    return `<g transform="translate(${shake.toFixed(2)} 0)">` + hiuBig({ lid: 0, pr: 2, px: 0.4, m: 'o', brow: 'up', sweat: true }, '', 20) + `</g>`;
  }
  if (id === 'cek') return cjBig({ lid: 0.45, px: 0.5, m: 'flat' }, karungBuka(178, 318, 0.95, t) + ceklis(40, 262, 0.9), dalam100A);
  if (id === 'solar') {
    const sniffing = t < 1.0, sag = easeOut(prog(t, 1.0, 0.5)) * 10;
    const smoke = [0, 1, 2].map(k => { const o = ((t * 0.7 + k / 3) % 1); return `<circle cx="${(200 + o * 30).toFixed(1)}" cy="${(330 - o * 50).toFixed(1)}" r="${(8 + o * 10).toFixed(1)}" fill="#55505A" opacity="${(0.6 * (1 - o)).toFixed(2)}"/>`; }).join('');
    return bg() + place(trukA(0, 0, 1), 120, 250, 0.9) + smoke + place(kakapCaping({ lid: sniffing ? 0.98 : 0.75, px: 0.4, py: 0.6, m: mouthOf(sh, T, 'kakap', sniffing ? 'flat' : 'frown') }), -20, 186 + sag + bob('kakap'), 1.5, { w: 140, flip: true }) + groundN;
  }
  if (id === 'kepung') {
    const point = Math.sin(Math.PI * prog(t, 0.1, 0.4)) * 6;
    return hiuBig({ lid: 0.1, px: 0.9 + point * 0, m: 'grit', brow: 'angry' }, '', 20 - point);
  }
  if (id === 'panik') return kepungA(T) + place(teriMandor({ lid: blink(T) ? 1 : 0, pr: 2, px: Math.sin(T * 6) > 0 ? -0.8 : 0.8, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: true }), 20, 180 + bob('teri'), 1.6, { w: 120 });
  if (id === 'tenang') {
    const z = 1 + 0.08 * easeOut(prog(t, 0, sh.dur));
    return cam(z, 135, 230, cjBig({ lid: 0.55, px: 0, py: 0, m: 'flat' }, L.phone(206, 300, 1.4, 10)));
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur));
    return cam(z, 135, 260, dermagaMalamA(T) + `<text x="150" y="232" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="40" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.4 * Math.sin(T * 6)).toFixed(2)}">?</text>`);
  }
  return '';
}
SCENES.s2e6 = [s2e6Scene, ep3Overlay]; TITLES.s2e6 = 'Juragan Menyamar..';

// ================= S2E7 — Juragan Menyamar: Suara dari Dermaga (gaya A, sitcom deadpan) =================
// Tokoh baru: Mak Hiu — ibu Juragan Hiu, hiu tua abu-abu muda, kerudung batik, kacamata bulat, alis putih, membawa tampah ikan asin.
function makHiuA(o = {}, { tampah = true } = {}) {
  let s = hiuA({ ...o, sweat: false }).replace(/#6F8796/g, '#A3B2BC').replace(/#4F6573/g, '#7D8F9C');
  s = s.replace(/<path d="M22 25 L46 31"[^>]*\/><path d="M50 22 L58 34[^>]*\/>/, '');
  s = s.replace(/<path d="M30 76 Q56 94 86 78"[\s\S]*?>H<\/text>/, '');
  s += `<path d="M24 31 Q34 26 44 31" stroke="#FFFFFF" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="34" cy="40" r="15" fill="none" stroke="#5A3A22" stroke-width="2.4"/><path d="M49 38 L64 34" stroke="#5A3A22" stroke-width="2"/>`;
  s += `<path d="M10 40 Q12 -6 70 -20 Q126 -8 124 46 Q128 70 116 86 L104 60 Q96 26 70 24 Q40 22 20 30 Z" fill="#8E3B5A" stroke="#161616" stroke-width="${S.LW}" stroke-linejoin="round"/>`;
  s += [[40, 6], [62, -6], [86, 2], [104, 24], [70, 12], [112, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#F5C542" stroke="#161616" stroke-width="0.8"/>`).join('');
  if (tampah) s += `<g transform="translate(84 96)"><ellipse cx="0" cy="0" rx="40" ry="11" fill="#D9B26A" stroke="#161616" stroke-width="2"/><ellipse cx="0" cy="-1" rx="31" ry="7" fill="#C9A04A"/>${ikanAsin(-12, -4, 0.45, -8)}${ikanAsin(12, -3, 0.45, 10)}</g>`;
  return s;
}
const teriakGaris = (x, y, a) => `<g opacity="${a.toFixed(2)}" stroke="#F5C542" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y - 30} l-8 -14 M${x + 22} ${y - 34} l0 -16 M${x + 44} ${y - 30} l8 -14"/></g>`;
const karungGula = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0 6 Q0 -6 16 -4 L54 -4 Q70 -6 70 6 L68 40 Q35 48 2 40 Z" fill="#F4F1EA" stroke="#161616" stroke-width="2"/><text x="35" y="24" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#C8553D">GULA</text></g>`;
function s2e7Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const groundN = `<rect y="402" width="270" height="78" fill="#2A2236" stroke="#161616" stroke-width="2"/>`;
  const bg = () => gudang100A() + lampuTruk(0.25);
  const lidOf = (o, d = 0.4) => (blink(T) && (o.lid ?? d) < 0.9 ? 1 : (o.lid ?? d));
  const mak = (o, spk = 'mak') => makHiuA({ ...o, lid: lidOf(o, 0.5), m: mouthOf(sh, T, spk, o.m || 'flat') });
  if (id === 'teriak') {
    const shk = Math.sin(T * 55) * 2.2 * (talking(sh, T, 'mak') ? 1 : 0.3), z = 1 + 0.08 * easeOut(prog(t, 0, sh.dur));
    let s = dermagaMalamA(T) + place(mak({ lid: 0.1, px: 0.3, m: 'o', brow: 'angry' }), 74, 210 + bob('mak'), 0.95, { w: 140, flip: true }) + teriakGaris(118, 220, talking(sh, T, 'mak') ? 1 : 0.3);
    return `<g transform="translate(${shk.toFixed(2)} 0)">` + cam(z, 135, 260, s) + `</g>`;
  }
  if (id === 'gemetar') {
    const tr = Math.sin(T * 40) * 1.6;
    return bg() + place(hiuA({ lid: 0, pr: 2, px: -0.6, m: mouthOf(sh, T, 'hiu', 'o'), brow: 'up', sweat: true }), -40 + tr, 170 + bob('hiu'), 1.95, { w: 140, flip: true }) + tetes(T, 190, 150, 2) + groundN;
  }
  if (id === 'nenek') {
    const laugh = !talking(sh, T, 'kakap') && t > 0.3 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return bg() + place(kakapCaping({ lid: laugh ? 0.98 : 0.45, px: 0.6, m: mouthOf(sh, T, 'kakap', 'grin') }), -30, 160 - laugh + bob('kakap'), 1.85, { w: 140, flip: true }) + groundN + karungCumi(186, 296, 1.0, 6);
  }
  if (id === 'siapa') {
    const shk = t < 0.4 ? Math.sin(T * 60) * 2.5 : 0, slide = 1 - easeOut(prog(t, 0, 0.3));
    return `<g transform="translate(${(shk + slide * 160).toFixed(2)} 0)">` + bg() + place(mak({ lid: 0.1, px: -0.3, m: 'grit', brow: 'angry' }), -30, 150 + bob('mak'), 1.9, { w: 140, flip: true }) + groundN + `</g>`;
  }
  if (id === 'endus') {
    const wow = t > 0.9, sp = wow ? Math.min(1, (t - 0.9) * 4) : 0, z = 1 + 0.07 * easeOut(prog(t, 0.9, 0.3));
    let s = dalam100A() + karungBuka(150, 330, 1.1, t) + (!wow ? aromaUap(t, 160, 320, 3, -1) : '');
    s += place(mak({ lid: wow ? 0.15 : 0.98, px: 0.6, py: 0.6, m: wow ? 'smile' : 'flat' }, 'mak'), -20, 170 + bob('mak'), 1.6, { w: 140, flip: true }) + `<rect y="402" width="270" height="78" fill="#3A2A1E" stroke="#161616" stroke-width="2"/>`;
    return cam(z, 135, 250, s + (wow ? star(40, 150, 7 * sp) + star(232, 170, 6 * sp) : ''));
  }
  if (id === 'loh') {
    const sp = Math.min(1, t * 4), z = 1 + 0.08 * easeOut(prog(t, 0, 0.25));
    return cam(z, 135, 250, bg() + place(teriMandor({ lid: 0, pr: 2, px: 0.7, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: true }), 0, 196 + bob('teri'), 1.6, { w: 120, flip: true }) + groundN + star(40, 150, 8 * sp) + star(226, 160, 7 * sp));
  }
  if (id === 'ajari') return bg() + place(CJ({ hat: false, lid: lidOf({ lid: 0.5 }), px: 0.6, m: mouthOf(sh, T, 'cj', 'flat') }), 10, 140 + bob('cj'), 2.0) + groundN + fotoDermaga(210, 300, 0.95);
  if (id === 'jewer') {
    const tr = Math.sin(T * 30) * 1.2;
    let s = bg() + place(mak({ lid: 0.6, px: -0.8, m: 'frown', brow: 'angry' }, 'x'), 120, 190, 1.15, { w: 140, flip: true });
    s += place(hiuA({ lid: 0.7, px: 0.6, py: 0.8, m: mouthOf(sh, T, 'hiu', 'frown'), sweat: true }), -10 + tr, 210 + bob('hiu'), 1.15, { w: 140 });
    return s + tetes(T, 30, 200, 2) + groundN;
  }
  if (id === 'lomba') {
    const point = Math.sin(Math.PI * prog(t, 0.1, 0.4)) * 6;
    return deretGudangA(T, 1) + place(mak({ lid: 0.2, px: 0.5, m: 'grit', brow: 'angry' }), -30, 168 - point + bob('mak'), 1.8, { w: 140, flip: true });
  }
  if (id === 'kalah') {
    const z = 1 + 0.06 * easeOut(prog(t, 0, sh.dur));
    let s = dermagaMalamA(T) + jemuranCumi(80, 250, 1.0);
    s += place(CJ({ hat: false, lid: 0.55, px: 0.9, m: 'flat' }), -6, 214, 1.05) + place(hiuA({ lid: 0.55, px: 0.9, m: 'smirk' }), 136, 236, 1.05, { w: 140, flip: true });
    s += place(mak({ lid: 0.4, px: 0, m: 'flat' }), 96, 156 + bob('mak'), 0.75, { w: 140, flip: true });
    return cam(z, 135, 260, s);
  }
  if (id === 'bisik') {
    const shifty = Math.sin(T * 5) > 0 ? -0.9 : 0.9;
    let s = gudang100A() + `<rect width="270" height="480" fill="#000" opacity="0.3"/>`;
    s += place(hiuA({ lid: 0.55, px: talking(sh, T, 'hiu') ? 0.9 : shifty, m: mouthOf(sh, T, 'hiu', 'smirk') }), -50, 180 + bob('hiu'), 1.7, { w: 140, flip: true });
    s += place(kakapCaping({ lid: 0.5, px: -0.9, m: 'smirk' }), 160, 240, 1.05);
    return s + groundN;
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur)), walk = easeOut(prog(t, 0.2, sh.dur - 1.6)), kx = -120 + walk * 150;
    let s = dermagaMalamA(T) + `<g stroke="#161616" stroke-width="2">${[30, 120, 210].map(x => `<rect x="${x}" y="276" width="8" height="60" fill="#3A2616"/>`).join('')}<rect x="-4" y="264" width="278" height="14" fill="#5A3A22"/></g>` + jemuranCumi(140, 196, 1.0);
    s += `<g opacity="0.9">` + place(kakapCaping({ lid: 0.6, px: 0.9, m: 'flat' }), kx, 200 - Math.abs(Math.sin(t * 7)) * 3, 1.0, { w: 140 }) + karungGula(kx + 88, 246, 0.75) + `</g>`;
    s += `<rect width="270" height="480" fill="#06081A" opacity="0.28"/>`;
    s += `<text x="200" y="182" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="40" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.4 * Math.sin(T * 6)).toFixed(2)}">?</text>`;
    return cam(z, 135, 260, s);
  }
  return '';
}
SCENES.s2e7 = [s2e7Scene, ep3Overlay]; TITLES.s2e7 = 'Juragan Menyamar..';

// ================= S2E8 — Juragan Menyamar: Sekarung Gula (gaya A, sitcom deadpan) =================
const semut = (T, x0, y0, n = 9, r = 26) => [...Array(n).keys()].map(k => { const a = T * (1.4 + (k % 3) * 0.5) + k * 0.7, x = x0 + Math.cos(a) * r * (0.5 + (k % 4) * 0.18), y = y0 + Math.sin(a * 1.2) * r * 0.45; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><ellipse cx="-2.6" cy="0" rx="1.8" ry="1.4" fill="#161616"/><ellipse cx="0.8" cy="0" rx="2.2" ry="1.7" fill="#161616"/><path d="M-1 0 l-1.5 2.4 M0.6 0 l0 2.6 M2 0 l1.6 2.4" stroke="#161616" stroke-width="0.6"/></g>`; }).join('');
const peluit = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-6" width="18" height="11" rx="5" fill="#9AA3AD" stroke="#161616" stroke-width="1.6"/><circle cx="8" cy="0" r="6" fill="#B9C0C8" stroke="#161616" stroke-width="1.6"/><path d="M-10 0 Q-22 -2 -26 8" stroke="#C8553D" stroke-width="1.6" fill="none"/></g>`;
const karungGulaKosong = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M2 30 Q4 18 18 20 L54 20 Q70 18 70 30 L68 40 Q35 46 2 40 Z" fill="#F4F1EA" stroke="#161616" stroke-width="2"/><text x="35" y="36" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="9" fill="#C8553D">GULA</text></g>`;
const suratTanah = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-40 -50 L40 -50 L40 50 L-40 50 Z" fill="#E9D3A6" stroke="#161616" stroke-width="2"/><path d="M-40 -50 L-33 -43 L-40 -34 M40 34 L33 43 L40 50" stroke="#C9A46A" stroke-width="1.4" fill="none"/><text x="0" y="-32" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#5A3A22">SURAT TANAH</text><text x="0" y="-16" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="12" fill="#C8553D">GUDANG 100</text>${[-2, 8, 18].map(d => `<path d="M-28 ${d} L28 ${d}" stroke="#8C6A4A" stroke-width="1.4"/>`).join('')}<text x="10" y="40" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="11" fill="#2A3A6A" transform="rotate(-8 10 40)">Hiu</text><circle cx="-22" cy="36" r="9" fill="none" stroke="#C8553D" stroke-width="1.6"/></g>`;
function s2e8Scene(sh, t, T) {
  const id = sh.id;
  const bob = sp => -amp(sh, T, sp) * 3 * Math.abs(Math.sin(T * 12));
  const lidOf = (o, d = 0.4) => (blink(T) && (o.lid ?? d) < 0.9 ? 1 : (o.lid ?? d));
  const mak = (o, spk = 'mak') => makHiuA({ ...o, lid: lidOf(o, 0.5), m: mouthOf(sh, T, spk, o.m || 'flat') });
  const bg = () => dermagaA(T);
  if (id === 'semut') {
    const shk = Math.sin(T * 50) * 1.6 * (talking(sh, T, 'teri') ? 1 : 0.3), z = 1 + 0.07 * easeOut(prog(t, 0, sh.dur));
    let s = bg() + karungA(166, 262, 'CUMI', 1.2) + semut(T, 208, 280, 12, 32) + semut(T + 1.3, 204, 258, 6, 22);
    s += place(teriMandor({ lid: 0, pr: 2, px: 0.8, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: true }), -16, 214 + bob('teri'), 1.75, { w: 120, flip: true });
    return `<g transform="translate(${shk.toFixed(2)} 0)">` + cam(z, 135, 260, s) + `</g>`;
  }
  if (id === 'mulai') {
    const blow = t < 0.6;
    return bg() + jemuranCumi(150, 250, 1.0) + place(mak({ lid: 0.15, px: -0.4, m: blow ? 'o' : 'grit', brow: 'angry' }), -30, 156 + bob('mak'), 1.75, { w: 140, flip: true }) + peluit(196, 262, 1.3) + (blow ? teriakGaris(214, 262, 0.9) : '');
  }
  if (id === 'kolak') {
    const laugh = !talking(sh, T, 'kakap') && t > 0.3 ? Math.abs(Math.sin(T * 16)) * 3 : 0;
    return bg() + place(kakapCaping({ lid: laugh ? 0.98 : 0.45, px: 0.6, m: mouthOf(sh, T, 'kakap', 'grin') }), -30, 160 - laugh + bob('kakap'), 1.8, { w: 140, flip: true }) + karungGulaKosong(176, 262, 1.1);
  }
  if (id === 'kuli') {
    const laugh = Math.abs(Math.sin(T * 14)) * 2;
    return bg() + place(hiuCaping({ lid: 0.75, px: 0.4, m: mouthOf(sh, T, 'hiu', 'smirk') }), -40, 168 - laugh + bob('hiu'), 1.85, { w: 140, flip: true });
  }
  if (id === 'depan') {
    return bg() + karungA(176, 262, 'KOSONG', 1.1) + semut(T, 214, 280, 10, 30) + place(CJ({ hat: false, lid: lidOf({ lid: 0.55 }), px: 0.9, m: mouthOf(sh, T, 'cj', 'flat') }), -20, 150 + bob('cj'), 1.85);
  }
  if (id === 'belakang') {
    const open = easeOut(prog(t, 0.2, 0.6)), z = 1 + 0.05 * open;
    let s = bg() + jemuranCumi(40, 236, 1.0) + jemuranCumi(150, 236, 1.0) + aromaUap(t, 90, 230, 3, 1) + aromaUap(t + 0.4, 190, 230, 3, -1);
    s += `<rect x="${(30 - open * 220).toFixed(1)}" y="210" width="230" height="110" fill="#F4EBDD" stroke="#161616" stroke-width="2"/><path d="M${(30 - open * 220).toFixed(1)} 210 L${(260 - open * 220).toFixed(1)} 210" stroke="#C8553D" stroke-width="4"/>`;
    s += place(CJ({ hat: false, lid: lidOf({ lid: 0.55 }), px: 0.7, m: mouthOf(sh, T, 'cj', 'flat') }), 150, 250 + bob('cj'), 0.95);
    return cam(z, 135, 260, s);
  }
  if (id === 'endus') {
    const wow = t > 0.9, sp = wow ? Math.min(1, (t - 0.9) * 4) : 0, z = 1 + 0.07 * easeOut(prog(t, 0.9, 0.3));
    let s = bg() + jemuranCumi(140, 250, 1.1) + (!wow ? aromaUap(t, 150, 250, 3, -1) : '');
    s += place(mak({ lid: wow ? 0.15 : 0.98, px: 0.6, py: 0.4, m: wow ? 'smile' : 'flat' }), -26, 170 + bob('mak'), 1.6, { w: 140, flip: true });
    return cam(z, 135, 250, s + (wow ? star(40, 150, 7 * sp) + star(232, 170, 6 * sp) : ''));
  }
  if (id === 'loh') {
    const sp = Math.min(1, t * 4), z = 1 + 0.08 * easeOut(prog(t, 0, 0.25));
    return cam(z, 135, 250, bg() + place(teriMandor({ lid: 0, pr: 2, px: 0.7, m: mouthOf(sh, T, 'teri', 'o'), brow: 'up', sweat: true }), -16, 214 + bob('teri'), 1.75, { w: 120, flip: true }) + karungGulaKosong(186, 268, 0.9) + semut(T, 218, 290, 7, 22) + star(40, 150, 8 * sp) + star(226, 160, 7 * sp));
  }
  if (id === 'menang') {
    const point = Math.sin(Math.PI * prog(t, 0.1, 0.4)) * 6;
    let s = bg() + place(CJ({ hat: false, lid: 0.55, px: 0.2, m: 'flat' }), -10, 236, 0.95) + place(hiuCaping({ lid: 0.3, pr: 2, px: -0.4, m: 'o', brow: 'up', sweat: true }), 146, 250, 0.95, { w: 140, flip: true });
    s += place(mak({ lid: 0.2, px: 0.5, m: 'grit', brow: 'angry' }), 70, 140 - point + bob('mak'), 0.95, { w: 140, flip: true });
    return s;
  }
  if (id === 'salah') {
    const tr = Math.sin(T * 30) * 1.2;
    let s = bg() + place(hiuCaping({ lid: 0.15, px: 0.9, m: mouthOf(sh, T, 'hiu', 'grit'), brow: 'angry' }), -30, 180 + bob('hiu'), 1.3, { w: 140, flip: true });
    s += place(kakapCaping({ lid: 0.1, pr: 2, px: -0.8, m: 'o', sweat: true }), 150 + tr, 250, 0.95) + tetes(T, 180, 230, 2);
    return s;
  }
  if (id === 'tanah') {
    const up = easeOut(prog(t, 0.3, 0.6));
    return bg() + place(hiuCaping({ lid: 0.55, px: 0.9, m: mouthOf(sh, T, 'hiu', 'smirk') }), -50, 176 + bob('hiu'), 1.75, { w: 140, flip: true }) + suratTanah(208, 420 - up * 170, 0.9, -8 + up * 6);
  }
  if (id === 'end') {
    const z = 1 + 0.1 * easeOut(prog(t, 0, sh.dur));
    let s = bg() + place(CJ({ hat: false, lid: 0.05, pr: 2, px: 0, m: 'flat', sweat: true }), 20, 150, 1.5) + suratTanah(212, 250, 0.8, 6);
    s += `<text x="70" y="180" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="40" fill="#F5C542" stroke="#000" stroke-width="2" opacity="${(0.4 + 0.4 * Math.sin(T * 6)).toFixed(2)}">?</text>`;
    return cam(z, 135, 260, s);
  }
  return '';
}
SCENES.s2e8 = [s2e8Scene, ep3Overlay]; TITLES.s2e8 = 'Juragan Menyamar..';

// ---------- frame ----------
function frameSvg(T) {
  let i = TL.shots.findIndex(s => T >= s.start && T < s.start + s.dur); if (i < 0) i = TL.shots.length - 1;
  const sh = TL.shots[i], t = T - sh.start;
  const [scene, overlay] = SCENES[EP] || [ep3Scene, ep3Overlay];
  const body = scene(sh, t, T) + overlay(sh, t, T);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 480" width="270" height="480"><defs><filter id="hblur" x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation="9 0"/></filter><filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8F0"/><stop offset="1" stop-color="#FCE7B0"/></linearGradient></defs><rect width="270" height="480" fill="#000"/>${body}</svg>`;
}
const F = ['LiberationSans-Bold.ttf', 'DejaVuSerif.ttf', 'fonts/InterXB.ttf', 'fonts/InterSB.ttf', 'fonts/InterBlackIt.ttf', 'fonts/NewsR.ttf', 'fonts/NewsIt.ttf', 'fonts/BodoniM.ttf', 'fonts/BodoniIt.ttf'].map(f => path.join(SB, f));
const opts = { fitTo: { mode: 'width', value: 1080 }, font: { fontFiles: F, loadSystemFonts: false, defaultFontFamily: 'Inter SB' } };
const png = T => new Resvg(frameSvg(T), opts).render().asPng();

const mode = process.argv[3];
if (mode === 'preview') { for (const s of process.argv[4].split(',')) fs.writeFileSync(path.join(__dirname, EP, `p_${s}.png`), png(parseFloat(s))); }
else if (mode === 'batch') {
  const a = +process.argv[4], b = Math.min(+process.argv[5], Math.ceil(TL.total * FPS));
  const dir = path.join(__dirname, EP, 'frames'); fs.mkdirSync(dir, { recursive: true });
  for (let f = a; f < b; f++) fs.writeFileSync(path.join(dir, String(f).padStart(5, '0') + '.png'), png(f / FPS));
} else if (mode === 'count') console.log(Math.ceil(TL.total * FPS));
