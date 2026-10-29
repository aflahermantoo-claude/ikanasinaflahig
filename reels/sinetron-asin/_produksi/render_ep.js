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
  o += `<rect x="18" y="384" width="118" height="28" rx="4" fill="#141418" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.8"/><text x="26" y="395" font-family="Inter SB" font-size="7.2" fill="#FFFFFF">Voice by ♪ ElevenLabs · logat Jawa</text><text x="26" y="406" font-family="Inter SB" font-size="7.2" fill="#FFFFFF">Animation by ♪ @ikanasinaflah</text>`;
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
      X.plate(90, 330, 0.75) + L.phone(196 + buzz, 330, 1.2, 80) + `<text x="210" y="312" font-family="Liberation Sans" font-weight="bold" font-size="9" fill="#C8553D">Kakap ☎</text>`;
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
  let o = `<rect x="16" y="68" width="${'Bos Oren..'.length * 8.1 + 18}" height="24" rx="4" fill="#FFFFFF"/><text x="25" y="85" font-family="Liberation Sans" font-weight="bold" font-size="14.5" fill="#111">Bos Oren..</text>`;
  const l = curLine(sh, T);
  if (l) { const ls = wrap(l.text); o += subRef(ls, ls.length > 1 ? 384 : 398); }
  if (sh.id === 'end' && t > sh.dur - 1.6) {
    const p = easeOutBack(prog(t, sh.dur - 1.6, 0.3));
    o += cam(p, 120, 145, `<text x="120" y="150" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="24" fill="#F5C542" stroke="#111" stroke-width="3" paint-order="stroke">BERSAMBUNG...</text>`) + `<rect x="45" y="${330}" width="150" height="26" rx="13" fill="#FFFFFF" stroke="#161616" stroke-width="1.6"/><text x="120" y="347.5" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="12.5" fill="#111">@ikanasinaflah</text>`;
  }
  return o;
}

// ---------- frame ----------
function frameSvg(T) {
  let i = TL.shots.findIndex(s => T >= s.start && T < s.start + s.dur); if (i < 0) i = TL.shots.length - 1;
  const sh = TL.shots[i], t = T - sh.start;
  const body = EP === 'ep2' ? ep2Scene(sh, t, T) + ep2Overlay(sh, t, T) : ep3Scene(sh, t, T) + ep3Overlay(sh, t, T);
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
