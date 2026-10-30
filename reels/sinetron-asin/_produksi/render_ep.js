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
      place(KK({ lid: shock ? 0 : 0.4, pr: shock ? 2 : undefined, px: 0.5, m: mouthOf(sh, T, 'kakap', 'o'), brow: 'up', chain: true }), 132, 300 + bob('kakap'), 0.95);
    return cam(z, 200, 260, inner) + (shock ? star(150, 286, 7 * sp) + star(244, 300, 6 * sp) : '');
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
// lalu daftarkan di sini: SCENES.<ep> = [<ep>Scene, ep3Overlay]; TITLES.<ep> = 'Judul bar..';
const SCENES = { ep2: [ep2Scene, ep2Overlay], ep3: [ep3Scene, ep3Overlay] };
const TITLES = { ep3: 'Bos Oren..' };
SCENES.s2e1 = [s2e1Scene, ep3Overlay]; TITLES.s2e1 = 'Juragan Menyamar..';
SCENES.s3e1 = [s3e1Scene, ep3Overlay]; TITLES.s3e1 = 'Mertua Cumi Jumbo..';
SCENES.s1e4 = [s1e4Scene, ep3Overlay]; TITLES.s1e4 = 'Kakap Ditinggal Bos..';

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
