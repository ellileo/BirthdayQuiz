/************** KONFIG **************/
const CONFIG = {
  options: {
    comedy:  {emoji:"🎤", title:"Berni Wagner Kabarett", when:"26.09. oder 13.10.", where:"Wien", url:"https://www.oeticket.com/artist/berni-wagner/berni-wagner-monster-3053816/"},
    flamenco:{emoji:"💃", title:"Flamenco Nacht",        when:"11.09.",                 where:"Wien", url:"https://www.oeticket.com/event/v-wiener-flamenco-tablao-nacht-fania-live-20541803/"},
    ballet:  {emoji:"🩰", title:"Ballett: Giselle",       when:"18., 19., 22., 23.09.",  where:"Staatsoper Wien", url:"https://www.viennaclassic.com/de/oper/staatsoper-wien/programm-tickets/ballett-giselle-172962.html?m=9&y=2025&p=1"},
    ice:     {emoji:"⛸️", title:"Holiday on Ice — HORIZONS", when:"22.01.–01.02.",     where:"Stadthalle, Halle D", url:"https://www.stadthalle.com/de/events/alle-events/50879/Holiday-on-Ice-HORIZONS--Do-2201-bis-So-01022026--Wiener-Stadthalle-Halle-D"}
  },
  allowForceParam: true
};

/************** QUIZ **************/
const QUESTIONS = [
  { id:'vibe', title:"Worauf hast du heute am meisten Lust?", options:[
    {label:'Lachen bis die Tränen kommen', tag:'comedy'},
    {label:'Feurige Rhythmen & Gitarren', tag:'flamenco'},
    {label:'Eleganz & Gänsehaut-Momente', tag:'ballet'},
    {label:'Spektakel & Glitzer',         tag:'ice'},
  ]},
  { id:'style', title:"Outfit-Vibes?", options:[
    {label:'Casual – Jeans & Sneaker', tag:'comedy'},
    {label:'Rot & Rüschen',            tag:'flamenco'},
    {label:'Klassisch schick',         tag:'ballet'},
    {label:'Warm & cozy mit Schal',    tag:'ice'},
  ]},
  { id:'memory', title:"Welche Erinnerung hättest du gern von heute?", options:[
    {label:'Pointen für die Ewigkeit', tag:'comedy'},
    {label:'Tanz, Palmas, Olé!',       tag:'flamenco'},
    {label:'Romantische Tragik pur',   tag:'ballet'},
    {label:'Wow-Momente auf dem Eis',  tag:'ice'},
  ]},
];

const state = { i:0, answers:{}, scores:{comedy:0,flamenco:0,ballet:0,ice:0} };
const quiz = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const stepPill = document.getElementById('stepPill');
const bar = document.getElementById('bar');

function renderQ(){
  const q = QUESTIONS[state.i];
  stepPill.textContent = `Schritt ${Math.min(state.i+1,2)}/2`;
  bar.style.width = `${(state.i)/QUESTIONS.length*100}%`;
  backBtn.disabled = state.i===0;
  nextBtn.textContent = state.i===QUESTIONS.length-1 ? 'Ergebnis anzeigen →' : 'Weiter →';

  quiz.innerHTML = `
    <div class="q">
      <h3>${q.title}</h3>
      <div class="opts">
        ${q.options.map((o,idx)=>{
          const id = `${q.id}-${idx}`;
          const selected = state.answers[q.id]===idx ? 'selected' : '';
          return `<label class="opt ${selected}" for="${id}"><input type="radio" id="${id}" name="${q.id}"> ${o.label}</label>`;
        }).join('')}
      </div>
    </div>`;

  document.querySelectorAll(`input[name="${q.id}"]`).forEach((el,idx)=>{
    el.addEventListener('change',()=>{
      state.answers[q.id]=idx;
      document.querySelectorAll('.opt').forEach(o=>o.classList.remove('selected'));
      el.closest('label').classList.add('selected');
    });
  });
}

function applyScores(){
  state.scores = {comedy:0,flamenco:0,ballet:0,ice:0};
  for(const q of QUESTIONS){
    const idx = state.answers[q.id]; if(idx==null) continue;
    const tag = q.options[idx].tag; state.scores[tag]+=1;
  }
}

function bestMatch(){
  const forced=(CONFIG.allowForceParam && new URLSearchParams(location.search).get('force'))||'';
  const keys=['comedy','flamenco','ballet','ice'];
  if(keys.includes(forced)) return forced;
  return Object.entries(state.scores).sort((a,b)=>b[1]-a[1])[0][0];
}

nextBtn.addEventListener('click',()=>{
  if(state.i < QUESTIONS.length-1){ state.i++; renderQ(); }
  else { finish(); }
});
backBtn.addEventListener('click',()=>{ state.i=Math.max(0,state.i-1); renderQ(); });

document.addEventListener('keydown',e=>{
  if(e.key==='Enter') nextBtn.click();
  if(e.key==='ArrowLeft') backBtn.click();
  if(e.key==='ArrowRight') nextBtn.click();
});

// Diagnose: Canvas-Größe checken
document.getElementById('diagBtn').onclick=()=>{
  const c=document.getElementById('scratch');
  const w=c?.width||0, h=c?.height||0;
  console.log('[Diag] Canvas size', {w,h});
  toast(w&&h?`Canvas OK: ${w}×${h}`:'Canvas noch 0 – erscheint erst im Ergebnis.');
};

function finish(){
  applyScores();
  document.getElementById('navQuiz').style.display='none';
  stepPill.textContent = 'Schritt 2/2';
  bar.style.width = '100%';
  const result = document.getElementById('result');
  result.style.display='block';
  // Warten bis Layout Maße hat (fix für 0×0-Canvas)
  requestAnimationFrame(()=>{ renderResult(); });
}

/************** Ergebnis + Rubbeln **************/
function renderResult(){
  const winner = bestMatch();
  const s = state.scores;

  document.getElementById('bestPill').textContent = `Best Match: ${labelFor(winner)}`;
  document.getElementById('scoreTiny').textContent =
    `Scores — 🎤 ${s.comedy.toFixed(1)} · 💃 ${s.flamenco.toFixed(1)} · 🩰 ${s.ballet.toFixed(1)} · ⛸️ ${s.ice.toFixed(1)}`;

  const choiceWrap = document.getElementById('choices');
  choiceWrap.innerHTML = '';
  ['comedy','flamenco','ballet','ice'].forEach(k=>{
    const o = CONFIG.options[k];
    const el = document.createElement('button'); el.className='cardMini'; el.dataset.k=k;
    el.innerHTML = `<div style="font-size:22px">${o.emoji}</div>
      <div style="font-weight:700;margin-top:6px">${o.title}</div>
      <div class="tiny" style="margin-top:4px">${o.when} · ${o.where}</div>
      <div class="tiny" style="margin-top:6px;color:var(--acc)">Auswählen</div>`;
    if(k===winner) el.classList.add('selected');
    el.onclick=()=>{ document.querySelectorAll('.cardMini').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); updateUnder(k); };
    choiceWrap.appendChild(el);
  });

  updateUnder(winner);
  setupScratch();
}

function labelFor(key){
  return ({comedy:'Kabarett', flamenco:'Flamenco', ballet:'Ballett', ice:'Holiday on Ice'})[key]||key;
}

function updateUnder(key){
  const o = CONFIG.options[key];
  document.getElementById('revealTitle').textContent = `${o.emoji} ${o.title}`;
  document.getElementById('revealSub').textContent   = `Das passt heute am besten zu deiner Stimmung!`;
  document.getElementById('revealInfo').textContent  = `${o.when} — ${o.where}`;
}

function setupScratch(){
  const canvas = document.getElementById('scratch');
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  function resize(){
    const w = wrap.clientWidth || 300;
    const h = wrap.clientHeight || 200;
    canvas.width = w; canvas.height = h;
    paintCover();
  }
  function paintCover(){
    if(canvas.width===0 || canvas.height===0) return;  // Schutz
    const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,'#b8bcc3'); g.addColorStop(.5,'#f1f2f3'); g.addColorStop(1,'#b8bcc3');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.font = 'bold 22px system-ui';
    ctx.textAlign='center'; ctx.fillText('Hier freirubbeln ✦', canvas.width/2, 42);
  }

  let scratching=false;
  function scratch(x,y){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x,y,24,0,Math.PI*2); ctx.fill();
  }

  function handle(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches? e.touches[0].clientY : e.clientY) - rect.top;
    if(scratching) scratch(x,y);
  }

  canvas.onmousedown = (e)=>{ scratching=true; handle(e); };
  canvas.onmousemove = handle;
  window.onmouseup = ()=>{ scratching=false; checkReveal(); };

  canvas.ontouchstart = (e)=>{ scratching=true; handle(e); };
  canvas.ontouchmove  = (e)=>{ handle(e); e.preventDefault(); };
  window.ontouchend   = ()=>{ scratching=false; checkReveal(); };

  function checkReveal(){
    if(canvas.width===0 || canvas.height===0) return;  // Schutz gegen 0×0
    const img = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let cleared=0; for(let i=3;i<img.length;i+=4){ if(img[i]===0) cleared++; }
    const ratio = cleared / (img.length/4);
    if(ratio>0.6){ ctx.clearRect(0,0,canvas.width,canvas.height); confetti(); }
  }

  resize();
  setTimeout(resize, 0);
  window.addEventListener('resize', resize);

  document.getElementById('openBtn').onclick = ()=>{
    const sel = document.querySelector('.cardMini.selected')?.dataset.k || bestMatch();
    const obj = CONFIG.options[sel];
    confetti();
    setTimeout(()=>{
      const go = confirm(`${obj.title}\n\n${obj.when} — ${obj.where}\n\nJetzt Details öffnen?`);
      if(go) window.open(obj.url,'_blank');
    }, 320);
  };
  document.getElementById('printBtn').onclick = ()=>window.print();
}

/************** Helpers **************/
function toast(msg){
  const t=document.createElement('div');
  t.textContent=msg; t.style.position='fixed'; t.style.left='50%'; t.style.bottom='22px';
  t.style.transform='translateX(-50%)'; t.style.padding='10px 14px';
  t.style.border='1px solid var(--line)'; t.style.borderRadius='12px';
  t.style.background='linear-gradient(180deg, rgba(155,255,222,.2), rgba(17,24,39,.85))';
  t.style.zIndex=50; document.body.appendChild(t); setTimeout(()=>t.remove(),1600);
}

function confetti(){
  const canvas=document.getElementById('confetti'); const ctx=canvas.getContext('2d'); canvas.style.display='block';
  const W=canvas.width=innerWidth, H=canvas.height=innerHeight; const cols=['#9bb7ff','#9bffde','#f6d365','#56f1a3','#ff6f91','#82e0ff'];
  const parts=Array.from({length:140},()=>({x:Math.random()*W,y:-20-Math.random()*H*.3,r:4+Math.random()*4,a:Math.random()*Math.PI*2,v:2+Math.random()*2,s:(Math.random()>.5?1:-1)*(0.5+Math.random())}));
  let frames=0; const max=1400/16;
  (function draw(){ ctx.clearRect(0,0,W,H); frames++; parts.forEach(p=>{ p.y+=p.v; p.x+=Math.sin((p.y+p.a)/20)*p.s; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a+p.y/40); ctx.fillStyle=cols[(Math.random()*cols.length)|0]; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r); ctx.restore(); }); if(frames<max) requestAnimationFrame(draw); else canvas.style.display='none'; })();
}

// Start
renderQ();
