const { S } = require('./lib');
const L = () => S.LW;

// ---------- Gaya 1: Sitcom ----------
function living({ close = false } = {}) {
  let s = `<rect width="270" height="480" fill="#E9DFC6"/>`;
  for (let x = 0; x < 270; x += 18) s += `<rect x="${x}" y="0" width="9" height="480" fill="#E2D6B9"/>`;
  s += `<rect y="372" width="270" height="108" fill="#A87C52"/><path d="M0 372 L270 372" stroke="#161616" stroke-width="${L()}"/>`;
  // painting: perahu nelayan
  s += `<rect x="96" y="66" width="150" height="104" fill="#FFFFFF" stroke="#161616" stroke-width="${L()}"/><rect x="104" y="74" width="134" height="88" fill="#F7E3A8"/>`;
  s += `<circle cx="206" cy="98" r="13" fill="#F28C3A" stroke="#161616" stroke-width="1.5"/><path d="M104 130 Q140 122 171 130 T238 130 L238 162 L104 162 Z" fill="#3E8CC4" stroke="#161616" stroke-width="1.5"/>`;
  s += `<path d="M130 130 L178 130 L170 142 L138 142 Z" fill="#8A4B22" stroke="#161616" stroke-width="1.5"/><path d="M153 129 L153 92 L176 126 Z" fill="#FFFFFF" stroke="#161616" stroke-width="1.5"/>`;
  // plant
  s += `<g stroke="#161616" stroke-width="1.6"><path d="M10 250 Q-6 200 18 170 Q22 210 14 250 Z" fill="#3E8F4E"/><path d="M14 250 Q30 190 58 176 Q44 220 22 252 Z" fill="#4FA35E"/><path d="M8 252 Q-10 230 -4 210" fill="none"/><path d="M4 250 L36 250 L32 290 L8 290 Z" fill="#C46A3A"/></g>`;
  // sofa
  s += `<g stroke="#161616" stroke-width="${L()}" stroke-linejoin="round"><path d="M40 268 Q40 236 70 236 L232 236 Q262 236 262 268 L262 330 L40 330 Z" fill="#6E8B5A"/>`;
  s += `<rect x="52" y="300" width="200" height="44" rx="10" fill="#7E9C68"/><rect x="28" y="286" width="34" height="78" rx="12" fill="#6E8B5A"/><rect x="242" y="286" width="34" height="78" rx="12" fill="#6E8B5A"/>`;
  s += `<rect x="40" y="356" width="10" height="20" fill="#3A2A1A"/><rect x="252" y="356" width="10" height="20" fill="#3A2A1A"/></g>`;
  // table + teh + pisang goreng
  if (!close) {
    s += `<g stroke="#161616" stroke-width="${L()}"><ellipse cx="80" cy="420" rx="76" ry="22" fill="#C9935C"/><path d="M4 420 L4 432 Q80 458 156 432 L156 420" fill="#B07B48"/>`;
    s += `<path d="M98 382 L120 382 L117 412 L101 412 Z" fill="#B5542A" opacity="0.9"/><ellipse cx="54" cy="414" rx="30" ry="8" fill="#FFFFFF"/><path d="M34 410 Q44 398 58 404 Q66 396 74 408" fill="#D9932F"/></g>`;
  }
  return s;
}

function yardBlur() {
  return `<rect width="270" height="480" fill="url(#sky)"/><g filter="url(#blur8)"><circle cx="210" cy="90" r="40" fill="#FFF3B0"/><rect y="300" width="270" height="180" fill="#E8D2A0"/>
<rect x="20" y="180" width="10" height="200" fill="#9C7A45"/><rect x="240" y="180" width="10" height="200" fill="#9C7A45"/><rect x="20" y="200" width="230" height="5" fill="#9C7A45"/>
${[40, 70, 100, 130, 160, 190, 220].map(x => `<ellipse cx="${x}" cy="226" rx="9" ry="20" fill="#C9A46A"/>`).join('')}</g>`;
}

function jemuran() {
  let s = `<rect width="270" height="480" fill="url(#sky)"/><circle cx="222" cy="66" r="26" fill="#FFE27A" stroke="#161616" stroke-width="${L()}"/>`;
  s += `<g stroke="#F2B53A" stroke-width="3" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = Math.PI * a / 180; return `<path d="M${222 + 33 * Math.cos(r)} ${66 + 33 * Math.sin(r)} L${222 + 44 * Math.cos(r)} ${66 + 44 * Math.sin(r)}"/>`; }).join('')}</g>`;
  s += `<path d="M0 250 L30 230 L60 250 L90 228 L130 250 Z" fill="#C46A3A" stroke="#161616" stroke-width="1.6"/><rect x="8" y="250" width="110" height="40" fill="#F1E3C5" stroke="#161616" stroke-width="1.6"/>`;
  s += `<rect y="290" width="270" height="190" fill="#E8D2A0"/><path d="M0 290 L270 290" stroke="#161616" stroke-width="${L()}"/>`;
  s += `<g stroke="#161616" stroke-width="${L()}"><rect x="14" y="150" width="8" height="190" fill="#9C7A45"/><rect x="248" y="150" width="8" height="190" fill="#9C7A45"/></g>`;
  s += `<path d="M18 160 Q135 176 252 160" stroke="#5A4630" stroke-width="2" fill="none"/>`;
  // tampah with ikan asin
  for (const [cx, cy] of [[60, 400], [190, 420]]) {
    s += `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="15" fill="#C9A46A" stroke="#161616" stroke-width="${L()}"/>`;
    for (let i = -3; i <= 3; i++) s += `<ellipse cx="${cx + i * 13}" cy="${cy - 2}" rx="5" ry="2.4" fill="#E4CBA0" stroke="#7A5A30" stroke-width="0.8"/>`;
  }
  return s;
}

// ---------- Gaya 2: Noir gudang ----------
function gudang({ lamp = true, desk = false } = {}) {
  let s = `<rect width="270" height="480" fill="#17343E"/>`;
  s += `<rect x="40" y="60" width="190" height="180" fill="#5E97AE" stroke="#0B1A20" stroke-width="3"/>`;
  for (let x = 40; x <= 230; x += 38) s += `<path d="M${x} 60 L${x} 240" stroke="#0E2A33" stroke-width="4"/>`;
  for (let y = 60; y <= 240; y += 36) s += `<path d="M40 ${y} L230 ${y}" stroke="#0E2A33" stroke-width="4"/>`;
  s += `<path d="M96 96 L112 114 L104 120 M174 160 L186 150" stroke="#BFE3F0" stroke-width="1.5"/>`;
  s += `<path d="M0 40 L270 40 M0 40 L60 0 M270 40 L210 0" stroke="#0B1A20" stroke-width="8"/>`;
  s += `<rect y="330" width="270" height="150" fill="#0F242B"/><path d="M0 330 L270 330" stroke="#0B1A20" stroke-width="3"/>`;
  s += `<polygon points="40,240 230,240 300,480 -30,480" fill="#7FC0D8" opacity="0.08"/>`;
  // karung stacks
  const karung = (x, y, label) => `<g stroke="#161616" stroke-width="${L()}"><path d="M${x} ${y + 6} Q${x} ${y - 6} ${x + 16} ${y - 4} L${x + 54} ${y - 4} Q${x + 70} ${y - 6} ${x + 70} ${y + 6} L${x + 68} ${y + 40} Q${x + 35} ${y + 48} ${x + 2} ${y + 40} Z" fill="#B9A47A"/></g>${label ? `<text x="${x + 35}" y="${y + 22}" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="8" fill="#5A4426">${label}</text>` : ''}`;
  s += karung(-20, 300, 'TERI') + karung(-14, 262, 'TERI NASI') + karung(210, 300, 'TERI NASI') + karung(222, 262, '') + karung(196, 336, 'CUMI');
  if (desk) s += `<g stroke="#161616" stroke-width="${L()}"><rect x="30" y="330" width="210" height="18" fill="#5A3A22"/><rect x="40" y="348" width="190" height="90" fill="#46301C"/></g>`;
  if (lamp) s += `<path d="M135 0 L135 50" stroke="#0B1A20" stroke-width="2"/><path d="M118 62 L152 62 L144 48 L126 48 Z" fill="#2B2B2B" stroke="#161616" stroke-width="1.5"/><polygon points="120,62 150,62 240,420 30,420" fill="#FFD66B" opacity="0.16"/><ellipse cx="135" cy="63" rx="9" ry="3" fill="#FFE9A0"/>`;
  for (let i = 0; i < 18; i++) s += `<circle cx="${(i * 47.3) % 200 + 40}" cy="${(i * 83.7) % 300 + 80}" r="0.9" fill="#FFF3C0" opacity="0.6"/>`;
  return s;
}
const noir = (strength = 0.26) => `<rect width="270" height="480" fill="#0A2430" opacity="${strength}"/><rect width="270" height="480" fill="url(#vig)"/>`;

// ---------- Gaya 3: Warung pastel ----------
function warung({ counter = true } = {}) {
  let s = `<rect width="270" height="480" fill="#C6E9D8"/>`;
  for (let x = 0; x < 270; x += 30) s += `<path d="M${x} 0 L${x + 15} 0 L${x + 15} 34 Q${x + 7.5} 44 ${x} 34 Z" fill="#F7B6A3" stroke="#161616" stroke-width="1.2"/><path d="M${x + 15} 0 L${x + 30} 0 L${x + 30} 34 Q${x + 22.5} 44 ${x + 15} 34 Z" fill="#FFF6EC" stroke="#161616" stroke-width="1.2"/>`;
  // price board
  s += `<rect x="150" y="62" width="104" height="70" rx="5" fill="#3E5A4C" stroke="#161616" stroke-width="1.5"/><text x="202" y="82" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="9.5" fill="#FFF6EC">TERI NASI</text><text x="202" y="96" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="11" fill="#FFE27A">80rb/kg</text><text x="202" y="113" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="8" fill="#FFF6EC">CUMI ASIN · PEDA</text><text x="202" y="125" text-anchor="middle" font-family="Liberation Sans" font-weight="bold" font-size="7" fill="#BFE9D2">langsung dari produsen</text>`;
  // shelves with jars
  s += `<g stroke="#161616" stroke-width="1.4"><rect x="10" y="118" width="128" height="6" fill="#E8B98F"/><rect x="10" y="182" width="128" height="6" fill="#E8B98F"/>`;
  for (const [y, cs] of [[78, ['#F2D7A0', '#E8E2D2', '#F5C2A0']], [142, ['#E8E2D2', '#F2D7A0', '#F5C2A0']]]) cs.forEach((c, i) => { const x = 18 + i * 40; s += `<rect x="${x}" y="${y}" width="32" height="40" rx="6" fill="#FFFFFF" opacity="0.85"/><rect x="${x + 3}" y="${y + 14}" width="26" height="23" rx="4" fill="${c}"/><rect x="${x + 4}" y="${y - 6}" width="24" height="8" rx="2" fill="#F7B6A3"/>`; });
  s += `</g>`;
  // kerupuk hanging
  s += `<g stroke="#161616" stroke-width="1.2">${[150, 176, 202, 228].map(x => `<path d="M${x} 136 L${x} 148"/><path d="M${x - 9} 148 L${x + 9} 148 L${x + 7} 176 L${x - 7} 176 Z" fill="#FFF6EC" opacity="0.9"/><circle cx="${x}" cy="162" r="5" fill="#F5D38A"/>`).join('')}</g>`;
  s += `<rect y="392" width="270" height="88" fill="#F3D9C4"/>`;
  if (counter) s += `<g stroke="#161616" stroke-width="${L()}"><rect x="0" y="312" width="270" height="12" fill="#E8B98F"/><rect x="0" y="324" width="270" height="86" fill="#F7C9A9"/><rect x="14" y="334" width="242" height="52" rx="4" fill="#E6F6F0" opacity="0.8"/></g><g stroke="#161616" stroke-width="1">${[30, 70, 110, 150, 190, 230].map((x, i) => `<ellipse cx="${x}" cy="370" rx="14" ry="5" fill="${['#F2D7A0', '#E8E2D2', '#F5C2A0'][i % 3]}"/>`).join('')}</g>`;
  return s;
}

// ---------- Gaya 4: Sinetron malam ----------
function pasarMalam({ rays = false, rain = true, ice = true } = {}) {
  let s = `<rect width="270" height="480" fill="#2B1840"/>`;
  if (rays) s += `<g stroke="#3F2560" stroke-width="12">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M135 220 L${(135 + 400 * Math.cos(a)).toFixed(0)} ${(220 + 400 * Math.sin(a)).toFixed(0)}"/>`; }).join('')}</g>`;
  else {
    s += `<g stroke="#161616" stroke-width="1.5"><rect x="0" y="150" width="90" height="120" fill="#3A2456"/><rect x="180" y="140" width="90" height="130" fill="#3A2456"/></g>`;
    s += [20, 50, 80, 190, 220, 250].map((x, i) => `<circle cx="${x}" cy="${150 + (i % 2) * 6}" r="5" fill="#FFD66B"/><circle cx="${x}" cy="${150 + (i % 2) * 6}" r="11" fill="#FFD66B" opacity="0.25"/>`).join('');
  }
  s += `<rect y="350" width="270" height="130" fill="#1C1029"/>`;
  if (ice) s += `<g stroke="#161616" stroke-width="1.5">${[0, 58, 116].map(x => `<rect x="${x + 4}" y="352" width="54" height="34" rx="4" fill="#CDEBFA" opacity="0.9"/>`).join('')}</g>`;
  if (rain) s += `<g stroke="#9DB4E0" stroke-width="1.6" stroke-linecap="round" opacity="0.65">${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 53.7) % 280} ${(i * 97.3) % 470} l-5 15"/>`).join('')}</g>`;
  return s;
}
const lightning = (x = 200) => `<polygon points="${x},0 ${x - 30},96 ${x - 6},96 ${x - 40},200 ${x + 26},74 ${x},74 ${x + 22},0" fill="#FFE14D" stroke="#161616" stroke-width="1.5"/>`;

// ---------- Gaya 5: Wayang kelir ----------
function kelir({ waves = false } = {}) {
  let s = `<rect width="270" height="480" fill="url(#kelir)"/>`;
  s += `<rect y="0" width="270" height="14" fill="url(#parang)"/><rect y="404" width="270" height="76" fill="url(#parang)"/><path d="M0 404 L270 404 M0 14 L270 14" stroke="#E2B04A" stroke-width="2"/>`;
  if (waves) for (let r = 0; r < 3; r++) s += `<path d="M0 ${340 + r * 20} ${Array.from({ length: 10 }, (_, i) => `q13.5 -12 27 0`).join(' ')}" stroke="#3B2112" stroke-width="3" fill="none"/>`;
  return s;
}
function gunungan(cx, cy, s = 1) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M0 -120 Q46 -60 62 30 Q30 52 0 56 Q-30 52 -62 30 Q-46 -60 0 -120 Z" fill="#7A2E1A" stroke="#E2B04A" stroke-width="3"/>
<path d="M0 -100 L0 40 M0 -40 Q-24 -60 -30 -30 M0 -40 Q24 -60 30 -30 M0 0 Q-34 -14 -42 14 M0 0 Q34 -14 42 14 M0 -70 Q-14 -84 -18 -64 M0 -70 Q14 -84 18 -64" stroke="#E2B04A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<rect x="-22" y="30" width="44" height="22" fill="#3B2112" stroke="#E2B04A" stroke-width="2"/><path d="M-12 30 L-12 52 M0 30 L0 52 M12 30 L12 52" stroke="#E2B04A" stroke-width="1.5"/>
${[-40, -20, 20, 40].map((x, i) => `<circle cx="${x}" cy="${-20 + (i % 2) * 30}" r="3" fill="#E2B04A"/>`).join('')}</g>`;
}
function blencong(x = 135) { return `<circle cx="${x}" cy="40" r="60" fill="#FFF6D8" opacity="0.35"/>`; }

module.exports = { living, yardBlur, jemuran, gudang, noir, warung, pasarMalam, lightning, kelir, gunungan, blencong };
