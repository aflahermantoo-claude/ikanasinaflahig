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

// ---------- daftar episode ----------
// Episode baru (gaya Ep 3 / sitcom deadpan): tulis fungsi <ep>Scene(sh, t, T) dengan karakter gaya A,
// lalu daftarkan di sini: SCENES.<ep> = [<ep>Scene, ep3Overlay]; TITLES.<ep> = 'Judul bar..';
const SCENES = { ep2: [ep2Scene, ep2Overlay], ep3: [ep3Scene, ep3Overlay] };
const TITLES = { ep3: 'Bos Oren..' };
SCENES.s2e1 = [s2e1Scene, ep3Overlay]; TITLES.s2e1 = 'Juragan Menyamar..';

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
