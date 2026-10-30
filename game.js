/* Айзеренің шаңғы жарысы — Санның квадраты және кубы
   Таза HTML/CSS/JS. Интернетсіз жұмыс істейді. */
'use strict';
(() => {

/* ============================== КӨМЕКШІ ФУНКЦИЯЛАР ============================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SUP = { 2: '²', 3: '³' };
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const powv = (b, e) => Math.pow(b, e);
const mulStr = (b, e) => Array(e).fill(b).join(' · ');
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const GEN = ['нөлдің', 'бірдің', 'екінің', 'үштің', 'төрттің', 'бестің', 'алтының', 'жетінің', 'сегіздің', 'тоғыздың', 'онның'];
const readPow = (b, e) => (GEN[b] ? GEN[b] : b + ' санының') + (e === 2 ? ' квадраты' : ' кубы');
const cap1 = s => s[0].toUpperCase() + s.slice(1);
const PRAISE = ['Керемет!', 'Жарайсың!', 'Тамаша!', 'Дұп-дұрыс!', 'Мықтысың!', 'Супер!', 'Алға!'];

/* ============================== САҚТАУ ============================== */
const KEY = 'aizere_ski_v1';
const D = { name: '', mastery: {}, best: {}, stars: {}, muted: false, tfBest: 0, music: true };
try { Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { /* ignore */ } };

/* ============================== ШЕБЕРЛІК (адаптивті ЖИ) ============================== */
const FACTS = [];
for (let n = 1; n <= 10; n++) FACTS.push({ key: 's' + n, b: n, e: 2 });
for (let n = 1; n <= 5; n++)  FACTS.push({ key: 'c' + n, b: n, e: 3 });
const MASTER = 3;
const mScore = k => D.mastery[k] || 0;
function record(k, ok) {
  if (!k) return;
  const m = mScore(k);
  D.mastery[k] = ok ? Math.min(MASTER, m + 1) : Math.max(0, m - 2);
  save();
}
const masteredCount = () => FACTS.filter(f => mScore(f.key) >= MASTER).length;
function pickFact(filter, avoidKey) {
  let list = FACTS.filter(filter);
  if (list.length > 1 && avoidKey) list = list.filter(f => f.key !== avoidKey);
  const w = list.map(f => { const m = mScore(f.key); return m >= MASTER ? 1 : (MASTER - m + 1) ** 2; });
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}

/* ============================== ДЫБЫС ============================== */
const Sound = {
  ctx: null,
  init() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone(f, d, type = 'sine', vol = .15, delay = 0) {
    if (D.muted || !this.ctx) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d + .05);
  },
  good() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .14, 'triangle', .14, i * .07)); },
  bad()  { this.tone(260, .22, 'square', .07); this.tone(180, .35, 'square', .07, .15); },
  click(){ this.tone(700, .05, 'triangle', .08); },
  tick() { this.tone(880, .08, 'sine', .12); },
  go()   { this.tone(1175, .3, 'triangle', .15); },
  win()  { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this.tone(f, .2, 'triangle', .14, i * .11)); },
  swish(){ this.tone(300, .08, 'sine', .04); }
};

/* ============================== ҚАР / КОНФЕТТИ ФОНЫ ============================== */
const Snow = (() => {
  const cv = $('#snow'), ctx = cv.getContext('2d');
  let W = 0, H = 0, flakes = [], conf = [];
  function resize() { const d = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(W * H / 14000); flakes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 3, s: 15 + Math.random() * 35, p: Math.random() * 6 })); }
  function burst(n = 140) {
    const cols = ['#ff4d6d', '#2f6fed', '#ffc23f', '#22b866', '#8e5cf7', '#ff8a00'];
    for (let i = 0; i < n; i++) conf.push({ x: W / 2 + (Math.random() - .5) * W * .4, y: H * .35, vx: (Math.random() - .5) * 600, vy: -200 - Math.random() * 500, r: Math.random() * 6.28, vr: (Math.random() - .5) * 12, c: pick(cols), life: 3 + Math.random() * 1.5 });
  }
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (document.body.dataset.screen !== 'race') {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      for (const f of flakes) {
        f.y += f.s * dt; f.p += dt; f.x += Math.sin(f.p) * 12 * dt;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      for (const c of conf) {
        c.vy += 700 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; c.life -= dt; c.vx *= .99;
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-5, -3, 10, 6); ctx.restore();
      }
      conf = conf.filter(c => c.life > 0 && c.y < H + 20);
    }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', resize); resize(); requestAnimationFrame(frame);
  return { burst };
})();

/* ============================== ТҮСІНДІРМЕ ВИЗУАЛДАРЫ ============================== */
function gridHTML(n, color) {
  let s = `<div class="mini-grid" style="--n:${n};--c:${color}">`;
  for (let i = 0; i < n * n; i++) s += '<i></i>';
  return s + '</div>';
}
function powerVisual(b, e) {
  if (e === 2 && b >= 1 && b <= 10) return gridHTML(b, '#2f6fed') + `<p class="cap">${b} қатар, әр қатарда ${b} шаршы → ${b} · ${b} = ${b * b}</p>`;
  if (e === 3 && b >= 1 && b <= 5) {
    let s = '<div class="layers">';
    for (let l = 0; l < b; l++) s += `<div class="layer">${gridHTML(b, '#8e5cf7')}<span>${l + 1}-қабат</span></div>`;
    return s + `</div><p class="cap">${b} қабат, әр қабатта ${b} · ${b} = ${b * b} текше → ${b * b} · ${b} = ${b ** 3}</p>`;
  }
  return '';
}
const powerLine = (b, e) => `<div class="formula">${b}${SUP[e]} = ${mulStr(b, e)} = <b>${powv(b, e)}</b></div>`;
const RULE = {
  2: 'Санның <b>квадраты</b> — екі бірдей көбейткіштің көбейтіндісі: санды өзіне көбейтеміз.',
  3: 'Санның <b>кубы</b> — үш бірдей көбейткіштің көбейтіндісі: санды өзіне тағы екі рет көбейтеміз.'
};

/* ============================== ӨРНЕКТЕР ============================== */
function parseExpr(str) {
  const s = str.replace(/\s+/g, '').replace(/\^2/g, '²').replace(/\^3/g, '³')
    .replace(/[*×xх]/g, '·').replace(/[\/÷]/g, ':').replace(/[-–—]/g, '−');
  const re = /(\d+)([²³]?)|([+−·:])/g;
  const toks = []; let m, pos = 0;
  while ((m = re.exec(s))) {
    if (m.index !== pos) return null;
    pos = re.lastIndex;
    if (m[1] !== undefined) toks.push({ t: 'n', b: +m[1], e: m[2] === '²' ? 2 : m[2] === '³' ? 3 : 0 });
    else toks.push({ t: 'o', v: m[3] });
  }
  if (pos !== s.length || !toks.length) return null;
  for (let i = 0; i < toks.length; i++) if ((i % 2 === 0) !== (toks[i].t === 'n')) return null;
  if (toks[toks.length - 1].t !== 'n') return null;
  if (toks.some(t => t.t === 'n' && t.b > 1000)) return null;
  return toks;
}
const tokStr = toks => toks.map(t => t.t === 'n' ? t.b + (t.e ? SUP[t.e] : '') : ` ${t.v} `).join('');
function evalToks(toks, mis = false) {
  const steps = [];
  const list = toks.map(t => t.t === 'n' ? { t: 'n', v: t.e ? (mis ? t.b * t.e : powv(t.b, t.e)) : t.b } : t);
  const pw = toks.filter(t => t.t === 'n' && t.e);
  if (pw.length) steps.push({ title: 'Алдымен дәрежелерді есептейміз', lines: pw.map(t => `${t.b}${SUP[t.e]} = ${mulStr(t.b, t.e)} = <b>${powv(t.b, t.e)}</b>`) });
  if (pw.length && list.length > 1) steps.push({ title: 'Мәндерді орнына қоямыз', lines: [list.map(t => t.t === 'n' ? t.v : ` ${t.v} `).join('')] });
  const md = [];
  const out = [list[0]];
  for (let i = 1; i < list.length; i += 2) {
    const op = list[i].v, n = list[i + 1];
    if (op === '·' || op === ':') {
      const a = out[out.length - 1].v, bb = n.v;
      if (op === ':' && (bb === 0 || a % bb !== 0)) return { ok: false, reason: bb === 0 ? 'Нөлге бөлуге болмайды!' : `${a} : ${bb} — бүтін санға бөлінбейді.`, steps };
      const r = op === '·' ? a * bb : a / bb;
      md.push(`${a} ${op} ${bb} = <b>${r}</b>`);
      out[out.length - 1] = { t: 'n', v: r };
    } else { out.push(list[i], n); }
  }
  if (md.length) steps.push({ title: 'Көбейту мен бөлуді орындаймыз', lines: md });
  let acc = out[0].v; const as = [];
  for (let i = 1; i < out.length; i += 2) {
    const op = out[i].v, bb = out[i + 1].v, r = op === '+' ? acc + bb : acc - bb;
    as.push(`${acc} ${op} ${bb} = <b>${r}</b>`); acc = r;
  }
  if (as.length) steps.push({ title: 'Қосу мен азайтуды солдан оңға қарай орындаймыз', lines: as });
  return { ok: true, value: acc, steps };
}
const stepsHTML = steps => steps.map((s, i) => `<div class="step"><span class="tag">${i + 1}-қадам</span>${s.title}:<div class="formula" style="font-size:20px">${s.lines.join('<br>')}</div></div>`).join('');

/* ============================== СҰРАҚ ГЕНЕРАТОРЛАРЫ ============================== */
function finishOpts(ans, ds) {
  ds = [...new Set(ds)].filter(x => Number.isInteger(x) && x >= 0 && x !== ans).slice(0, 2);
  let k = 1;
  while (ds.length < 2) { const c = ans + k; if (c >= 0 && c !== ans && !ds.includes(c)) ds.push(c); k = k > 0 ? -k : -k + 1; }
  return shuffle([ans, ...ds]);
}

function genDirect(f) {
  const { b, e } = f, ans = powv(b, e), mis = b * e;
  let c = e === 2 ? [(b + 1) ** 2, (b - 1) ** 2, b ** 3, b * b + b, b * 10] : [b * b, (b + 1) ** 3, (b - 1) ** 3, b ** 3 + b, b * b * 2];
  c = shuffle([...new Set(c)].filter(x => x > 0 && x !== ans && x !== mis));
  const ds = [];
  if (mis !== ans) ds.push(mis);
  ds.push(...c);
  return {
    hint: `${cap1(readPow(b, e))} неге тең?`,
    text: `${b}${SUP[e]} = ?`, ans, opts: finishOpts(ans, ds), fact: f.key,
    explain(ch) {
      let d;
      if (ch === mis && mis !== ans) d = `Сен ${b} · ${e} = ${ch} деп есептедің. Бірақ ${b}${SUP[e]} ≠ ${b} · ${e}! Кішкене ${SUP[e]} саны — <b>неше рет көбейткіш етіп алатынымызды</b> көрсетеді.`;
      else if (e === 3 && ch === b * b) d = `${ch} — бұл ${b}² мәні. Ал ${b}³ үшін ${b} санын көбейткіш ретінде <b>3 рет</b> аламыз.`;
      else if (e === 2 && ch === b ** 3) d = `${ch} — бұл ${b}³ мәні (куб). Квадратта көбейткіш <b>екеу</b> ғана.`;
      else if (ch === (b + 1) ** e) d = `${ch} — бұл ${b + 1}${SUP[e]} мәні. Абай бол, бізде ${b} саны.`;
      else if (b > 1 && ch === (b - 1) ** e) d = `${ch} — бұл ${b - 1}${SUP[e]} мәні. Абай бол, бізде ${b} саны.`;
      else d = 'Асықпай, біртіндеп көбейтейік:';
      return `<div class="diag">${d}</div>${powerLine(b, e)}${powerVisual(b, e)}<p>Оқылуы: «${readPow(b, e)}»</p>`;
    }
  };
}

function genReverse(f) {
  const { b, e } = f, v = powv(b, e);
  const ds = [];
  if (v % e === 0 && v / e !== b) ds.push(v / e);
  ds.push(...shuffle([b + 1, b - 1, b + 2, v].filter(x => x > 0 && x !== b)));
  const word = e === 2 ? 'Квадраты' : 'Кубы';
  return {
    hint: `${word} ${v} болатын сан қандай?`, text: `?${SUP[e]} = ${v}`, ans: b, opts: finishOpts(b, ds), fact: f.key,
    explain(ch) {
      let d;
      if (ch * e === v && ch !== b) d = `Сен ${v} : ${e} = ${ch} деп бөлдің. Бірақ тексеріп көр: ${ch}${SUP[e]} = ${mulStr(ch, e)} = ${powv(ch, e)}, ал ${v} емес.`;
      else d = `Тексеріп көрейік: ${ch}${SUP[e]} = ${mulStr(ch, e)} = ${powv(ch, e)}. Бұл ${v} емес.`;
      return `<div class="diag">${d}</div><p>Өзін-өзіне ${e === 2 ? 'көбейткенде' : 'үш рет көбейткенде'} ${v} шығатын сан — <b>${b}</b>:</p>${powerLine(b, e)}${powerVisual(b, e)}`;
    }
  };
}

const TEXTBOOK = ['2^3*3^2', '4^2:2^2', '4^2:2^3', '2^3:2^2', '9^2:3^2', '5^2:1^3', '8^2+4^3-5^2', '6^2+3^2-2^3', '9^2-3^3+7^2', '4^3-3^3+2^3', '8^2-2^3-5^2', '9^2+3^3-7^2', '6^2+2^2-2^3'];
function randExpr() {
  const t = rnd(1, 4);
  if (t === 1) for (;;) { const a = rnd(2, 9), b = rnd(1, 4), c = rnd(1, 8); if (a * a + b ** 3 - c * c >= 0) return `${a}^2+${b}^3-${c}^2`; }
  if (t === 2) for (;;) { const a = rnd(3, 9), b = rnd(1, 4), c = rnd(1, 6); if (a * a - b ** 3 >= 0) return `${a}^2-${b}^3+${c}^2`; }
  if (t === 3) { const a = rnd(1, 3), b = rnd(2, 5); return Math.random() < .5 ? `${a}^3*${b}^2` : `${b}^2*${a}^3`; }
  for (let i = 0; i < 500; i++) {
    const a = rnd(2, 10), b = rnd(1, 5), ea = pick([2, 3]), eb = pick([2, 3]);
    if (ea === 3 && a > 5) continue;
    if (b === 1 && Math.random() < .7) continue;
    const A = a ** ea, B = b ** eb;
    if (A % B === 0 && A !== B) return `${a}^${ea}:${b}^${eb}`;
  }
  return '6^2:2^2';
}
function genExpr(src) {
  const s = src || (Math.random() < .5 ? pick(TEXTBOOK) : randExpr());
  const toks = parseExpr(s), r = evalToks(toks), ans = r.value, m = evalToks(toks, true);
  const mis = m.ok ? m.value : -1;
  const ds = [];
  if (mis !== ans && mis >= 0) ds.push(mis);
  ds.push(...shuffle([ans + 10, ans - 10, ans + 1, ans - 1, ans + 2, ans * 2].filter(x => x >= 0)));
  return {
    hint: 'Өрнектің мәнін тап', text: tokStr(toks), ans, opts: finishOpts(ans, ds), fact: null,
    explain(ch) {
      const d = ch === mis ? `Сен дәрежені көбейтумен шатастырдың: мысалы, ${toks[0].b}${SUP[toks[0].e] || ''} ≠ ${toks[0].b} · ${toks[0].e || 1}. Есіңде болсын: дәреже — бірдей көбейткіштер!`
        : 'Ереже: алдымен <b>дәрежелер</b>, содан кейін <b>көбейту мен бөлу</b>, соңында <b>қосу мен азайту</b>.';
      return `<div class="diag">${d}</div>${stepsHTML(r.steps)}<div class="ok-box">Жауабы: <b>${ans}</b></div>`;
    }
  };
}

const SQ = new Set(); for (let i = 0; i <= 15; i++) SQ.add(i * i);
const CU = new Set(); for (let i = 0; i <= 6; i++) CU.add(i ** 3);
const isSpecial = x => SQ.has(x) || CU.has(x);
function describeNum(x) {
  const parts = [];
  const r = Math.round(Math.sqrt(x)), c = Math.round(Math.cbrt(x));
  if (r * r === x) parts.push(`${x} = ${r} · ${r} = <b>${r}²</b> — квадрат сан ✔`);
  if (c ** 3 === x) parts.push(`${x} = ${c} · ${c} · ${c} = <b>${c}³</b> — куб сан ✔`);
  if (!parts.length) {
    const k = Math.floor(Math.sqrt(x)), q = Math.floor(Math.cbrt(x + 1e-9));
    parts.push(`${x} — квадрат сан емес: ${k}² = ${k * k}, ${k + 1}² = ${(k + 1) ** 2}, ал ${x} олардың арасында.`);
    parts.push(`${x} — куб сан да емес: ${q}³ = ${q ** 3}, ${q + 1}³ = ${(q + 1) ** 3}.`);
  }
  if (parts.length === 2 && r * r === x && c ** 3 === x) parts.push('Бұл сан әрі квадрат, әрі куб! 🤩');
  return parts.join('<br>');
}
function genSqCube() {
  const t = pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 8, 27, 125]);
  const ds = []; let tries = 0;
  while (ds.length < 2 && tries++ < 300) {
    const x = Math.random() < .65 ? t + pick([-3, -2, -1, 1, 2, 3, 5, -5, 10, -10]) : rnd(2, 130);
    if (x > 1 && !isSpecial(x) && !ds.includes(x)) ds.push(x);
  }
  return {
    hint: 'Қай сан — бір санның квадраты немесе кубы?', text: '🔍 Квадрат па, куб па?', ans: t, opts: shuffle([t, ...ds]), fact: null,
    explain(ch) { return `<div class="diag">${describeNum(ch)}</div><div class="ok-box">${describeNum(t)}</div>`; }
  };
}

/* ============================== ДЕҢГЕЙЛЕР ============================== */
const LEVELS = [
  { id: 'sq', name: 'Квадраттар', icon: '🟦', bg: '#dce9ff', desc: '1² … 10² — санды өзіне көбейт', T: 6.5,
    gen: (st) => { const f = pickFact(f => f.e === 2, st.lastKey); return Math.random() < .25 && f.b > 1 ? genReverse(f) : genDirect(f); } },
  { id: 'cu', name: 'Кубтар', icon: '🧊', bg: '#ece3ff', desc: '1³ … 5³ — үш бірдей көбейткіш', T: 7.5,
    gen: (st) => { const f = pickFact(f => f.e === 3, st.lastKey); return Math.random() < .25 && f.b > 1 ? genReverse(f) : genDirect(f); } },
  { id: 'sc', name: 'Квадрат па, куб па?', icon: '🔍', bg: '#fff1cf', desc: 'Квадрат немесе куб санды тап (оқулық, 7-тапсырма)', T: 7.5,
    gen: () => genSqCube() },
  { id: 'ex', name: 'Өрнектер', icon: '🧮', bg: '#dff7e9', desc: '8² + 4³ − 5² сияқты есептер (оқулықтан)', T: 12,
    gen: () => genExpr() },
  { id: 'ai', name: 'ЖИ-жаттықтырушы', icon: '🤖', bg: '#ffe0e6', desc: 'Әлсіз жерлеріңді өзі тауып, жиірек сұрайды', T: 7.5,
    gen: (st) => { const f = pickFact(() => true, st.lastKey); return Math.random() < .25 && f.b > 1 ? genReverse(f) : genDirect(f); } }
];
const levelById = id => LEVELS.find(l => l.id === id);

/* ============================== ЭКРАНДАР ============================== */
let current = 'menu';
let Learn, Race, TF, Diag, Result, Break;
function show(id) {
  if (current === 'race' && id !== 'race') Race.stop();
  if (current === 'tf' && id !== 'tf') TF.stop();
  if (current === 'diag' && id !== 'diag') Diag.stop();
  if (current === 'break' && id !== 'break') Break.stop();
  current = id;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'scr-' + id));
  document.body.dataset.screen = id;
  window.scrollTo(0, 0);
  if (id === 'menu') renderMenu();
  if (id === 'levels') renderLevels();
  if (id === 'learn') Learn.enter();
  if (id === 'map') renderMap();
  if (id === 'tf') TF.enter();
  if (id === 'diag') Diag.enter();
  if (id === 'break') Break.enter();
}
$$('[data-go]').forEach(b => b.addEventListener('click', () => { Sound.init(); Sound.click(); show(b.dataset.go); }));
$('#btn-home').addEventListener('click', () => { Sound.click(); show('menu'); });
const soundBtn = $('#btn-sound');
const paintSound = () => { soundBtn.textContent = D.muted ? '🔇' : '🔊'; };
soundBtn.addEventListener('click', () => { D.muted = !D.muted; save(); paintSound(); Sound.init(); Sound.click(); if (Break) Break.applyVolume(); });
paintSound();

const nameIn = $('#player-name');
nameIn.value = D.name || '';
nameIn.addEventListener('input', () => { D.name = nameIn.value.trim(); save(); });

function renderMenu() {
  const n = masteredCount();
  $('#mm-text').textContent = `${n} / ${FACTS.length}`;
  $('#mm-bar').style.width = (n / FACTS.length * 100) + '%';
}

const starsStr = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);
function renderLevels() {
  const box = $('#level-list'); box.innerHTML = '';
  LEVELS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'level'; b.type = 'button';
    const best = D.best[l.id];
    b.innerHTML = `<div class="lv-ic" style="background:${l.bg}">${l.icon}</div><div><b>${l.name}</b><small>${l.desc}</small>
      <div class="lv-stars">${starsStr(D.stars[l.id] || 0)}</div>${best ? `<div class="lv-best">Үздік уақыт: ${best.toFixed(1)} с</div>` : ''}</div>`;
    b.addEventListener('click', () => { Sound.init(); Sound.click(); Race.start(l.id); });
    box.appendChild(b);
  });
}

/* ============================== ҮЙРЕНУ ============================== */
Learn = (() => {
  const cv = $('#viz'), ctx = cv.getContext('2d');
  const range = $('#n-range');
  let e = 2, n = 3, t0 = 0, raf = 0, W = 0, H = 0;
  const MAXN = { 2: 10, 3: 6 };

  function setE(v) { e = v; $$('.tab').forEach(t => t.classList.toggle('active', +t.dataset.e === e)); range.max = MAXN[e]; if (n > MAXN[e]) n = MAXN[e]; range.value = n; update(); }
  function setN(v) { n = clamp(v, 1, MAXN[e]); range.value = n; update(); }
  function update() {
    const v = powv(n, e);
    $('#lf-formula').innerHTML = `${n}${SUP[e]} = ${mulStr(n, e)} = <span class="ans">${v}</span>`;
    $('#lf-read').textContent = `Оқылуы: «${readPow(n, e)}»`;
    $('#lf-rule').innerHTML = RULE[e] + (e === 2
      ? `<br>🟦 Неге «квадрат»? Қабырғасы ${n} болатын квадратқа ${n} · ${n} = <b>${v}</b> кішкене шаршы сыяды.`
      : `<br>🧊 Неге «куб»? Қыры ${n} болатын кубты ${n} · ${n} · ${n} = <b>${v}</b> кішкене текшеден құрастырамыз.`);
    $('#lf-table-title').textContent = e === 2 ? 'Квадраттар кестесі (басып көр):' : 'Кубтар кестесі (басып көр):';
    const tb = $('#lf-table'); tb.innerHTML = '';
    for (let i = 1; i <= MAXN[e]; i++) {
      const c = document.createElement('button'); c.type = 'button';
      c.className = 'chip' + (i === n ? ' on' : '');
      c.textContent = `${i}${SUP[e]} = ${powv(i, e)}`;
      c.addEventListener('click', () => { Sound.click(); setN(i); });
      tb.appendChild(c);
    }
    t0 = performance.now(); Sound.swish();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  }
  function resize() { const r = cv.getBoundingClientRect(); const d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function draw(t) {
    if (current !== 'learn') return;
    if (!W) resize();
    ctx.clearRect(0, 0, W, H);
    const total = powv(n, e);
    const dur = Math.min(2600, 500 + total * (e === 2 ? 25 : 12));
    const p = clamp((t - t0) / dur, 0, 1);
    const shown = Math.round(p * total);
    if (e === 2) {
      const pad = 34, size = Math.min(W - pad * 2, H - pad * 2), cell = size / n, ox = (W - size) / 2, oy = (H - size) / 2 + 6;
      ctx.font = '800 14px Nunito, Segoe UI, sans-serif'; ctx.fillStyle = '#5a6a8f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) { ctx.fillText(i + 1, ox + cell * (i + .5), oy - 14); ctx.fillText(i + 1, ox - 16, oy + cell * (i + .5)); }
      for (let k = 0; k < n * n; k++) {
        const r = Math.floor(k / n), c = k % n, x = ox + c * cell, y = oy + r * cell;
        ctx.fillStyle = '#eef3fc'; rr(x + 2, y + 2, cell - 4, cell - 4, Math.min(8, cell / 5)); ctx.fill();
        if (k < shown) {
          const age = clamp((p * total - k) / 3, 0, 1), s = .6 + .4 * age;
          const cx = x + cell / 2, cy = y + cell / 2, w = (cell - 4) * s;
          ctx.fillStyle = `hsl(${215 + r * 4},85%,${58 - c}%)`; rr(cx - w / 2, cy - w / 2, w, w, Math.min(8, cell / 5)); ctx.fill();
        }
      }
      ctx.strokeStyle = '#2f6fed'; ctx.lineWidth = 3; ctx.strokeRect(ox, oy, size, size);
    } else {
      const a = Math.min(W / (2 * n * .866), (H - 20) / (2 * n)) * .88;
      const ox = W / 2, oy = (H - 2 * n * a) / 2 + n * a + 4;
      const P = (x, y, z) => [ox + (x - y) * a * .866, oy + (x + y) * a * .5 - z * a];
      const order = [];
      for (let z = 0; z < n; z++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) order.push([x, y, z]);
      const vis = order.slice(0, shown).sort((A, B) => (A[0] + A[1] + A[2]) - (B[0] + B[1] + B[2]) || A[2] - B[2]);
      ctx.strokeStyle = 'rgba(142,92,247,.35)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
      const C = [[0, 0, 0], [n, 0, 0], [n, n, 0], [0, n, 0], [0, 0, n], [n, 0, n], [n, n, n], [0, n, n]].map(q => P(...q));
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => { ctx.beginPath(); ctx.moveTo(...C[i]); ctx.lineTo(...C[j]); ctx.stroke(); });
      ctx.setLineDash([]);
      const face = (pts, fill) => { ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach(q => ctx.lineTo(...q)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = 'rgba(40,20,90,.35)'; ctx.lineWidth = 1; ctx.stroke(); };
      for (const [x, y, z] of vis) {
        const hue = 255 + z * 12;
        face([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], `hsl(${hue},90%,80%)`);
        face([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], `hsl(${hue},70%,62%)`);
        face([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], `hsl(${hue},65%,50%)`);
      }
    }
    const layer = e === 3 ? Math.min(n, Math.floor(shown / (n * n)) + (shown % (n * n) ? 1 : 0)) : 0;
    $('#viz-count').textContent = e === 2 ? `Шаршылар: ${shown} / ${total}` : `Текшелер: ${shown} / ${total}  ·  қабат: ${layer} / ${n}`;
    if (p < 1) raf = requestAnimationFrame(draw);
  }
  range.addEventListener('input', () => setN(+range.value));
  $('#n-minus').addEventListener('click', () => setN(n - 1));
  $('#n-plus').addEventListener('click', () => setN(n + 1));
  $$('.tab').forEach(t => t.addEventListener('click', () => { Sound.click(); setE(+t.dataset.e); }));
  addEventListener('resize', () => { if (current === 'learn') { resize(); t0 = 0; raf = requestAnimationFrame(draw); } });

  /* ---- Ақылман: ЖИ-көмекші (ережеге негізделген, интернетсіз) ---- */
  const chat = $('#chat'), inp = $('#chat-in');
  function say(html, who = 'bot') { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; }
  function answer(raw) {
    let s = raw.toLowerCase().trim();
    if (!s) return;
    const isQ = /(па|ма|ба|пе|ме|бе)\s*\??\s*$/.test(s) || /\?\s*$/.test(s);
    const nums = s.match(/\d+/g) || [];
    const hasWord = /квадрат|куб/.test(s);
    if (nums.length === 1 && (isQ && hasWord && !/(квадраты|кубы|неге|қанша)/.test(s) || /^\s*\d+\s*\??\s*$/.test(s) || /(сан|тексер)/.test(s) && !/[²³^]/.test(s) && !/(квадраты|кубы|квадратын|кубын)/.test(s))) {
      const x = +nums[0];
      if (x > 1000000) return say('Бұл сан тым үлкен 🙂 1 000 000-нан кішірек сан жаз.');
      return say(`<b>${x}</b> санын тексерейік:<br>${describeNum(x)}`);
    }
    s = s.replace(/(\d+)[^\d+\-−·*:×x\/]*?квадрат[а-яәіңғүұқөһ]*/g, '$1²')
         .replace(/(\d+)[^\d+\-−·*:×x\/]*?куб[а-яәіңғүұқөһ]*/g, '$1³')
         .replace(/[^0-9²³^+\-−–·*:×xх\/÷\s]/g, '').replace(/[=?]/g, '');
    const toks = parseExpr(s);
    if (!toks) return say('Кешір, түсінбедім 🤔 Былай жазып көр: <b>5²</b>, <b>3³</b>, <b>8² + 4³ − 5²</b>, <b>7 квадраты</b> немесе <b>49</b>.');
    if (toks.length === 1 && toks[0].e) {
      const { b, e: ee } = toks[0];
      if (powv(b, ee) > 1e9) return say('Бұл сан тым үлкен шығады 🙂 Кішірек сан жаз.');
      return say(`${RULE[ee]}${powerLine(b, ee)}${b <= 10 ? powerVisual(b, ee) : ''}Оқылуы: «${readPow(b, ee)}» ✨`);
    }
    if (toks.length === 1) return say(`<b>${toks[0].b}</b> санын тексерейік:<br>${describeNum(toks[0].b)}`);
    const r = evalToks(toks);
    if (!r.ok) return say(`${stepsHTML(r.steps)}<div class="diag">${r.reason}</div>`);
    say(`<b>${tokStr(toks)}</b> өрнегін шешейік 👇${stepsHTML(r.steps)}<div class="ok-box">Жауабы: <b>${r.value}</b> 🎉</div>`);
  }
  $('#chat-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const v = inp.value.trim(); if (!v) return;
    Sound.init(); Sound.click();
    say(esc(v), 'me'); inp.value = '';
    setTimeout(() => answer(v), 250);
  });
  $$('.sup-keys button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k;
    if (k === 'C') inp.value = inp.value.slice(0, -1); else inp.value += k;
    inp.focus();
  }));
  const EX = ['7²', '4³', '8² + 4³ − 5²', '2³ · 3²', '9² : 3²', '64', '50 квадрат па?', '6 кубы'];
  const exBox = $('#chat-examples');
  EX.forEach(x => { const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = x; c.addEventListener('click', () => { inp.value = x; $('#chat-form').requestSubmit(); }); exBox.appendChild(c); });

  let greeted = false;
  return {
    enter() {
      resize(); update();
      if (!greeted) { greeted = true; say(`Сәлем${D.name ? ', <b>' + esc(D.name) + '</b>' : ''}! 👋 Мен — Ақылман. Маған мысал жаз, мен оны қадам-қадаммен шешіп көрсетемін. Санды жазсаң — оның квадрат не куб екенін тексеремін.`); }
    },
    open(ee, nn) { show('learn'); setE(ee); setN(nn); }
  };
})();

/* ============================== СЫЗБА БОЙЫНША ЕСЕП (6-тапсырма) ============================== */
Diag = (() => {
  const ACTS = {
    skate: { nm: 'конькимен сырғанау', ic: '⛸️', verb: 'конькимен сырғанады', col: '#2f6fed' },
    ski:   { nm: 'шаңғымен жүру', ic: '⛷️', verb: 'шаңғымен жүрді',     col: '#8e5cf7' },
    walk:  { nm: 'жаяу жүру', ic: '🚶‍♀️', verb: 'жаяу жүрді',        col: '#22b866' },
    run:   { nm: 'жүгіру', ic: '🏃‍♀️', verb: 'жүгірді',           col: '#ff8a00' },
    bike:  { nm: 'велосипед тебу', ic: '🚴‍♀️', verb: 'велосипед тепті',   col: '#e8365a' }
  };
  const ROUND = 8;
  const svg = $('#dg-svg'), stepBox = $('#dg-step'), storyBox = $('#dg-story');
  let st = null, raf = 0;

  function make(i) {
    let ids, vals, unk;
    if (i === 0) { ids = ['skate', 'ski', 'walk']; vals = [25, 30, 15]; unk = 2; }
    else {
      const n = i === 1 ? 2 : pick([2, 3, 3]);
      ids = shuffle(Object.keys(ACTS)).slice(0, n);
      vals = ids.map(() => rnd(2, 8) * 5);
      const r = Math.random();
      unk = (i === 2 || r < .25) ? n : rnd(0, n - 1);
    }
    const T = vals.reduce((a, b) => a + b, 0);
    const n = ids.length;
    const ans = unk === n ? T : vals[unk];
    const qOf = k => k === n ? 'Айзере барлығы неше минут жаттықты?' : `Айзере неше минут ${ACTS[ids[k]].verb}?`;
    const opts = shuffle([...Array(n + 1).keys()].filter(k => k !== unk)).slice(0, 2).concat(unk);
    return { ids, vals, unk, T, n, ans, qOf, qOpts: shuffle(opts) };
  }

  function storyHTML(p, withQ) {
    const ord = p.n === 2 ? ['Алдымен', 'содан кейін'] : ['Алдымен', 'содан кейін', 'соңында'];
    const parts = p.ids.map((id, k) => `${ord[k]} ${k === p.unk ? 'біраз уақыт' : '<b>' + p.vals[k] + ' мин</b>'} ${ACTS[id].verb}`);
    let s = `Айзере смарт-сағатының көмегімен жаттығу режимдерін тексерді. ${parts.join(', ')}.`;
    if (p.unk !== p.n) s += ` Барлығы <b>${p.T} мин</b> жаттықты.`;
    if (withQ) s += `<span class="dg-q">❓ ${p.qOf(p.unk)}</span>`;
    return `<b>📖 Ақылман құрастырған есеп:</b><br>${s}`;
  }

  const X0 = 40, X1 = 600, Y = 112;
  function bounds(p) {
    const xs = [X0]; let acc = 0;
    p.vals.forEach(v => { acc += v; xs.push(X0 + (X1 - X0) * acc / p.T); });
    return xs;
  }
  function draw(p, reveal, runX, runIc, clock) {
    const xs = bounds(p);
    let s = '';
    s += `<line x1="${X0}" y1="${Y}" x2="${X1}" y2="${Y}" stroke="#1d2b4f" stroke-width="4" stroke-linecap="round"/>`;
    p.vals.forEach((v, k) => {
      const a = xs[k], b = xs[k + 1], m = (a + b) / 2, A = ACTS[p.ids[k]];
      const isU = k === p.unk;
      const lab = isU && !reveal ? '? мин' : `${v} мин`;
      const col = isU ? (reveal ? '#178a4b' : '#e8365a') : '#1d2b4f';
      s += `<rect x="${a + 2}" y="${Y - 6}" width="${b - a - 4}" height="12" rx="6" fill="${A.col}" opacity=".25"/>`;
      s += `<line x1="${a + 6}" y1="78" x2="${b - 12}" y2="78" stroke="${A.col}" stroke-width="3"/>`;
      s += `<path d="M${b - 4} 78 l-11 -6 v12 z" fill="${A.col}"/>`;
      s += `<text x="${m}" y="68" text-anchor="middle" font-size="17" fill="${col}">${lab}</text>`;
      s += `<text x="${m}" y="40" text-anchor="middle" font-size="28">${A.ic}</text>`;
    });
    xs.forEach(x => { s += `<line x1="${x}" y1="${Y - 10}" x2="${x}" y2="${Y + 10}" stroke="#1d2b4f" stroke-width="3"/>`; });
    const mid = (X0 + X1) / 2;
    s += `<path d="M${X0} 128 Q${X0} 140 ${X0 + 12} 140 L${mid - 12} 140 Q${mid} 140 ${mid} 152 Q${mid} 140 ${mid + 12} 140 L${X1 - 12} 140 Q${X1} 140 ${X1} 128" fill="none" stroke="#5a6a8f" stroke-width="2.5"/>`;
    const tU = p.unk === p.n;
    s += `<text x="${mid}" y="172" text-anchor="middle" font-size="18" fill="${tU ? (reveal ? '#178a4b' : '#e8365a') : '#1d2b4f'}">${tU && !reveal ? '? мин' : p.T + ' мин'} (барлығы)</text>`;
    s += `<text x="${X1 + 18}" y="${Y + 2}" text-anchor="middle" font-size="22">🏁</text>`;
    if (runX != null) {
      s += `<text x="${runX}" y="${Y - 12}" text-anchor="middle" font-size="26">${runIc}</text>`;
      s += `<text x="${X1}" y="20" text-anchor="end" font-size="16" fill="#1f4fb8">⏱ ${clock} мин</text>`;
    }
    svg.innerHTML = s;
  }
  function animateRun(p, done) {
    const t0 = performance.now(), dur = 2600, xs = bounds(p);
    cancelAnimationFrame(raf);
    const step = t => {
      if (!st) return;
      const q = clamp((t - t0) / dur, 0, 1), x = X0 + (X1 - X0) * q;
      let k = 0; while (k < p.n - 1 && x > xs[k + 1]) k++;
      draw(p, true, x, ACTS[p.ids[k]].ic, Math.round(p.T * q));
      if (q < 1) raf = requestAnimationFrame(step); else done && done();
    };
    raf = requestAnimationFrame(step);
  }

  function explainHTML(p) {
    const known = p.vals.filter((v, k) => k !== p.unk);
    if (p.unk === p.n) {
      return `<div class="ok-box">📐 Ереже: <b>бүтінді табу үшін бөліктерді қосамыз.</b></div>
        <div class="formula">${p.vals.join(' + ')} = <b>${p.T}</b> мин</div>`;
    }
    const sumK = known.reduce((a, b) => a + b, 0);
    let h = `<div class="ok-box">📐 Ереже: <b>белгісіз бөлікті табу үшін бүтіннен белгілі бөліктерді азайтамыз.</b></div>`;
    if (known.length > 1) h += `<div class="step"><span class="tag">1-қадам</span>Белгілі бөліктерді қосамыз:<div class="formula" style="font-size:20px">${known.join(' + ')} = <b>${sumK}</b> мин</div></div>
      <div class="step"><span class="tag">2-қадам</span>Бүтіннен азайтамыз:<div class="formula" style="font-size:20px">${p.T} − ${sumK} = <b>${p.ans}</b> мин</div></div>`;
    else h += `<div class="formula">${p.T} − ${sumK} = <b>${p.ans}</b> мин</div>`;
    h += `<p>✔ Тексеру: ${p.vals.join(' + ')} = ${p.T} мин</p>`;
    return h;
  }
  function diagnose(p, ch) {
    const known = p.vals.filter((v, k) => k !== p.unk), sumK = known.reduce((a, b) => a + b, 0);
    if (p.unk !== p.n) {
      if (ch === p.T + sumK) return `Сен барлық сандарды қостың. Бірақ ${p.T} мин — бұл <b>бүтін</b> (барлық уақыт), ол бөліктердің қосындысы. Белгісіз бөлікті табу үшін азайту керек!`;
      if (known.length > 1 && known.some(v => ch === p.T - v)) return 'Сен тек бір бөлікті азайттың. Бүтіннен <b>белгілі бөліктердің бәрін</b> азайту керек!';
      if (ch === sumK) return `${sumK} — бұл белгілі бөліктердің қосындысы ғана. Енді оны бүтіннен (${p.T}) азайт!`;
    } else {
      if (p.vals.some(v => ch === v)) return 'Бұл — бір бөлік қана. Сұрақ барлық уақыт туралы!';
    }
    return 'Сызбаға тағы бір қара: бүтін — үлкен жақшаның астындағы сан, бөліктер — жебелердің үстіндегі сандар.';
  }

  function render() {
    const p = st.p;
    $('#dg-num').textContent = `${st.i + 1} / ${ROUND}`;
    $('#dg-score').textContent = st.score;
    $('#dg-bar').style.width = (st.i / ROUND * 100) + '%';
    draw(p, false);
    storyBox.innerHTML = storyHTML(p, false);
    stepBox.innerHTML = `<h3><span class="tag">1-қадам</span>Есеп құрастыр: сызбадағы «?» белгісіне сәйкес сұрақты таңда</h3><div class="q-opts" id="dg-qopts"></div><div class="dg-feedback" id="dg-fb"></div>`;
    const box = $('#dg-qopts');
    p.qOpts.forEach(k => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'q-opt'; b.textContent = '❓ ' + p.qOf(k);
      b.addEventListener('click', () => chooseQ(k, b));
      box.appendChild(b);
    });
  }
  function chooseQ(k, btn) {
    const p = st.p;
    Sound.init();
    if (k === p.unk) {
      Sound.good(); btn.classList.add('ok');
      storyBox.innerHTML = storyHTML(p, true);
      setTimeout(() => { if (st) solveStep(); }, 500);
    } else {
      Sound.bad(); btn.classList.remove('bad'); void btn.offsetWidth; btn.classList.add('bad');
      st.qErr++;
      const known = k === p.n ? `барлық уақыт белгілі — ${p.T} мин` : `${ACTS[p.ids[k]].nm} уақыты белгілі — ${p.vals[k]} мин`;
      $('#dg-fb').innerHTML = `<div class="diag">🤖 Сызбада ${known}. Сұрақ <b>«?» тұрған жерге</b> қойылады — белгісізді табамыз!</div>`;
    }
  }
  function solveStep() {
    stepBox.innerHTML = `<h3><span class="tag">2-қадам</span>Есепті шығар</h3>
      <form class="ans-row" id="dg-form" autocomplete="off">
        <input id="dg-in" type="number" inputmode="numeric" min="0" max="999" aria-label="Жауап" placeholder="?">
        <span class="unit">мин</span>
        <button type="submit" class="btn btn-green">✔ Тексеру</button>
        <button type="button" class="btn btn-purple" id="dg-hint">🤖 Кеңес</button>
      </form>
      <div class="dg-feedback" id="dg-fb"></div>`;
    const inp = $('#dg-in'); inp.focus();
    $('#dg-form').addEventListener('submit', ev => { ev.preventDefault(); check(inp.value); });
    $('#dg-hint').addEventListener('click', hint);
  }
  function hint() {
    const p = st.p; st.hintLvl++;
    Sound.click();
    const rule = p.unk === p.n ? 'Бүтінді табу үшін бөліктерді қосамыз.' : 'Белгісіз бөлікті табу үшін бүтіннен белгілі бөліктерді азайтамыз.';
    const ex = p.unk === p.n ? `${p.vals.join(' + ')} = ?` : `${p.T} − ${p.vals.filter((v, k) => k !== p.unk).join(' − ')} = ?`;
    $('#dg-fb').innerHTML = `<div class="ok-box">💡 ${rule}${st.hintLvl >= 2 ? `<div class="formula" style="font-size:22px">${ex}</div>` : '<br><small>Тағы басып көр — келесі кеңес шығады.</small>'}</div>`;
  }
  function check(raw) {
    const p = st.p, fb = $('#dg-fb');
    const v = raw === '' ? NaN : Number(raw);
    if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) { fb.innerHTML = '<div class="diag">Жауапқа бүтін сан жаз 🙂</div>'; return; }
    $('#dg-form').querySelectorAll('button,input').forEach(x => { x.disabled = true; });
    if (v === p.ans) {
      st.correct++;
      const pts = st.hintLvl ? 5 : (st.qErr ? 8 : 10);
      st.score += pts; $('#dg-score').textContent = st.score;
      Sound.good();
      fb.innerHTML = `<div class="ok-box">🎉 ${pick(PRAISE)} +${pts} ⭐ Жауабы: <b>${p.ans} мин</b>. Айзере мәреге жетті!</div>${explainHTML(p)}`;
      animateRun(p, () => { Sound.win(); });
    } else {
      st.wrong++;
      Sound.bad();
      draw(p, true);
      fb.innerHTML = `<div class="diag">🤖 Сенің жауабың: <s>${v}</s>. ${diagnose(p, v)}</div>${explainHTML(p)}`;
      st.retry.push(p);
    }
    const nb = document.createElement('div'); nb.className = 'dg-actions';
    nb.innerHTML = `<button type="button" class="btn btn-blue" id="dg-next">${st.i + 1 >= ROUND ? '🏁 Нәтиже' : 'Келесі есеп ▶'}</button>`;
    fb.appendChild(nb);
    $('#dg-next').focus();
    $('#dg-next').addEventListener('click', next);
  }
  function next() {
    Sound.click();
    st.i++;
    if (st.i >= ROUND) return finish();
    st.qErr = 0; st.hintLvl = 0;
    if (st.retry.length && st.i >= 3 && Math.random() < .6) {
      const old = st.retry.shift(); let p;
      do { p = make(st.i); } while (p.n !== old.n && Math.random() < .8);
      st.p = p;
    } else st.p = make(st.i);
    render();
  }
  function finish() {
    const s = st, stars = s.wrong === 0 ? 3 : s.wrong <= 2 ? 2 : 1;
    if (stars > (D.stars.diag || 0)) { D.stars.diag = stars; save(); }
    cancelAnimationFrame(raf);
    Result.show({ won: true, stars, title: 'Сызба есептер шешілді!', score: s.score, correct: s.correct, total: ROUND, time: (performance.now() - s.t0) / 1000,
      again: () => show('diag'), next: null });
  }
  return {
    enter() { cancelAnimationFrame(raf); st = { i: 0, score: 0, correct: 0, wrong: 0, qErr: 0, hintLvl: 0, retry: [], t0: performance.now() }; st.p = make(0); render(); },
    stop() { cancelAnimationFrame(raf); st = null; },
    _make: make
  };
})();

/* ============================== СЕРГІТУ СӘТІ (3 минут, музыкамен) ============================== */
Break = (() => {
  const TOTAL = 180;
  const stage = $('#br-stage'), hero = $('#br-hero'), ring = $('#br-ring');
  const elTitle = $('#br-title'), elTask = $('#br-task'), elCount = $('#br-count'), elViz = $('#br-viz');
  const eq = $('#br-eq');
  for (let i = 0; i < 24; i++) eq.appendChild(document.createElement('i'));
  const bars = $$('i', eq);

  /* ---------- МУЗЫКА: WebAudio арқылы генерацияланатын көңілді трек ---------- */
  const Music = (() => {
    let ctx = null, master = null, noise = null, timer = 0, step = 0, nextT = 0, mode = 'party', on = false;
    const BPM = 124, S16 = 60 / BPM / 4;
    // Аккордтар: C — Am — F — G (әр аккорд = 1 такт)
    const CH = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
    const LEAD = [ // 64 қадам (4 такт), -1 = үзіліс
      72, -1, 76, -1, 79, -1, 76, 74, 72, -1, 67, -1, 72, -1, 74, -1,
      72, -1, 76, -1, 81, -1, 79, 76, 76, -1, 72, -1, 69, -1, 72, -1,
      69, -1, 72, -1, 77, -1, 76, 72, 69, -1, 65, -1, 69, -1, 72, -1,
      71, -1, 74, -1, 79, -1, 77, 74, 79, -1, 77, -1, 76, -1, 74, -1];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    function ensure() {
      Sound.init(); ctx = Sound.ctx; if (!ctx) return false;
      if (!master) {
        master = ctx.createGain(); master.connect(ctx.destination);
        const len = ctx.sampleRate * .5; noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      return true;
    }
    function vol() { return (D.muted || !D.music) ? 0 : .55; }
    function osc(type, f, t, d, v, dest = master) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + .05);
    }
    function kick(t) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .15);
      g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .25);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .3);
    }
    function hit(t, hp, d, v) {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise; f.type = 'highpass'; f.frequency.value = hp;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + d + .02);
    }
    function schedule(t, i) {
      const bar = Math.floor(i / 16) % 4, s = i % 16, ch = CH[bar];
      if (mode === 'calm') {
        if (s === 0) ch.forEach(m => osc('sine', hz(m + 12), t, S16 * 16, .07));
        if (s % 4 === 0) osc('triangle', hz(LEAD[i % 64] > 0 ? LEAD[i % 64] : 72), t, S16 * 3, .04);
        return;
      }
      if (s % 4 === 0) { kick(t); pulse(t); }
      if (s === 4 || s === 12) hit(t, 1500, .18, .35);
      if (s % 2 === 0) hit(t, 7000, .05, .12); else if (mode === 'party') hit(t, 9000, .03, .06);
      if (s % 2 === 0) osc('triangle', hz(ch[0] - 12 + (s % 8 === 6 ? 12 : 0)), t, S16 * 1.8, .32);
      const n = LEAD[i % 64];
      if (n > 0) osc('square', hz(n), t, S16 * 1.6, .06);
      if (mode === 'party' && s % 4 === 2) ch.forEach(m => osc('sawtooth', hz(m + 12), t, S16 * .9, .025));
    }
    function pulse(t) {
      const delay = Math.max(0, (t - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (!on) return;
        stage.classList.remove('beat'); void stage.offsetWidth; stage.classList.add('beat');
        bars.forEach(b => { b.style.height = (10 + Math.random() * (mode === 'calm' ? 25 : 90)) + '%'; });
      }, delay);
    }
    function loop() {
      while (nextT < ctx.currentTime + .12) { schedule(nextT, step); nextT += S16; step++; }
    }
    return {
      start() { if (on || !ensure()) return; on = true; master.gain.value = vol(); nextT = ctx.currentTime + .05; timer = setInterval(loop, 25); },
      stop() { on = false; clearInterval(timer); if (master) master.gain.value = 0; bars.forEach(b => { b.style.height = '10%'; }); },
      setMode(m) { mode = m; },
      apply() { if (master) master.gain.value = on ? vol() : 0; },
      get on() { return on; }
    };
  })();

  /* ---------- Бағдарлама (сценарий) ---------- */
  const TF_POOL = [['3² = 9', true], ['2³ = 6', false], ['5² = 25', true], ['1³ = 3', false], ['4² = 16', true], ['10² = 20', false], ['2³ = 8', true], ['3³ = 9', false], ['6² = 36', true], ['2² = 8', false]];
  function build() {
    const tfs = shuffle(TF_POOL.slice()).slice(0, 6);
    const segs = [
      { k: 'intro', dur: 6, hue: 280, hero: '🙆‍♀️', mv: 'mv-sway', title: 'Орныңнан тұр! 🎶', task: 'Музыкаға қосылып, тербел!' },
      { k: 'reps', hue: 200, hero: '🙆‍♀️', mv: 'mv-reach', title: 'Созыламыз 🌤️', task: 'Қолыңды жоғары соз — күнге жет!', pre: 2, n: 8, iv: 1.25, viz: null },
      { k: 'reps', hue: 330, hero: '🤸‍♀️', mv: 'mv-jump', title: 'Секіреміз! 🐸', base: 2, e: 2, act: 'рет секір!', pre: 4, iv: 1.1, viz: 'sq' },
      { k: 'reps', hue: 30, hero: '🏋️‍♀️', mv: 'mv-squat', title: 'Отырып-тұрамыз 💪', base: 3, e: 2, act: 'рет отырып-тұр!', pre: 4, iv: 1.5, viz: 'sq' },
      { k: 'reps', hue: 190, hero: '⛷️', mv: 'mv-ski', title: 'Шаңғышы Айзере ⛷️', base: 2, e: 3, act: 'рет таяқпен итеріл! (қолды алға-артқа сілте)', pre: 4, iv: 1.2, viz: 'cu' },
      { k: 'draw', hue: 140, hero: '✍️', mv: 'mv-reach', title: 'Ауада квадрат сыз 🟦', task: 'Квадраттың <b>4</b> бірдей қабырғасы бар! Қолыңмен ауада <b>3</b> квадрат сыз.', pre: 3, n: 12, iv: 1 },
      { k: 'tf', hue: 50, title: 'Ақиқат па, жалған ба? 🤔', task: 'Ақиқат — <b>қолды жоғары көтер 🙌</b><br>Жалған — <b>отыр 🧎</b>', pre: 3, items: tfs, each: 5 },
      { k: 'reps', hue: 300, hero: '👏', mv: 'mv-clap', title: 'Шапалақ! 👏', base: 4, e: 2, act: 'рет шапалақта!', pre: 4, iv: .75, viz: 'sq' },
      { k: 'reps', hue: 10, hero: '🕺', mv: 'mv-stomp', title: 'Топ-топ! 🦶', expr: '1³ + 2²', val: 5, show: '1³ + 2² = 1 + 4 = <b>5</b>', act: 'рет аяқпен топ-топ!', pre: 4, iv: 1.3, viz: null },
      { k: 'breath', hue: 220, hero: '🧘‍♀️', mv: 'mv-breath', title: 'Тынысты басамыз 🌬️', pre: 2, n: 3, iv: 8 },
      { k: 'outro', hue: 280, hero: '🏆', mv: 'mv-party', title: 'Жарайсың! 🎉', task: 'Сен 3 минут бойы <b>квадрат пен кубпен</b> бірге қозғалдың! Енді сабаққа дайынсың 💪' }
    ];
    let used = 0;
    for (const s of segs) {
      if (s.k === 'reps') { s.n = s.n || (s.val != null ? s.val : powv(s.base, s.e)); s.dur = s.pre + s.n * s.iv + 1.5; }
      if (s.k === 'draw') s.dur = s.pre + s.n * s.iv + 1.5;
      if (s.k === 'tf') s.dur = s.pre + s.items.length * s.each;
      if (s.k === 'breath') s.dur = s.pre + s.n * s.iv;
      if (s.k !== 'outro') used += s.dur;
    }
    segs[segs.length - 1].dur = Math.max(4, TOTAL - used);
    let t = 0; segs.forEach(s => { s.t0 = t; t += s.dur; });
    return segs;
  }

  let st = null, raf = 0;

  function setHero(emoji, mv, retrigger) {
    if (hero.textContent !== emoji) hero.textContent = emoji;
    if (retrigger || hero.dataset.mv !== mv) {
      hero.className = 'br-hero'; void hero.offsetWidth; if (mv) hero.classList.add(mv); hero.dataset.mv = mv || '';
    }
  }
  function ringPulse() { ring.classList.remove('pulse'); void ring.offsetWidth; ring.classList.add('pulse'); }
  function popCount(html) { elCount.innerHTML = html; elCount.classList.remove('pop'); void elCount.offsetWidth; elCount.classList.add('pop'); }
  function repBeep(i, n) { Sound.tone(523 * Math.pow(2, (i % 8) / 12 * 2), .12, 'triangle', .16); if (i === n) Sound.tone(1046, .25, 'triangle', .14, .1); }

  function vizHTML(s) {
    if (s.viz === 'sq') {
      const b = s.base, sz = b >= 4 ? 22 : 30;
      return `<div class="br-grid" style="--n:${b};--s:${sz}px;--c:#ff4fa3">${'<i></i>'.repeat(b * b)}</div>`;
    }
    if (s.viz === 'cu') {
      let h = '';
      for (let l = 0; l < s.base; l++) h += `<div class="br-layer"><div class="br-grid" style="--n:${s.base};--s:30px;--c:#8e5cf7">${'<i></i>'.repeat(s.base * s.base)}</div>${l + 1}-қабат</div>`;
      return h;
    }
    if (s.k === 'draw') return '<div class="br-arrows"><span>⬆️</span><span>➡️</span><span>⬇️</span><span>⬅️</span></div>';
    return '';
  }
  function lightViz(count) {
    $$('.br-grid i', elViz).forEach((c, i) => c.classList.toggle('on', i < count));
  }

  function enterSeg(s, idx) {
    stage.style.setProperty('--h', s.hue);
    $('#br-step').textContent = `${idx + 1} / ${st.segs.length}`;
    elTitle.innerHTML = s.title;
    elCount.innerHTML = '';
    elViz.innerHTML = vizHTML(s);
    Music.setMode(s.k === 'breath' ? 'calm' : (s.k === 'tf' || s.k === 'reps' && s.iv < 1 ? 'party' : 'groove'));
    if (s.k === 'tf') setHero('🤔', 'mv-sway');
    else setHero(s.hero, s.k === 'reps' || s.k === 'draw' ? 'mv-sway' : s.mv);
    if (s.k === 'reps') {
      if (s.base) elTask.innerHTML = `<span class="eq">${s.base}${SUP[s.e]} = ?</span>Ойлан... 🤔`;
      else if (s.expr) elTask.innerHTML = `<span class="eq">${s.expr} = ?</span>Ойлан... 🤔`;
      else elTask.innerHTML = s.task;
    } else elTask.innerHTML = s.task || '';
    if (s.k === 'outro') { Snow.burst(220); Sound.win(); }
    st.lastRep = 0; st.phase = '';
  }

  function updateSeg(s, lt) {
    if (s.k === 'reps' || s.k === 'draw') {
      if (lt < s.pre) {
        const half = s.pre / 2;
        if (s.k === 'reps' && (s.base || s.expr) && lt >= half && st.phase !== 'reveal') {
          st.phase = 'reveal';
          const eqs = s.base ? `${s.base}${SUP[s.e]} = ${mulStr(s.base, s.e)} = <b>${s.n}</b>` : s.show;
          elTask.innerHTML = `<span class="eq">${eqs}</span><b>${s.n}</b> ${s.act}`;
          Sound.good();
        }
        const left = Math.ceil(s.pre - lt);
        if (lt >= s.pre - 1.5 && st.phase !== 'ready' && st.phase !== 'go') { st.phase = 'ready'; popCount('<small>Дайын бол...</small>'); }
        return left;
      }
      const rep = Math.min(s.n, Math.floor((lt - s.pre) / s.iv) + 1);
      if (rep !== st.lastRep && lt - s.pre < s.n * s.iv) {
        st.lastRep = rep;
        setHero(s.hero, s.mv, true); ringPulse(); repBeep(rep, s.n);
        if (s.k === 'draw') {
          const side = (rep - 1) % 4;
          $$('.br-arrows span', elViz).forEach((a, i) => a.classList.toggle('on', i === side));
          popCount(`${Math.ceil(rep / 4)}<small>-квадрат · ${side + 1}-қабырға</small>`);
        } else {
          popCount(`${rep}<small> / ${s.n}</small>`);
          lightViz(rep);
        }
      }
      if (lt - s.pre >= s.n * s.iv && st.phase !== 'done') {
        st.phase = 'done';
        if (s.k === 'reps') lightViz(s.n);
        popCount(`${pick(['🎉', '⭐', '💪', '🔥'])}<small> ${pick(PRAISE)}</small>`);
        setHero(s.hero, 'mv-sway');
      }
      return;
    }
    if (s.k === 'tf') {
      if (lt < s.pre) return;
      const i = Math.min(s.items.length - 1, Math.floor((lt - s.pre) / s.each)), sub = (lt - s.pre) - i * s.each;
      const [stmt, truth] = s.items[i];
      const key = i + (sub >= 3 ? 'r' : 'q');
      if (st.phase !== key) {
        st.phase = key;
        if (sub < 3) {
          elTask.innerHTML = `<span class="eq">${stmt}</span>`;
          elViz.innerHTML = '<div class="br-tf"><div>🙌 Ақиқат</div><div>🧎 Жалған</div></div>';
          popCount(`<small>${i + 1} / ${s.items.length} · Ойлан!</small>`);
          setHero('🤔', 'mv-sway'); Sound.tick();
        } else {
          const tfDivs = $$('.br-tf div', elViz);
          tfDivs[0].className = truth ? 'win' : 'lose'; tfDivs[1].className = truth ? 'lose' : 'win';
          popCount(truth ? '✅<small> Ақиқат!</small>' : '❌<small> Жалған!</small>');
          setHero(truth ? '🙋‍♀️' : '🧎‍♀️', truth ? 'mv-up' : 'mv-down', true); ringPulse();
          truth ? Sound.good() : Sound.tone(330, .25, 'triangle', .15);
        }
      }
      return;
    }
    if (s.k === 'breath') {
      if (lt < s.pre) { if (st.phase !== 'pre') { st.phase = 'pre'; elTask.innerHTML = 'Тыныш тұр, иығыңды босат...'; } return; }
      const c = Math.floor((lt - s.pre) / s.iv) + 1, sub = (lt - s.pre) % s.iv, inn = sub < 4;
      const key = c + (inn ? 'i' : 'o');
      if (st.phase !== key) {
        st.phase = key;
        elTask.innerHTML = inn ? 'Мұрынмен <b>терең дем ал...</b> 🌬️ (қолды жоғары көтер)' : 'Ауызбен <b>ақырын дем шығар...</b> 😮‍💨 (қолды түсір)';
        if (c === 1 && inn) setHero('🧘‍♀️', 'mv-breath', true);
      }
      elCount.innerHTML = `${4 - Math.floor(sub % 4)}<small> · ${c} / ${s.n}</small>`;
    }
  }

  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }

  function tick(now) {
    if (!st) return;
    const dt = Math.min(.1, (now - st.last) / 1000); st.last = now;
    if (st.running) st.t += dt;
    const t = Math.min(st.t, TOTAL);
    let idx = st.segs.findIndex(s => t < s.t0 + s.dur); if (idx < 0) idx = st.segs.length - 1;
    if (idx !== st.idx) { st.idx = idx; enterSeg(st.segs[idx], idx); }
    const s = st.segs[idx];
    updateSeg(s, t - s.t0);
    $('#br-time').textContent = fmt(TOTAL - t);
    $('#br-bar').style.width = (t / TOTAL * 100) + '%';
    if (st.t >= TOTAL) return finish();
    raf = requestAnimationFrame(tick);
  }

  function finish() {
    st.running = false; Music.stop();
    const box = $('#br-start');
    box.innerHTML = `<div class="br-big">🏆</div><h2>Сергіту сәті аяқталды!</h2>
      <p>Тамаша! Сен ${D.name ? '<b>' + esc(D.name) + '</b>, ' : ''}секірдің, отырып-тұрдың, шапалақтадың — бәрі <b>квадрат пен куб</b> бойынша! 🟦🧊</p>
      <div class="br-ctrl"><button id="br-again" class="btn big btn-pink" type="button">↻ Тағы бір рет</button>
      <button id="br-home" class="btn big btn-ghost" type="button">🏠 Мәзір</button></div>`;
    box.classList.remove('hidden');
    $('#br-again').addEventListener('click', begin);
    $('#br-home').addEventListener('click', () => show('menu'));
    Snow.burst(200);
  }

  function paintCtrl() {
    $('#br-play').textContent = st && st.running ? '⏸ Үзіліс' : '▶ Жалғастыру';
    $('#br-music').textContent = D.music ? '🎵 Музыка: қосулы' : '🔇 Музыка: өшірулі';
  }
  function begin() {
    Sound.init(); Sound.go();
    $('#br-start').classList.add('hidden');
    st = { segs: build(), t: 0, idx: -1, running: true, last: performance.now(), lastRep: 0, phase: '' };
    Music.start(); Music.apply(); paintCtrl();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  $('#br-play').addEventListener('click', () => {
    if (!st) return;
    st.running = !st.running;
    if (st.running) { Music.start(); Music.apply(); } else Music.stop();
    paintCtrl();
  });
  $('#br-skip').addEventListener('click', () => {
    if (!st) return;
    const s = st.segs[st.idx]; st.t = Math.min(TOTAL, s.t0 + s.dur + .001); Sound.click();
  });
  $('#br-music').addEventListener('click', () => { D.music = !D.music; save(); Music.apply(); paintCtrl(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && current === 'break' && st && st.running) { st.running = false; Music.stop(); paintCtrl(); } });

  const startHTML = $('#br-start').innerHTML;
  return {
    enter() {
      cancelAnimationFrame(raf); st = null; Music.stop();
      const box = $('#br-start'); box.innerHTML = startHTML; box.classList.remove('hidden');
      $('#br-go').addEventListener('click', begin);
      stage.style.setProperty('--h', 280);
      setHero('🙆‍♀️', 'mv-sway'); elTitle.textContent = 'Сергіту сәті'; elTask.innerHTML = ''; elCount.innerHTML = ''; elViz.innerHTML = '';
      $('#br-time').textContent = '3:00'; $('#br-bar').style.width = '0%'; paintCtrl();
    },
    stop() { cancelAnimationFrame(raf); Music.stop(); st = null; },
    applyVolume() { Music.apply(); },
    _build: build,
    _seek(t) { if (st) st.t = t; }
  };
})();

/* ============================== ЖАРЫС ============================== */
Race = (() => {
  const cv = $('#race-cv'), ctx = cv.getContext('2d'), ov = $('#race-ov');
  let W = 0, H = 0, raf = 0, last = 0, st = null;
  const LANE_COL = ['#2f6fed', '#ff8a00', '#8e5cf7'];
  const TOTAL = 10;

  const spread = () => Math.min(W * .3, 230);
  const laneX = i => W / 2 + (i - 1) * spread();
  const skierY = () => Math.max(H * .42, 250);
  const scale = () => clamp(Math.min(W, H) / 520, .85, 1.35);

  function resize() { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  addEventListener('resize', () => { if (current === 'race') resize(); });

  function start(id) {
    const lvl = levelById(id);
    show('race'); resize();
    st = { lvl, qi: 0, score: 0, hearts: 3, correct: 0, wrong: 0, time: 0, lane: 1, x: W / 2, tilt: 0,
      factor: 1, speed: 90, rows: [], trees: [], bumps: [], trail: [], parts: [], floats: [], phase: 'count', cnt: 3.5,
      cur: null, waitNext: 0, crash: 0, streak: 0, queue: [], lastKey: null, finish: null, dist: 0, treeAcc: 0, lastCnt: 4 };
    for (let i = 0; i < 14; i++) spawnTree(Math.random() * H);
    for (let i = 0; i < 30; i++) st.bumps.push({ x: Math.random() * W, y: Math.random() * H, r: 6 + Math.random() * 14 });
    $('#q-text').textContent = ''; $('#q-hint').textContent = 'Дайын бол!';
    hud(); ov.classList.add('hidden');
    cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop);
  }
  function stop() { cancelAnimationFrame(raf); st = null; ov.classList.add('hidden'); }

  function spawnTree(y) {
    const side = Math.random() < .5;
    const k = scale(), bw = Math.min(spread() * .82, 160 * k);
    const edge = Math.max(24, W / 2 - spread() - bw / 2 - 40 * k);
    const x = side ? Math.random() * edge : W - Math.random() * edge;
    st.trees.push({ x, y, s: .7 + Math.random() * .7 });
  }

  function nextQuestion() {
    if (st.qi >= TOTAL) { st.finish = { y: H + 80 }; $('#q-hint').textContent = 'Мәреге дейін аз қалды!'; $('#q-text').textContent = '🏁 МӘРЕ'; return; }
    let q;
    const due = st.queue.findIndex(x => x.at <= st.qi);
    if (due >= 0) { q = genDirect(st.queue[due].f); st.queue.splice(due, 1); }
    else q = st.lvl.gen(st);
    st.lastKey = q.fact; st.cur = q; st.qi++;
    $('#q-hint').textContent = q.hint;
    $('#q-text').textContent = q.text;
    const qb = $('#qbox'); qb.classList.remove('pop'); void qb.offsetWidth; qb.classList.add('pop');
    const dist = H + 70 - skierY();
    st.speed = dist / (st.lvl.T * st.factor);
    st.rows.push({ y: H + 70, opts: q.opts, ans: q.ans, res: null, hit: -1 });
    hud();
  }

  const laneOf = x => clamp(Math.round((x - W / 2) / spread()) + 1, 0, 2);

  function resolve(row) {
    const lane = laneOf(st.x), ch = row.opts[lane], ok = ch === row.ans;
    row.hit = lane; row.res = ok ? 'ok' : 'bad';
    const q = st.cur;
    record(q.fact, ok);
    if (ok) {
      st.streak++; st.correct++;
      const pts = 10 + Math.min(10, (st.streak - 1) * 2);
      st.score += pts;
      st.factor = Math.max(.6, st.factor * .95);
      Sound.good();
      st.floats.push({ x: st.x, y: skierY() - 70, t: 1.2, txt: pick(PRAISE) + ' +' + pts, c: '#178a4b' });
      if (st.streak >= 3) st.floats.push({ x: st.x, y: skierY() - 100, t: 1.2, txt: '🔥 ' + st.streak + ' қатарынан!', c: '#ff8a00' });
      burst(st.x, skierY(), ['#22b866', '#ffc23f', '#2f6fed', '#fff'], 26);
      st.waitNext = .55;
    } else {
      st.streak = 0; st.wrong++; st.hearts--; st.factor = 1;
      if (q.fact) { const f = FACTS.find(x => x.key === q.fact); st.queue.push({ f, at: st.qi + 2 }); }
      Sound.bad(); st.crash = .7;
      burst(st.x, skierY(), ['#ffffff', '#cfe3ff'], 40);
      st.phase = 'wait'; st.waitExplain = .7; st.chosen = ch;
    }
    hud();
  }

  function showExplain() {
    st.phase = 'explain';
    const q = st.cur;
    ov.innerHTML = `<div class="ov-box"><div class="robot-say"><div class="robot-ava">🤖</div><div>
      <h3>Ақылман түсіндіреді</h3>
      <div class="right-ans">Сен таңдадың: <s>${st.chosen}</s> · Дұрыс жауап: <span>${q.ans}</span></div>
      ${q.explain(st.chosen)}</div></div>
      <div class="ov-actions"><button class="btn btn-blue" type="button" id="ov-go">${st.hearts > 0 ? 'Түсіндім, жалғастырамын ▶' : 'Түсіндім'}</button></div></div>`;
    ov.classList.remove('hidden');
    const b = $('#ov-go'); b.focus();
    b.addEventListener('click', () => {
      ov.classList.add('hidden');
      if (st.hearts <= 0) return finish(false);
      st.phase = 'run'; st.waitNext = .4; last = performance.now();
    });
  }

  function pause() {
    if (!st || st.phase !== 'run' && st.phase !== 'count') return;
    st.prevPhase = st.phase; st.phase = 'paused';
    ov.innerHTML = `<div class="ov-box" style="text-align:center"><h3>⏸ Үзіліс</h3><p>Демалып ал, содан кейін жалғастыр!</p>
      <div class="ov-actions"><button class="btn btn-green" type="button" id="p-go">▶ Жалғастыру</button>
      <button class="btn btn-blue" type="button" id="p-re">↻ Қайта бастау</button>
      <button class="btn btn-ghost" type="button" id="p-menu">🏠 Мәзір</button></div></div>`;
    ov.classList.remove('hidden'); $('#p-go').focus();
    $('#p-go').addEventListener('click', resume);
    $('#p-re').addEventListener('click', () => start(st.lvl.id));
    $('#p-menu').addEventListener('click', () => show('menu'));
  }
  function resume() { if (!st || st.phase !== 'paused') return; ov.classList.add('hidden'); st.phase = st.prevPhase; last = performance.now(); }

  function finish(won) {
    const s = st; st.phase = 'done';
    const stars = !won ? 0 : s.wrong === 0 ? 3 : s.wrong <= 2 ? 2 : 1;
    let newBest = false;
    if (won) {
      if (stars > (D.stars[s.lvl.id] || 0)) D.stars[s.lvl.id] = stars;
      if (!D.best[s.lvl.id] || s.time < D.best[s.lvl.id]) { D.best[s.lvl.id] = s.time; newBest = true; }
      save();
    }
    const idx = LEVELS.indexOf(s.lvl), id = s.lvl.id;
    Result.show({ won, stars, score: s.score, time: s.time, correct: s.correct, total: s.correct + s.wrong, newBest,
      again: () => start(id), next: won && idx < LEVELS.length - 1 ? () => start(LEVELS[idx + 1].id) : null });
  }

  function hud() {
    if (!st) return;
    $('#hud-hearts').textContent = '❤️'.repeat(Math.max(0, st.hearts)) + '🤍'.repeat(3 - Math.max(0, st.hearts));
    $('#hud-score').textContent = st.score;
    const p = Math.min(1, Math.max(0, st.qi - 1) / TOTAL + (st.finish ? 1 / TOTAL : 0));
    $('#hud-prog').style.width = (p * 100) + '%';
    $('#hud-skier').style.left = (p * 100) + '%';
  }

  function burst(x, y, cols, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 220; st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: .6 + Math.random() * .6, c: pick(cols), r: 2 + Math.random() * 4 }); } }

  function loop(t) {
    if (!st) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    update(dt);
    if (!st) return;
    render();
    raf = requestAnimationFrame(loop);
  }

  function update(dt) {
    const s = st;
    for (const p of s.parts) { p.vy += 400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; }
    s.parts = s.parts.filter(p => p.t > 0);
    for (const f of s.floats) { f.y -= 40 * dt; f.t -= dt; }
    s.floats = s.floats.filter(f => f.t > 0);

    if (s.phase === 'count') {
      s.cnt -= dt;
      const c = Math.ceil(s.cnt - .5);
      if (c !== s.lastCnt) {
        s.lastCnt = c;
        if (c > 0) { Sound.tick(); s.floats.push({ x: W / 2, y: H * .62, t: .9, txt: String(c), c: '#2f6fed', big: true }); }
        else { Sound.go(); s.floats.push({ x: W / 2, y: H * .62, t: 1, txt: 'Кеттік! ⛷️', c: '#22b866', big: true }); }
      }
      if (s.cnt <= 0) { s.phase = 'run'; nextQuestion(); }
      moveWorld(dt, 60); steer(dt);
      return;
    }
    if (s.phase === 'wait') {
      s.waitExplain -= dt; s.crash = Math.max(0, s.crash - dt);
      moveWorld(dt, s.speed * .15);
      if (s.waitExplain <= 0) showExplain();
      return;
    }
    if (s.phase !== 'run') return;

    s.time += dt;
    $('#hud-time').textContent = s.time.toFixed(1);
    s.crash = Math.max(0, s.crash - dt);
    steer(dt);
    moveWorld(dt, s.speed);

    for (const r of s.rows) if (!r.res && r.y <= skierY() + 12) resolve(r);
    if (s.phase !== 'run') return;
    if (s.waitNext > 0) { s.waitNext -= dt; if (s.waitNext <= 0 && !s.finish) nextQuestion(); }
    if (s.finish && s.finish.y <= skierY()) { Sound.win(); burst(s.x, skierY(), ['#ff4d6d', '#ffc23f', '#2f6fed', '#22b866'], 80); hud(); finish(true); }
  }

  function steer(dt) {
    const s = st, tx = laneX(s.lane);
    const prev = s.x;
    s.x += (tx - s.x) * Math.min(1, dt * 9);
    s.tilt = clamp((s.x - prev) / Math.max(dt, .001) * -.0012, -.5, .5);
  }

  function moveWorld(dt, sp) {
    const s = st, dy = sp * dt;
    s.dist += dy;
    for (const o of s.rows) o.y -= dy;
    for (const o of s.trees) o.y -= dy;
    for (const o of s.bumps) { o.y -= dy; if (o.y < -30) { o.y = H + 30; o.x = Math.random() * W; } }
    for (const o of s.trail) o.y -= dy;
    if (s.finish) s.finish.y -= dy;
    s.rows = s.rows.filter(o => o.y > -120);
    s.trees = s.trees.filter(o => o.y > -120);
    s.treeAcc += dy;
    while (s.treeAcc > 70) { s.treeAcc -= 70; spawnTree(H + 60 + Math.random() * 40); }
    if (sp > 1) s.trail.push({ x: s.x, y: skierY() });
    s.trail = s.trail.filter(p => p.y > -20);
    if (s.trail.length > 400) s.trail.splice(0, s.trail.length - 400);
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function render() {
    const s = st, k = scale();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f7fbff'); g.addColorStop(1, '#dcecfd');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(150,185,230,.18)';
    for (const b of s.bumps) { ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 1.8, b.r * .5, 0, 0, 6.283); ctx.fill(); }
    ctx.strokeStyle = 'rgba(120,160,215,.22)'; ctx.lineWidth = 3; ctx.setLineDash([18, 22]); ctx.lineDashOffset = s.dist % 40;
    for (let i = 0; i < 3; i++) for (const o of [-7, 7]) { ctx.beginPath(); ctx.moveTo(laneX(i) + o, 0); ctx.lineTo(laneX(i) + o, H); ctx.stroke(); }
    ctx.setLineDash([]);
    if (s.trail.length > 1) {
      ctx.strokeStyle = 'rgba(110,150,210,.45)'; ctx.lineWidth = 2.5 * k;
      for (const o of [-6 * k, 6 * k]) { ctx.beginPath(); s.trail.forEach((p, i) => i ? ctx.lineTo(p.x + o, p.y + 30 * k) : ctx.moveTo(p.x + o, p.y + 30 * k)); ctx.stroke(); }
    }
    if (s.finish) drawFinish(s.finish.y, k);
    for (const r of s.rows) drawRow(r, k);
    for (const t of s.trees) drawTree(t.x, t.y, t.s * k);
    drawSkier(s.x, skierY(), s.tilt, s.crash, k);
    for (const p of s.parts) { ctx.globalAlpha = clamp(p.t * 1.5, 0, 1); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const f of s.floats) {
      ctx.globalAlpha = clamp(f.t * 1.4, 0, 1);
      ctx.font = `900 ${f.big ? 72 * k : 24 * k}px Nunito, Segoe UI, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.strokeText(f.txt, f.x, f.y); ctx.fillStyle = f.c; ctx.fillText(f.txt, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawTree(x, y, s) {
    ctx.fillStyle = 'rgba(60,90,140,.15)'; ctx.beginPath(); ctx.ellipse(x + 6 * s, y + 4 * s, 22 * s, 6 * s, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - 4 * s, y - 10 * s, 8 * s, 14 * s);
    const lv = [[0, 30, 26], [-20, 24, 22], [-38, 18, 18]];
    for (const [dy, w, h] of lv) {
      ctx.fillStyle = '#1f7a4d'; ctx.beginPath(); ctx.moveTo(x - w * s, y + (dy - 6) * s); ctx.lineTo(x + w * s, y + (dy - 6) * s); ctx.lineTo(x, y + (dy - 6 - h - 10) * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - w * .45 * s, y + (dy - 6 - h * .55 - 5) * s); ctx.lineTo(x + w * .45 * s, y + (dy - 6 - h * .55 - 5) * s); ctx.lineTo(x, y + (dy - 6 - h - 10) * s); ctx.closePath(); ctx.fill();
    }
  }

  function drawRow(r, k) {
    const bw = Math.min(spread() * .82, 160 * k), bh = 56 * k;
    r.opts.forEach((v, i) => {
      const x = laneX(i), y = r.y;
      let border = LANE_COL[i], fill = '#ffffff', txt = '#1d2b4f';
      if (r.res) {
        if (v === r.ans) { border = '#22b866'; fill = '#dcfbe8'; txt = '#178a4b'; }
        else if (i === r.hit) { border = '#e8365a'; fill = '#ffe1e6'; txt = '#c9304d'; }
        else { ctx.globalAlpha = .45; }
      }
      ctx.fillStyle = 'rgba(60,90,140,.18)'; ctx.beginPath(); ctx.ellipse(x - bw / 2, y + 4, 8, 3, 0, 0, 6.283); ctx.ellipse(x + bw / 2, y + 4, 8, 3, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = border; ctx.fillRect(x - bw / 2 - 3, y - bh - 26 * k, 6, bh + 30 * k); ctx.fillRect(x + bw / 2 - 3, y - bh - 26 * k, 6, bh + 30 * k);
      ctx.beginPath(); ctx.moveTo(x - bw / 2 + 3, y - bh - 26 * k); ctx.lineTo(x - bw / 2 + 22 * k, y - bh - 19 * k); ctx.lineTo(x - bw / 2 + 3, y - bh - 12 * k); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + bw / 2 - 3, y - bh - 26 * k); ctx.lineTo(x + bw / 2 - 22 * k, y - bh - 19 * k); ctx.lineTo(x + bw / 2 - 3, y - bh - 12 * k); ctx.fill();
      ctx.fillStyle = 'rgba(20,40,90,.15)'; rr(x - bw / 2 + 4, y - bh - 4 * k + 5, bw - 8, bh, 14); ctx.fill();
      ctx.fillStyle = fill; rr(x - bw / 2 + 4, y - bh - 4 * k, bw - 8, bh, 14); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = border; ctx.stroke();
      const str = String(v);
      let fs = 36 * k; ctx.font = `900 ${fs}px Nunito, Segoe UI, sans-serif`;
      while (ctx.measureText(str).width > bw - 26 && fs > 14) { fs -= 2; ctx.font = `900 ${fs}px Nunito, Segoe UI, sans-serif`; }
      ctx.fillStyle = txt; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(str, x, y - bh / 2 - 4 * k);
      if (r.res && v === r.ans) { ctx.font = `${22 * k}px sans-serif`; ctx.fillText('✅', x + bw / 2 - 18 * k, y - bh - 4 * k); }
      if (r.res && i === r.hit && v !== r.ans) { ctx.font = `${22 * k}px sans-serif`; ctx.fillText('❌', x + bw / 2 - 18 * k, y - bh - 4 * k); }
      ctx.globalAlpha = 1;
    });
  }

  function drawFinish(y, k) {
    const x1 = W / 2 - spread() - 110 * k, x2 = W / 2 + spread() + 110 * k, h = 90 * k;
    const sq = 14 * k; for (let x = x1, i = 0; x < x2; x += sq, i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#1d2b4f' : '#fff'; ctx.fillRect(x, y + j * sq - sq, sq, sq); }
    ctx.fillStyle = '#e8365a';
    rr(x1 - 14 * k, y - h - 30 * k, 22 * k, h + 30 * k, 8); ctx.fill();
    rr(x2 - 8 * k, y - h - 30 * k, 22 * k, h + 30 * k, 8); ctx.fill();
    ctx.fillStyle = '#ff4d6d'; rr(x1 - 20 * k, y - h - 46 * k, x2 - x1 + 40 * k, 44 * k, 16); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 ${28 * k}px Nunito, Segoe UI, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🏁 МӘРЕ 🏁', W / 2, y - h - 24 * k);
  }

  function drawSkier(x, y, tilt, crash, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k * 1.15, k * 1.15);
    ctx.fillStyle = 'rgba(40,70,120,.2)'; ctx.beginPath(); ctx.ellipse(0, 30, 20, 7, 0, 0, 6.283); ctx.fill();
    ctx.rotate(tilt + (crash > 0 ? Math.sin(crash * 25) * .5 : 0));
    ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-17, -16); ctx.lineTo(-24, 22); ctx.moveTo(17, -16); ctx.lineTo(24, 22); ctx.stroke();
    ctx.fillStyle = '#4a5568'; ctx.beginPath(); ctx.arc(-24, 22, 3, 0, 6.283); ctx.arc(24, 22, 3, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#ffc23f'; rr(-11, -8, 7, 44, 3.5); ctx.fill(); rr(4, -8, 7, 44, 3.5); ctx.fill();
    ctx.fillStyle = '#ff8a00'; rr(-11, 30, 7, 6, 3); ctx.fill(); rr(4, 30, 7, 6, 3); ctx.fill();
    ctx.fillStyle = '#24366b'; rr(-10, -16, 7, 17, 3); ctx.fill(); rr(3, -16, 7, 17, 3); ctx.fill();
    ctx.fillStyle = '#1d2b4f'; rr(-11, -1, 9, 6, 2); ctx.fill(); rr(2, -1, 9, 6, 2); ctx.fill();
    ctx.fillStyle = '#e8365a'; rr(-20, -36, 8, 20, 4); ctx.fill(); rr(12, -36, 8, 20, 4); ctx.fill();
    ctx.fillStyle = '#2f6fed'; ctx.beginPath(); ctx.arc(-16, -15, 4, 0, 6.283); ctx.arc(16, -15, 4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#ff4d6d'; rr(-13, -40, 26, 27, 9); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(-1, -37, 2, 22);
    ctx.fillStyle = '#ffc23f'; rr(-10, -42, 20, 6, 3); ctx.fill(); rr(4, -40, 5, 12, 2); ctx.fill();
    ctx.fillStyle = '#ffd7b5'; ctx.beginPath(); ctx.arc(0, -51, 10, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#3b2314'; ctx.beginPath(); ctx.arc(-8, -46, 4, 0, 6.283); ctx.arc(8, -46, 4, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#2f6fed'; ctx.beginPath(); ctx.arc(0, -53, 10.5, Math.PI, 0); ctx.fill(); rr(-11, -55, 22, 5, 2.5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -64, 4.5, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#1d2b4f'; ctx.beginPath(); ctx.arc(-3.5, -49, 1.5, 0, 6.283); ctx.arc(3.5, -49, 1.5, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#c9304d'; ctx.lineWidth = 1.4; ctx.beginPath();
    if (crash > 0) ctx.arc(0, -42, 3, Math.PI + .3, -.3); else ctx.arc(0, -46, 3.4, .2, Math.PI - .2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,140,.5)'; ctx.beginPath(); ctx.arc(-6.5, -46, 2, 0, 6.283); ctx.arc(6.5, -46, 2, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  function move(d) { if (!st || (st.phase !== 'run' && st.phase !== 'count')) return; Sound.init(); const n = clamp(st.lane + d, 0, 2); if (n !== st.lane) { st.lane = n; Sound.swish(); } }
  addEventListener('keydown', ev => {
    if (current !== 'race' || !st) return;
    const k = ev.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'ф' || k === 'Ф') { move(-1); ev.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'в' || k === 'В') { move(1); ev.preventDefault(); }
    else if (k === '1' || k === '2' || k === '3') { if (st.phase === 'run' || st.phase === 'count') { st.lane = +k - 1; Sound.swish(); } }
    else if (k === 'Escape' || k === 'p' || k === 'P') { st.phase === 'paused' ? resume() : pause(); }
  });
  cv.addEventListener('pointerdown', ev => { if (!st) return; move(ev.clientX < st.x ? -1 : 1); });
  $('#t-left').addEventListener('pointerdown', ev => { ev.preventDefault(); move(-1); });
  $('#t-right').addEventListener('pointerdown', ev => { ev.preventDefault(); move(1); });
  $('#btn-pause').addEventListener('click', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden && current === 'race') pause(); });

  return { start, stop, _st: () => st };
})();

/* ============================== НӘТИЖЕ ============================== */
Result = (() => {
  let again = null, nextFn = null;
  function show_(r) {
    again = r.again; nextFn = r.next;
    show('result');
    $('#res-emoji').textContent = r.won ? (r.stars === 3 ? '🏆' : '🏁') : '💪';
    $('#res-title').textContent = r.won ? (r.title || `Мәре! ${D.name ? D.name + ', ж' : 'Ж'}арайсың!`) : 'Жүректер таусылды';
    $('#res-stars').innerHTML = [0, 1, 2].map(i => `<span class="${i < r.stars ? '' : 'off'}" style="animation-delay:${.2 + i * .25}s">⭐</span>`).join('');
    $('#res-stats').innerHTML = `<div>Ұпай<b>${r.score}</b></div><div>Дұрыс<b>${r.correct} / ${r.total}</b></div><div>Уақыт<b>${r.time.toFixed(1)} с</b></div>`;
    const msgs = {
      3: 'Бірде-бір қатесіз! Сен нағыз шеберсің! 🤩',
      2: 'Өте жақсы! Тағы бір рет өтсең — 3 жұлдыз сенікі!',
      1: 'Жарайсың! Қателерді Ақылманның түсіндірмесімен қайталап шық.',
      0: 'Ештеңе етпейді! «Үйрену» бөлімін қарап, қайта байқап көр — сен міндетті түрде үйренесің!'
    };
    $('#res-msg').textContent = msgs[r.stars] + (r.newBest ? ' ⏱ Жаңа рекорд!' : '');
    $('#res-next').classList.toggle('hidden', !nextFn);
    if (r.won) setTimeout(() => Snow.burst(r.stars >= 2 ? 180 : 90), 200);
  }
  $('#res-again').addEventListener('click', () => { Sound.click(); again && again(); });
  $('#res-next').addEventListener('click', () => { Sound.click(); nextFn && nextFn(); });
  $('#res-menu').addEventListener('click', () => { Sound.click(); show('menu'); });
  return { show: show_ };
})();

/* ============================== АҚИҚАТ / ЖАЛҒАН ============================== */
TF = (() => {
  const DUR = 60;
  let st = null, timer = 0;
  const SPECIAL = [
    ['1² = 1³', true, '1 · 1 = 1 және 1 · 1 · 1 = 1'],
    ['8² = 4³', true, '8² = 8 · 8 = 64 және 4³ = 4 · 4 · 4 = 64'],
    ['2³ = 12', false, '2³ = 2 · 2 · 2 = 8, ал 12 емес'],
    ['2³ = 3²', false, '2³ = 8, ал 3² = 9'],
    ['10² = 100', true, '10 · 10 = 100'],
    ['3³ = 9', false, '3³ = 3 · 3 · 3 = 27 (9 — бұл 3²)'],
    ['5² = 10', false, '5² = 5 · 5 = 25, ал 5 · 2 = 10'],
    ['4² = 2 · 8', true, '4² = 16 және 2 · 8 = 16'],
    ['6² + 2² = 40', true, '36 + 4 = 40'],
    ['9² − 3³ = 54', true, '81 − 27 = 54'],
    ['5² : 1³ = 5', false, '25 : 1 = 25'],
    ['2³ · 3² = 72', true, '8 · 9 = 72'],
    ['4² : 2² = 2', false, '16 : 4 = 4'],
    ['25 + 30 + 15 = 70', true, 'Сызбадағы есеп: 25 + 30 = 55, 55 + 15 = 70'],
    ['70 − 25 − 30 = 25', false, '70 − 25 = 45, 45 − 30 = 15']
  ];
  function gen() {
    const t = rnd(1, 6);
    if (t <= 2) {
      const f = pickFact(() => true), v = powv(f.b, f.e), truth = Math.random() < .5;
      let shown = v;
      if (!truth) shown = pick([f.b * f.e, (f.b + 1) ** f.e, v + pick([1, 2, 10]), f.e === 2 ? f.b ** 3 : f.b * f.b].filter(x => x > 0 && x !== v));
      return { s: `${f.b}${SUP[f.e]} = ${shown}`, truth: shown === v, why: `${f.b}${SUP[f.e]} = ${mulStr(f.b, f.e)} = ${v}`, fact: f.key };
    }
    if (t === 3) {
      const a = rnd(1, 10), b = rnd(1, 5), op = pick(['>', '<', '=']);
      let L = [`${a}²`, a * a], R = [`${b}³`, b ** 3];
      if (Math.random() < .5) [L, R] = [R, L];
      const real = L[1] > R[1] ? '>' : L[1] < R[1] ? '<' : '=';
      return { s: `${L[0]} ${op} ${R[0]}`, truth: op === real, why: `${L[0]} = ${L[1]}, ${R[0]} = ${R[1]} → ${L[1]} ${real} ${R[1]}` };
    }
    if (t === 4) { const [s, truth, why] = pick(SPECIAL); return { s, truth, why }; }
    const toks = parseExpr(randExpr()), r = evalToks(toks), truth = Math.random() < .5;
    let shown = r.value;
    if (!truth) { const m = evalToks(toks, true); shown = m.ok && m.value !== r.value && m.value >= 0 ? m.value : r.value + pick([1, 2, 10]); }
    return { s: `${tokStr(toks)} = ${shown}`, truth: shown === r.value, why: r.steps.map(x => x.lines.join(', ')).join(' → ').replace(/<\/?b>/g, '') };
  }
  function next() {
    st.q = gen();
    $('#tf-stmt').textContent = st.q.s;
    $('#tf-explain').innerHTML = '';
  }
  function answer(v) {
    if (!st || st.lock || !st.on) return;
    Sound.init();
    const ok = v === st.q.truth, card = $('#tf-card');
    card.classList.remove('good', 'bad'); void card.offsetWidth;
    if (st.q.fact) record(st.q.fact, ok);
    if (ok) {
      st.score++; st.streak++; Sound.good(); card.classList.add('good');
      $('#tf-explain').innerHTML = `<div class="ok-box">${pick(PRAISE)} ${st.q.why}</div>`;
      st.lock = true; setTimeout(() => { if (st) { st.lock = false; next(); } }, 650);
    } else {
      st.streak = 0; Sound.bad(); card.classList.add('bad');
      st.lock = true; st.paused = true;
      $('#tf-explain').innerHTML = `<div class="diag">🤖 Бұл пікір — <b>${st.q.truth ? 'ақиқат' : 'жалған'}</b>. ${st.q.why}</div><button class="btn btn-blue" type="button" id="tf-next">Түсіндім ▶</button>`;
      $('#tf-next').focus();
      $('#tf-next').addEventListener('click', () => { st.lock = false; st.paused = false; next(); });
    }
    $('#tf-score').textContent = st.score; $('#tf-streak').textContent = st.streak;
  }
  function tick() {
    if (!st || !st.on) return;
    const now = performance.now(), dt = (now - st.last) / 1000; st.last = now;
    if (!st.paused) st.left -= dt;
    $('#tf-time').textContent = Math.max(0, Math.ceil(st.left));
    $('#tf-bar').style.width = Math.max(0, st.left / DUR * 100) + '%';
    if (st.left <= 0) return end();
    timer = requestAnimationFrame(tick);
  }
  function end() {
    st.on = false;
    const best = st.score > (D.tfBest || 0);
    if (best) { D.tfBest = st.score; save(); }
    Sound.win(); if (st.score >= 10) Snow.burst(150);
    const box = $('#tf-start');
    box.innerHTML = `<div style="font-size:64px">⏰</div><h3 style="margin:0">Уақыт бітті!</h3><p>Дұрыс жауаптар: <b style="font-size:28px">${st.score}</b><br>Үздік нәтиже: <b>${D.tfBest}</b>${best ? ' — жаңа рекорд! 🎉' : ''}</p>
      <button id="tf-go2" class="btn big btn-blue" type="button">↻ Тағы бір рет</button>`;
    box.classList.remove('hidden');
    $('#tf-go2').addEventListener('click', begin);
  }
  function begin() {
    Sound.init(); Sound.go();
    $('#tf-start').classList.add('hidden');
    st = { score: 0, streak: 0, left: DUR, last: performance.now(), on: true, lock: false, paused: false };
    $('#tf-score').textContent = 0; $('#tf-streak').textContent = 0;
    next(); cancelAnimationFrame(timer); timer = requestAnimationFrame(tick);
  }
  $('#tf-true').addEventListener('click', () => answer(true));
  $('#tf-false').addEventListener('click', () => answer(false));
  addEventListener('keydown', ev => {
    if (current !== 'tf' || !st || !st.on) return;
    if (ev.key === 'ArrowLeft') { answer(true); ev.preventDefault(); }
    if (ev.key === 'ArrowRight') { answer(false); ev.preventDefault(); }
  });
  const startHTML = $('#tf-start').innerHTML;
  return {
    enter() {
      st = null;
      const box = $('#tf-start'); box.innerHTML = startHTML; box.classList.remove('hidden');
      $('#tf-go').addEventListener('click', begin);
      $('#tf-stmt').textContent = '3² = 9'; $('#tf-explain').innerHTML = '';
      $('#tf-time').textContent = DUR; $('#tf-bar').style.width = '100%';
    },
    stop() { if (st) st.on = false; cancelAnimationFrame(timer); }
  };
})();

/* ============================== ШЕБЕРЛІК КАРТАСЫ ============================== */
function renderMap() {
  const n = masteredCount(), pct = Math.round(n / FACTS.length * 100);
  $('#map-pct').textContent = pct + '%';
  $('#map-bar').style.width = pct + '%';
  $('#map-msg').textContent = pct === 100 ? '🎉 Құттықтаймыз! Сен квадрат пен кубтың шеберісің! Сертификатыңды ал!'
    : pct >= 60 ? `Аз қалды! Тағы ${FACTS.length - n} мысал қалды 💪` : 'Әр карточканы жасылға айналдыр — сонда тақырып 100% меңгеріледі!';
  for (const [sel, e] of [['#map-sq', 2], ['#map-cu', 3]]) {
    const box = $(sel); box.innerHTML = '';
    FACTS.filter(f => f.e === e).forEach(f => {
      const m = mScore(f.key), b = document.createElement('button');
      b.type = 'button'; b.className = 'fact l' + Math.min(3, m);
      b.innerHTML = `${f.b}${SUP[e]}<small>${m >= MASTER ? '= ' + powv(f.b, e) + ' ⭐' : '<span class="dots">' + '●'.repeat(m) + '○'.repeat(MASTER - m) + '</span>'}</small>`;
      b.title = 'Үйрену бөлімінде ашу';
      b.addEventListener('click', () => { Sound.click(); Learn.open(e, f.b); });
      box.appendChild(b);
    });
  }
  $('#map-diag').textContent = `📏 Сызба бойынша есептер: ${starsStr(D.stars.diag || 0)}`;
  $('#map-cert').disabled = pct < 100;
  $('#map-cert').title = pct < 100 ? '100% болғанда ашылады' : '';
}
$('#map-train').addEventListener('click', () => { Sound.init(); Sound.click(); Race.start('ai'); });
$('#map-reset').addEventListener('click', () => {
  modal(`<h3>Прогресті тазалау керек пе?</h3><p>Барлық жұлдыздар мен шеберлік нәтижелері өшіріледі.</p>
    <div class="ov-actions"><button class="btn btn-red" type="button" id="m-yes">Иә, тазалау</button><button class="btn btn-ghost" type="button" id="m-no">Жоқ</button></div>`);
  $('#m-yes').addEventListener('click', () => { D.mastery = {}; D.stars = {}; D.best = {}; D.tfBest = 0; save(); closeModal(); renderMap(); });
  $('#m-no').addEventListener('click', closeModal);
});
$('#map-cert').addEventListener('click', () => {
  const d = new Date(), date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const nm = esc(D.name || 'Жас математик');
  modal(`<div class="cert"><div style="font-size:54px">🏆</div><h2>СЕРТИФИКАТ</h2><p>Осы сертификат</p><div class="who">${nm}</div>
    <p>«<b>Санның квадраты және кубы</b>» тақырыбын<br><b>100%</b> меңгергені үшін берілді!</p><p>⛷️ Айзеренің шаңғы жарысы · ${date}</p></div>
    <div class="ov-actions"><button class="btn btn-blue" type="button" id="m-print">🖨 Басып шығару</button><button class="btn btn-ghost" type="button" id="m-close">Жабу</button></div>`);
  Snow.burst(200); Sound.win();
  $('#m-print').addEventListener('click', () => window.print());
  $('#m-close').addEventListener('click', closeModal);
});
function modal(html) { $('#modal-box').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
$('#modal').addEventListener('click', ev => { if (ev.target.id === 'modal') closeModal(); });

/* ============================== БАСТАУ ============================== */
renderMenu();
window.__AIZERE__ = { Race, Diag, Break, genDirect, genReverse, genExpr, genSqCube, parseExpr, evalToks, TEXTBOOK, FACTS, describeNum };
})();
