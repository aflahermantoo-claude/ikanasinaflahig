// Episode 2 "Cumi yang Terhina" — 10 adegan × 2 gaya animasi × 5 gaya editing
const L = require('./lib');
const B = require('./bg');
const { S, place, cumiBaby: CB, teri: TN, kakap: KK, kucing: KO, star } = L;

// ---------------- backgrounds per look ----------------
function marketA() { // painted night market (sitcom look)
  let s = `<rect width="270" height="480" fill="#2A2140"/><rect width="270" height="200" fill="#1E1833"/>`;
  s += `<g stroke="#161616" stroke-width="2"><rect x="-4" y="150" width="120" height="190" fill="#4A3A5C"/><rect x="150" y="140" width="124" height="200" fill="#3E3152"/></g>`;
  s += `<g stroke="#161616" stroke-width="1.5">${[0, 24, 48, 72, 96].map(x => `<path d="M${x - 4} 150 L${x + 20} 150 L${x + 20} 168 Q${x + 8} 176 ${x - 4} 168 Z" fill="${x % 48 ? '#F4EBDD' : '#C8553D'}"/>`).join('')}</g>`;
  s += `<rect x="160" y="160" width="100" height="22" rx="4" fill="#F4EBDD" stroke="#161616" stroke-width="1.5"/><text x="210" y="176" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="10" fill="#3A2416">LAPAK BU SUM</text>`;
  s += [16, 46, 76, 172, 202, 232].map((x, i) => `<circle cx="${x}" cy="${136 + (i % 2) * 5}" r="10" fill="#FFD66B" opacity="0.22"/><circle cx="${x}" cy="${136 + (i % 2) * 5}" r="4" fill="#FFE9A0" stroke="#161616" stroke-width="1"/>`).join('') + `<path d="M0 132 Q60 146 120 136 Q190 126 270 140" stroke="#161616" stroke-width="1" fill="none"/>`;
  s += `<rect y="340" width="270" height="140" fill="#3A3048"/><path d="M0 340 L270 340" stroke="#161616" stroke-width="2"/>`;
  return s;
}
function marketB() { // bright vector street market (Philipsinema look)
  let s = `<rect width="270" height="480" fill="#7FD3F7"/><rect y="0" width="270" height="60" fill="#A9E4FB"/>`;
  s += `<g stroke="#2B2B2B" stroke-width="1.6"><rect x="-4" y="70" width="278" height="240" fill="#E9845A"/>`;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) s += `<rect x="${c * 32 + (r % 2) * 16 - 8}" y="${74 + r * 12}" width="28" height="9" fill="#DB7149" stroke="none"/>`;
  s += `<rect x="20" y="86" width="230" height="34" rx="4" fill="#E83B3B"/><text x="135" y="110" text-anchor="middle" font-family="Inter XB" font-size="19" fill="#FFFFFF" stroke="none">PASAR IKAN BU SUM</text>`;
  s += `<rect x="14" y="150" width="242" height="150" fill="#5FC4E8"/>${[14, 74, 134, 194].map(x => `<rect x="${x}" y="150" width="60" height="150" fill="none"/>`).join('')}`;
  s += `<rect x="30" y="160" width="40" height="52" fill="#FFF3B0"/><text x="50" y="182" text-anchor="middle" font-family="Inter XB" font-size="9" fill="#E83B3B" stroke="none">PROMO</text><text x="50" y="198" text-anchor="middle" font-family="Inter XB" font-size="8" fill="#2B2B2B" stroke="none">CUMI</text>`;
  s += `<rect x="198" y="160" width="40" height="52" fill="#FFF3B0"/><text x="218" y="182" text-anchor="middle" font-family="Inter XB" font-size="9" fill="#E83B3B" stroke="none">FRESH</text></g>`;
  s += `<g stroke="#2B2B2B" stroke-width="1.6">${[0, 30, 60, 90, 120, 150, 180, 210, 240].map((x, i) => `<path d="M${x} 136 L${x + 30} 136 L${x + 30} 148 L${x} 148 Z" fill="${i % 2 ? '#FFFFFF' : '#2FA84F'}"/>`).join('')}</g>`;
  s += `<rect y="300" width="270" height="12" fill="#F2C94C" stroke="#2B2B2B" stroke-width="1.5"/>${[0, 40, 80, 120, 160, 200, 240].map(x => `<rect x="${x}" y="300" width="20" height="12" fill="#2B2B2B"/>`).join('')}`;
  s += `<rect y="312" width="270" height="168" fill="#7B7F86"/><path d="M170 400 L205 380 L205 392 L250 392 L250 408 L205 408 L205 420 Z" fill="#FFFFFF" opacity="0.9"/><path d="M20 460 L80 460" stroke="#FFFFFF" stroke-width="5"/>`;
  s += `<g stroke="#2B2B2B" stroke-width="1.6"><circle cx="248" cy="258" r="20" fill="#3FB560"/><circle cx="262" cy="240" r="16" fill="#4CC76E"/><rect x="242" y="270" width="26" height="30" fill="#8A5A3A"/></g>`;
  return s;
}
const market = look => (look === 'A' ? marketA() : marketB());
function rays(look) {
  const c1 = look === 'A' ? '#2B1840' : '#FF3FA4', c2 = look === 'A' ? '#3F2560' : '#FFD84D';
  return `<rect width="270" height="480" fill="${c1}"/><g stroke="${c2}" stroke-width="${look === 'A' ? 12 : 16}" opacity="${look === 'A' ? 1 : 0.8}">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M135 230 L${(135 + 420 * Math.cos(a)).toFixed(0)} ${(230 + 420 * Math.sin(a)).toFixed(0)}"/>`; }).join('')}</g>`;
}
function speed(look) {
  if (look === 'A') return B.pasarMalam({ ice: false });
  const cols = ['#E83B3B', '#2F6FE8', '#F2C94C', '#1C1C24', '#FFFFFF', '#2FA84F'];
  return `<rect width="270" height="480" fill="#9AA0A8"/>${Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 37) % 260 - 40}" y="${i * 18}" width="${120 + (i * 23) % 140}" height="${4 + (i % 4) * 3}" rx="3" fill="${cols[i % cols.length]}" opacity="0.85"/>`).join('')}`;
}
const ice = (y = 340) => `<g stroke="#161616" stroke-width="1.5">${[0, 58, 116, 174].map(x => `<rect x="${x + 4}" y="${y}" width="54" height="40" rx="4" fill="#CDEBFA" opacity="0.94"/>`).join('')}</g>`;
function office(look) {
  const wall = look === 'A' ? '#14101E' : '#2B1E4A';
  return `<rect width="270" height="480" fill="${wall}"/><rect x="140" y="80" width="120" height="150" fill="${look === 'A' ? '#1E2A44' : '#3D5BB5'}" stroke="#111" stroke-width="2"/><circle cx="230" cy="110" r="14" fill="#F3E9DC"/><path d="M140 155 L260 155 M200 80 L200 230" stroke="#111" stroke-width="3"/><rect y="340" width="270" height="140" fill="${look === 'A' ? '#0E0B14' : '#1B1330'}"/>`;
}

// chef coat with optional 3 teri inside
function chef(x, y, s = 1, open = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="#161616" stroke-width="2.2">
<path d="M14 30 Q0 8 22 6 Q26 -6 40 -2 Q54 -8 58 6 Q80 8 66 30 Z" fill="#FFFFFF"/><rect x="18" y="28" width="44" height="10" fill="#F2F2F2"/>
${open ? '' : `<circle cx="40" cy="52" r="15" fill="#0E0B14"/><circle cx="34" cy="52" r="2.5" fill="#F5C542" stroke="none"/><circle cx="46" cy="52" r="2.5" fill="#F5C542" stroke="none"/>`}
${open ? `<path d="M8 70 L-14 200 L28 200 L30 70 Z" fill="#0E0B14"/><path d="M72 70 L94 200 L52 200 L50 70 Z" fill="#0E0B14"/>` : `<path d="M10 200 L16 72 Q40 58 64 72 L70 200 Z" fill="#0E0B14"/>`}</g>`;
}
const trio = (x, y, s, opts = {}) => [0, 1, 2].map(k => place(TN({ lid: 0.4, m: k === (opts.talker ?? 0) ? 'talk' : 'flat', ...opts }), x, y + k * 64 * s / 1.1, s, { w: 120, flip: opts.flip })).join('');
const kontrak = (x, y, s = 1, rot = -8) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" stroke="#161616" stroke-width="1.6"><rect x="0" y="0" width="80" height="58" fill="#FFF6EC"/><text x="40" y="17" text-anchor="middle" font-family="Inter XB" font-size="10" fill="#111" stroke="none">KONTRAK</text><path d="M10 28 L70 28 M10 38 L58 38 M10 48 L44 48" stroke-width="1"/></g>`;
function plate(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="62" ry="16" fill="#FFFFFF" stroke="#161616" stroke-width="2"/><path d="M-48 -2 Q-36 -40 0 -42 Q36 -40 48 -2 Q0 10 -48 -2 Z" fill="#FFFDF5" stroke="#161616" stroke-width="1.8"/>
${[[-22, -16], [6, -24], [26, -10]].map(([a, b]) => `<path d="M${a} ${b} q6 -6 14 0 q-2 6 -14 0 Z" fill="#E8BF8A" stroke="#7A5A30" stroke-width="1"/>`).join('')}<path d="M-14 -46 Q-18 -60 -12 -72 M6 -48 Q2 -64 8 -78 M24 -46 Q20 -60 26 -72" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.85"/></g>`;
}

// ---------------- the 10 scenes ----------------
const SC = [
  look => market(look) + chef(18, 140, 1.15) + `<g stroke="#FFE14D" stroke-width="2" fill="none" stroke-linecap="round"><path d="M104 196 q10 -6 18 0 q8 6 18 0"/><path d="M104 210 q10 -6 18 0 q8 6 18 0"/></g>` + place(CB({ lid: 0.05, m: 'o', px: -0.6 }), 140, 212, 0.95) + `<rect width="270" height="480" fill="#7A4A1A" opacity="0.32"/>`,
  look => rays(look) + chef(75, 92, 1.5, true) + trio(95, 196, 0.75, { m: 'smile', lid: 0.3 }) + star(70, 170, 8) + star(205, 240, 7) + star(58, 300, 6),
  look => rays(look) + place(CB({ lid: 0.62, m: 'flat', blush: false }), 35, 118, 2.0),
  look => market(look) + chef(55, 70, 2.0, true) + trio(70, 180, 1.1, { talker: 0 }),
  look => market(look) + place(KK({ lid: 0, px: -0.3, m: 'grin', brow: 'up' }), 40, 228, 1.35) + ice(330) + star(40, 222, 6) + star(222, 236, 6),
  look => speed(look) + (look === 'A' ? B.lightning(60) : '') + place(TN({ lid: 1, m: 'o' }), 40, 170, 0.8, { w: 120, rot: -70, cx: 60, cy: 30 }) + place(TN({ lid: 1, m: 'o' }), 110, 220, 0.8, { w: 120, rot: -95, cx: 60, cy: 30 }) + place(TN({ lid: 1, m: 'o' }), 170, 270, 0.8, { w: 120, rot: -120, cx: 60, cy: 30 }) + place(KK({ lid: 0.4, px: 0.3, m: 'smirk' }), 10, 300, 0.7),
  look => market(look) + trio(18, 170, 0.78, { flip: true, talker: 1, px: 0.6 }) + kontrak(92, 236, 0.95, -8) + place(CB({ lid: 0.2, m: 'o', px: -0.7 }), 140, 200, 1.0),
  look => market(look) + place(CB({ lid: 0.5, m: 'talk', px: 0.7, blush: false }), 35, 118, 2.0),
  look => market(look) + place(CB({ lid: 0.15, m: 'smile', brow: 'up' }), 75, 120, 1.2) + plate(135, 345, 1.3) + star(52, 160, 7) + star(222, 200, 6) + star(70, 300, 5),
  look => office(look) + place(KK({ lid: 0.3, px: 0.5, m: 'talk', sweat: true, chain: false, brow: 'sad' }), -6, 240, 1.0, { w: 140, flip: true }) + L.phone(118, 262, 1.4, 10) +
    `<g stroke="#000" stroke-width="2"><path d="M150 230 Q150 150 205 150 Q262 150 262 230 L262 360 L150 360 Z" fill="#2A0F12"/></g>` + `<g opacity="0.95">${place(KO({ lid: 0.55, m: 'smirk', brow: 'angry' }), 168, 200, 0.9)}</g><rect x="150" y="190" width="112" height="170" fill="#000" opacity="0.62"/><circle cx="194" cy="245" r="4" fill="#FFE14D"/><circle cx="218" cy="245" r="4" fill="#FFE14D"/>`,
];

// beats (dialogue) shared by every editing style
const BEAT = [
  { who: 'Narator', sub: ['Sebelumnya... chef misterius', 'mencium aroma Cumi Baby.'], word: 'SEBELUMNYA', kara: 2 },
  { who: 'SFX', sub: ['DUN... DUN... DUNN!'], word: 'TERUNGKAP', kara: 1 },
  { who: 'Cumi Baby', sub: ['Oh.'], word: 'OH.', kara: 1 },
  { who: 'Teri Nasi', sub: ['Kami chef Restoran Bintang Lima.', 'Cari cumi asin paling wangi.'], word: 'BINTANG LIMA', kara: 1 },
  { who: 'Kakap', sub: ['Chef! Saya lebih segar,', 'ndak bau!'], word: 'SEGAR!', kara: 1 },
  { who: 'SFX', sub: ['*pingsan berjamaah*'], word: 'PINGSAN', kara: 1 },
  { who: 'Teri Nasi', sub: ['Mbak Cumi, mau kerja', 'di dapur kami?'], word: 'KONTRAK', kara: 1 },
  { who: 'Cumi Baby', sub: ['Gajinya berapa?'], word: 'GAJINYA?', kara: 1 },
  { who: 'Teri / Cumi Baby', sub: ['Nasi hangat, tiap hari.', '...Deal.'], word: 'DEAL', kara: 1 },
  { who: 'Kakap', sub: ['Bos... cumi asin itu', 'mau masuk restoran.'], word: 'BOS...', kara: 1 },
];

// ---------------- shared overlay helpers ----------------
const GRAD = `<linearGradient id="kw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9A5A"/><stop offset="0.35" stop-color="#FF4FA3"/><stop offset="0.7" stop-color="#A35BFF"/><stop offset="1" stop-color="#4F7BFF"/></linearGradient>`;
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function subRef(lines, y = 392) { // reference style: white bold + black stroke
  const fs = Math.min(15.5, 200 / (Math.max(...lines.map(l => l.length)) * 0.55));
  return lines.map((l, i) => `<text x="120" y="${y + i * 19}" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="${fs.toFixed(1)}" fill="#FFFFFF" stroke="#111" stroke-width="3.4" stroke-linejoin="round" paint-order="stroke">${esc(l)}</text>`).join('');
}
function subKaraoke(lines, kara, y = 394, key = null, keyCol = '#F2A48F', ink = '#FFFFFF') { // guidebook §8
  const fs = Math.min(13, 205 / (Math.max(...lines.map(l => l.length)) * 0.54)).toFixed(1);
  const shadow = lines.map((l, i) => `<text x="120.6" y="${y + i * 17 + 0.9}" text-anchor="middle" font-family="Inter SB" font-size="${fs}" fill="#000" opacity="0.55">${esc(l)}</text>`).join('');
  return shadow + lines.map((l, i) => {
    const on = i < kara;
    let body = esc(l);
    if (key && l.includes(key)) body = esc(l).replace(esc(key), `<tspan fill="${keyCol}">${esc(key)}</tspan>`);
    return `<text x="120" y="${y + i * 17}" text-anchor="middle" font-family="Inter SB" font-size="${fs}" fill="${ink}" opacity="${on ? 1 : 0.38}" style="text-shadow:0 1px 3px #000">${body}</text>`;
  }).join('');
}
const glassChip = (x, y, t, w) => { w = w || t.length * 5.6 + 22; return `<rect x="${x}" y="${y}" width="${w}" height="19" rx="9.5" fill="#141418" fill-opacity="0.58" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="0.8"/><text x="${x + w / 2}" y="${y + 13}" text-anchor="middle" font-family="Inter SB" font-size="9.5" fill="#FFFFFF">${esc(t)}</text>`; };

// ---------------- 5 editing styles ----------------
// each returns full svg given scene body
function svg(defs, body) { return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 270 480" width="270" height="480"><defs>${GRAD}<filter id="b6" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>${defs}</defs>${body}</svg>`; }

const E = {};
// E1 — Sitcom Polos (editing ala referensi "Compliment Gone Wrong")
E[1] = (i, look, scene) => {
  const b = BEAT[i];
  let o = `<rect x="16" y="68" width="${15 * 8.1 + 18}" height="24" rx="4" fill="#FFFFFF"/><text x="25" y="85" font-family="Liberation Sans" font-weight="bold" font-size="14.5" fill="#111">Chef Misterius..</text>`;
  o += subRef(b.sub, b.sub.length > 1 ? 384 : 398);
  if (i === 9) o += `<text x="120" y="150" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="24" fill="#F5C542" stroke="#111" stroke-width="3" paint-order="stroke">BERSAMBUNG...</text>`;
  return svg('', scene + o);
};
// E2 — Kata Meledak (editing ala Philipsinema)
E[2] = (i, look, scene) => {
  const b = BEAT[i];
  let body = scene;
  if (i === 1) { // 4-panel BERAKSI split
    const cols = [['#B5651D', '#5A2E0A'], ['#1F4FD8', '#0A1E5A'], ['#1FA84F', '#0A4A20'], ['#D81F3A', '#5A0A14']];
    body = cols.map(([c1, c2], k) => { const x = (k % 2) * 135, y = (k > 1) * 240; return `<g><rect x="${x}" y="${y}" width="135" height="240" fill="${c2}"/>${Array.from({ length: 7 }, (_, j) => `<path d="M${x + j * 30 - 60} ${y + 240} L${x + j * 30 + 40} ${y}" stroke="${c1}" stroke-width="10"/>`).join('')}${place(TN({ lid: 0.1, m: 'grit', brow: 'angry' }), x + 10, y + 90, 0.95, { w: 120 })}</g>`; }).join('') + `<path d="M135 0 L135 480 M0 240 L270 240" stroke="#FFFFFF" stroke-width="3"/>` +
      `<text x="135" y="238" text-anchor="middle" font-family="Inter BlackIt" font-size="18" fill="#FFFFFF" stroke="#111" stroke-width="4" paint-order="stroke">TERI ULTIMA 3-IN-1</text><text x="135" y="258" text-anchor="middle" font-family="Inter BlackIt" font-size="14" fill="#FFFFFF" stroke="#111" stroke-width="3.5" paint-order="stroke">-BERAKSI-</text>`;
  }
  let o = '';
  if (i !== 1) o += `<g transform="translate(120 ${i === 9 ? 170 : [2, 7].includes(i) ? 340 : 236}) rotate(-3)"><text x="0" y="0" text-anchor="middle" font-family="Inter BlackIt" font-size="${b.word.length > 9 ? 22 : 28}" fill="#FFFFFF" stroke="#111" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${esc(b.word)}</text></g>`;
  o += `<rect x="18" y="384" width="118" height="28" rx="4" fill="#141418" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.8"/><text x="26" y="395" font-family="Inter SB" font-size="7.2" fill="#FFFFFF">Voice by  ♪ ElevenLabs · logat Jawa</text><text x="26" y="406" font-family="Inter SB" font-size="7.2" fill="#FFFFFF">Animation by  ♪ @ikanasinaflah</text>`;
  if (i === 9) o += `<text x="120" y="120" text-anchor="middle" font-family="Inter BlackIt" font-size="20" fill="#F2C94C" stroke="#111" stroke-width="4" paint-order="stroke">BERSAMBUNG...</text>`;
  return svg('', body + o);
};
// E3 — Clean Glass (guidebook v2.4 §6)
E[3] = (i, look, scene) => {
  const b = BEAT[i];
  let defs = `<g id="scn">${scene}</g><linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.85"/><stop offset="0.6" stop-color="#000" stop-opacity="0.5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`, body = `<use href="#scn"/><rect width="270" height="190" fill="url(#ts)"/>`, o = '';
  const hook = [['Chef misterius', 'itu siapa?', 'siapa?'], ['Ternyata', 'bertiga.', 'bertiga.'], null, ['Restoran', 'Bintang Lima.', 'Lima.'], null, null, ['Tawaran', 'kerja.', 'kerja.'], null, ['Gajinya', 'nasi hangat.', 'hangat.'], ['Siapa', 'bosnya?', 'bosnya?']][i];
  if (i === 6 || i === 8) { // kartu kaca di atas footage blur
    body = `<use href="#scn" filter="url(#b6)"/><rect width="270" height="480" fill="#000" opacity="0.12"/>`;
    o += `<rect x="25" y="120" width="210" height="130" rx="16" fill="#FFFFFF" fill-opacity="0.16" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="1"/>`;
    if (i === 6) o += `<text x="40" y="146" font-family="Inter SB" font-size="9" fill="#FFFFFF" opacity="0.85">KONTRAK DAPUR</text><text x="40" y="178" font-family="Inter XB" font-size="22" fill="#FFFFFF">Restoran</text><text x="40" y="204" font-family="Inter XB" font-size="22" fill="url(#kw)">Bintang Lima</text><text x="40" y="230" font-family="Inter SB" font-size="9.5" fill="#FFFFFF" opacity="0.85">Posisi: cumi asin paling wangi</text>`;
    else o += `<text x="40" y="146" font-family="Inter SB" font-size="9" fill="#FFFFFF" opacity="0.85">Gaji per hari</text><text x="40" y="196" font-family="Inter XB" font-size="44" fill="url(#kw)">1</text><text x="70" y="196" font-family="Inter XB" font-size="16" fill="#FFFFFF">piring</text><text x="40" y="226" font-family="Inter SB" font-size="10" fill="#FFFFFF">≈ nasi hangat, tiap hari ✓</text>`;
  } else if (hook) {
    o += `<text x="120" y="96" text-anchor="middle" font-family="Inter XB" font-size="27" letter-spacing="-0.5" fill="#FFFFFF" style="text-shadow:0 2px 8px #000">${esc(hook[0])}</text>`;
    const parts = hook[1].split(hook[2]);
    o += `<text x="120" y="126" text-anchor="middle" font-family="Inter XB" font-size="27" letter-spacing="-0.5" fill="#FFFFFF">${esc(parts[0])}<tspan fill="url(#kw)">${esc(hook[2])}</tspan></text>`;
  }
  if (i === 0) o += glassChip(70, 312, 'Cumi yang Terhina · Ep 2', 100);
  if (i === 2) o += glassChip(78, 96, 'Cumi Baby', 84);
  if (i === 4) o += glassChip(64, 96, '✕  Kakap Segar · nyelonong', 112);
  if (i === 5) o += glassChip(78, 96, '✓  3 chef pingsan', 84);
  if (i === 7) o += glassChip(78, 96, 'Cumi Baby nego', 84);
  if (i === 9) o += glassChip(46, 330, '💬 Tebak bosnya di komentar', 148);
  o += subKaraoke(b.sub, b.kara);
  return svg(defs, body + o);
};
// E4 — Headspace Motion (guidebook §7: krem scrim + serif terracotta)
E[4] = (i, look, scene) => {
  const b = BEAT[i];
  const H = 190; // scrim bottom (above heads)
  const defs = `<g id="scn">${scene}</g><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="${((H - 50) / H).toFixed(2)}" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="sm" maskUnits="userSpaceOnUse" x="0" y="0" width="270" height="${H}"><rect width="270" height="${H}" fill="url(#sg)"/></mask>`;
  let body = `<use href="#scn"/><g mask="url(#sm)"><use href="#scn" filter="url(#b6)"/><rect width="270" height="${H}" fill="#F4ECE4" opacity="0.82"/></g>`;
  const T = [['Episode', 'dua'], ['Chef', 'misterius'], ['Datar', 'saja'], ['Bintang', 'lima'], ['Si paling', 'segar'], ['Pingsan', 'massal'], ['Ada', 'tawaran'], ['Soal', 'gaji'], ['Deal', 'manis'], ['Siapa', 'bosnya?']][i];
  let o = `<g>${Array.from({ length: 10 }, (_, k) => `<rect x="${18 + k * 20.6}" y="66" width="18" height="2.4" rx="1.2" fill="${k <= i ? '#C8553D' : '#1E1A17'}" opacity="${k <= i ? 1 : 0.15}"/>`).join('')}</g>`;
  o += `<text x="18" y="84" font-family="Inter SB" font-size="7.5" letter-spacing="0.8" fill="#C8553D">CUMI YANG TERHINA · EP 2 · ${i + 1}/10</text>`;
  o += `<text x="18" y="114" font-family="News R" font-size="25" fill="#1E1A17">${esc(T[0])} <tspan font-family="News It" fill="#C8553D">${esc(T[1])}</tspan></text>`;
  if (i === 6) o += `<g transform="translate(150 92) rotate(3)"><rect width="74" height="86" rx="7" fill="#FFFFFF" style="filter:drop-shadow(0 5px 10px rgba(80,40,20,.14))"/><rect width="74" height="16" rx="7" fill="#C8553D"/><text x="37" y="11" text-anchor="middle" font-family="Inter SB" font-size="6.5" fill="#FFF">KONTRAK DAPUR</text>${['Wangi', 'Bintang lima', 'Gaji ?'].map((t, k) => `<rect x="7" y="${26 + k * 18}" width="8" height="8" rx="1.5" fill="${k < 2 ? '#C8553D' : '#F2D3C8'}"/>${k < 2 ? `<path d="M8.5 ${30 + k * 18} l2 2 l3.5 -4" stroke="#fff" stroke-width="1.3" fill="none"/>` : ''}<text x="19" y="${33 + k * 18}" font-family="Inter SB" font-size="7" fill="#1E1A17">${t}</text>`).join('')}</g>`;
  if (i === 7) o += `<g transform="translate(196 140)"><circle r="26" fill="none" stroke="#1E1A17" stroke-opacity="0.1" stroke-width="4"/><path d="M0 -26 A26 26 0 1 1 -18 19" fill="none" stroke="#C8553D" stroke-width="4" stroke-linecap="round"/><text y="-3" text-anchor="middle" font-family="Inter SB" font-size="5.5" fill="#8A7F78">biasanya sekitar</text><text y="12" text-anchor="middle" font-family="News R" font-size="15" fill="#1E1A17">???</text></g>`;
  if (i === 8) o += `<g transform="translate(176 150) rotate(-4)"><rect x="-6" y="-20" width="72" height="30" rx="6" fill="#C8553D" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.25))"/><text x="30" y="2" text-anchor="middle" font-family="Inter BlackIt" font-size="20" fill="#FFFFFF">DEAL</text></g>`;
  if (i === 9) o += `<g transform="translate(184 128)"><path d="M0 0 L24 0 L24 32 L12 24 L0 32 Z" fill="#C8553D"/></g><text x="214" y="152" font-family="News R" font-size="14" fill="#1E1A17">Simpan.</text>`;
  o += subKaraoke(b.sub, b.kara, 394, ['Bintang Lima.', 'segar,', 'dapur kami?', 'Gajinya', 'Nasi hangat,', 'restoran.', 'aroma'][[3, 4, 6, 7, 8, 9, 0].indexOf(i)] || null);
  return svg(defs, body + o);
};
// E5 — Navy Gold Sinetron (Style 2 guidebook)
E[5] = (i, look, scene) => {
  const b = BEAT[i];
  const defs = `<g id="scn">${scene}</g><radialGradient id="nv" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#13234A"/><stop offset="0.45" stop-color="#0F1E3D"/><stop offset="0.8" stop-color="#08101F"/><stop offset="1" stop-color="#050608"/></radialGradient><clipPath id="card"><rect x="0" y="0" width="270" height="480" rx="22"/></clipPath><pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0 L0 0 L0 18" stroke="rgba(120,150,220,.10)" stroke-width="0.6" fill="none"/></pattern>`;
  const lab = ['Sebelumnya', 'Terungkap', 'Datar.', 'Sang chef', 'Si penyusup', 'Gugur', 'Tawaran', 'Negosiasi', 'Sepakat', 'Bersambung'][i];
  let body = `<rect width="270" height="480" fill="url(#nv)"/><rect width="270" height="480" fill="url(#grid)"/>`;
  body += `<text x="120" y="76" text-anchor="middle" font-family="Bodoni M" font-size="15" letter-spacing="1" fill="#FFFFFF">CUMI YANG TERHINA</text><text x="120" y="94" text-anchor="middle" font-family="Bodoni It" font-size="12" fill="#D4AF6A">Episode 2 — Chef Misterius</text>`;
  body += `<g transform="translate(46 104) rotate(1.5)"><rect x="-4" y="-4" width="${0.56 * 270 + 8}" height="${0.56 * 480 + 8}" rx="16" fill="none" stroke="#D4AF6A" stroke-opacity="0.35" stroke-width="7"/><g transform="scale(0.56)"><g clip-path="url(#card)"><use href="#scn"/></g><rect width="270" height="480" rx="22" fill="none" stroke="#D4AF6A" stroke-width="4.5"/></g></g>`;
  body += `<text transform="translate(18 118) rotate(-6)" font-family="Bodoni It" font-size="20" fill="#D4AF6A">${lab}</text>`;
  body += `<rect x="18" y="${b.sub.length > 1 ? 376 : 388}" width="204" height="${b.sub.length > 1 ? 36 : 24}" rx="9" fill="#0B1630" stroke="#D4AF6A" stroke-opacity="0.6" stroke-width="0.8"/>` + b.sub.map((l, k) => `<text x="120" y="${(b.sub.length > 1 ? 390 : 404) + k * 14}" text-anchor="middle" font-family="Inter SB" font-size="10.5" fill="#F3EBDD">${esc(l)}</text>`).join('');
  return svg(defs, body);
};

module.exports = { SC, BEAT, E, marketA, marketB, market, rays, speed, ice, office, chef, trio, kontrak, plate };
