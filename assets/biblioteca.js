(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const zone = $('#activity-zone');
  if (!zone) return;
  const content = $('#activity-content');
  const title = $('#activity-title');
  let cleanup = () => {};
  const filters = { age: 'all', level: 'all' };

  $$('.library-filters button').forEach(btn => btn.addEventListener('click', () => {
    filters[btn.dataset.filterGroup] = btn.dataset.filter;
    $$(`[data-filter-group="${btn.dataset.filterGroup}"]`).forEach(b => b.classList.toggle('is-active', b === btn));
    let shown = 0;
    $$('.station-card').forEach(card => {
      const okAge = filters.age === 'all' || card.dataset.age.includes(filters.age);
      const okLevel = filters.level === 'all' || card.dataset.level.includes(filters.level);
      card.hidden = !(okAge && okLevel); if (!card.hidden) shown++;
    });
    $('.filter-empty').hidden = shown > 0;
  }));

  const open = (name) => {
    cleanup(); content.innerHTML = ''; zone.hidden = false; document.body.classList.add('activity-open');
    const builders = { maze, search, memory, breathing, sound, rules };
    builders[name]?.(); zone.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $$('[data-open-activity]').forEach(b => b.addEventListener('click', () => open(b.dataset.openActivity)));
  $('[data-close-activity]').addEventListener('click', () => { cleanup(); zone.hidden = true; document.body.classList.remove('activity-open'); });

  function levelPicker(run) {
    const wrap = document.createElement('div'); wrap.className = 'activity-levels';
    [['semilla','Semilla'],['brote','Brote'],['bosque','Bosque']].forEach(([v,l],i) => { const b=document.createElement('button'); b.textContent=l; b.className=i===0?'is-active':''; b.onclick=()=>{ [...wrap.children].forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active'); run(v); }; wrap.append(b); });
    content.append(wrap); return wrap;
  }

  function maze() {
    title.textContent = 'Laberinto del bosque';
    content.innerHTML = '<p class="activity-instruction">Lleva el punto naranja hasta la hoja. Puedes usar las flechas del teclado o los botones.</p><div class="maze-wrap"><canvas width="520" height="520" aria-label="Laberinto interactivo"></canvas><div class="maze-controls"><button data-dir="up">↑</button><button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button></div><p class="activity-feedback">Movimientos: <b>0</b></p></div>';
    const canvas=$('canvas',content), ctx=canvas.getContext('2d'), feedback=$('.activity-feedback',content); let grid,cols,player,moves=0;
    function generate(level='semilla'){ cols={semilla:7,brote:11,bosque:15}[level]; grid=Array.from({length:cols},(_,r)=>Array.from({length:cols},(_,c)=>({r,c,w:[1,1,1,1],v:false}))); const stack=[grid[0][0]]; grid[0][0].v=true; while(stack.length){const cur=stack[stack.length-1], opts=[[cur.r-1,cur.c,0,2],[cur.r,cur.c+1,1,3],[cur.r+1,cur.c,2,0],[cur.r,cur.c-1,3,1]].filter(([r,c])=>r>=0&&c>=0&&r<cols&&c<cols&&!grid[r][c].v); if(!opts.length){stack.pop();continue;} const [r,c,a,b]=opts[Math.floor(Math.random()*opts.length)],n=grid[r][c];cur.w[a]=0;n.w[b]=0;n.v=true;stack.push(n);} player={r:0,c:0};moves=0;draw();feedback.innerHTML='Movimientos: <b>0</b>'; }
    function draw(){const z=canvas.width/cols;ctx.clearRect(0,0,520,520);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,520,520);ctx.strokeStyle='#173a5e';ctx.lineWidth=Math.max(2,5-cols/4);grid.flat().forEach(x=>{const X=x.c*z,Y=x.r*z;ctx.beginPath();if(x.w[0]){ctx.moveTo(X,Y);ctx.lineTo(X+z,Y)}if(x.w[1]){ctx.moveTo(X+z,Y);ctx.lineTo(X+z,Y+z)}if(x.w[2]){ctx.moveTo(X,Y+z);ctx.lineTo(X+z,Y+z)}if(x.w[3]){ctx.moveTo(X,Y);ctx.lineTo(X,Y+z)}ctx.stroke();});ctx.fillStyle='#6f9277';ctx.beginPath();ctx.arc((cols-.5)*z,(cols-.5)*z,z*.24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#dc7f58';ctx.beginPath();ctx.arc((player.c+.5)*z,(player.r+.5)*z,z*.25,0,Math.PI*2);ctx.fill();}
    function move(d){const cell=grid[player.r][player.c], map={up:[0,-1,0],right:[1,0,1],down:[0,1,2],left:[-1,0,3]},[dc,dr,w]=map[d];if(!cell.w[w]){player.c+=dc;player.r+=dr;moves++;draw();feedback.innerHTML=`Movimientos: <b>${moves}</b>`;if(player.r===cols-1&&player.c===cols-1)feedback.innerHTML=`¡Llegaste! Usaste <b>${moves}</b> movimientos. Puedes probar otro nivel.`;}}
    $$('.maze-controls button',content).forEach(b=>b.onclick=()=>move(b.dataset.dir)); const key=e=>{const m={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'}[e.key];if(m){e.preventDefault();move(m)}};window.addEventListener('keydown',key);cleanup=()=>window.removeEventListener('keydown',key);levelPicker(generate);generate();
  }

  function search(){title.textContent='Detective visual';content.innerHTML='<p class="activity-instruction">Encuentra el símbolo diferente. Toca cuando lo veas.</p><div class="search-board"></div><p class="activity-feedback"></p>';const board=$('.search-board',content),fb=$('.activity-feedback',content);let level='semilla';function round(l=level){level=l;const n={semilla:16,brote:36,bosque:64}[l],items=['●','◆','▲','■'],base=items[Math.floor(Math.random()*items.length)],odd=items.filter(x=>x!==base)[Math.floor(Math.random()*3)],hit=Math.floor(Math.random()*n);board.style.setProperty('--cells',Math.sqrt(n));board.innerHTML='';for(let i=0;i<n;i++){const b=document.createElement('button');b.textContent=i===hit?odd:base;b.setAttribute('aria-label',i===hit?'Símbolo diferente':'Símbolo repetido');b.onclick=()=>{if(i===hit){fb.textContent='¡Lo encontraste! Nueva ronda lista.';setTimeout(()=>round(),500)}else fb.textContent='Mira otra vez, sin apuro.'};board.append(b)}}levelPicker(round);round();cleanup=()=>{};}

  function memory(){title.textContent='Eco de colores';content.innerHTML='<p class="activity-instruction">Observa la secuencia y repítela.</p><div class="memory-pad"><button data-n="0"></button><button data-n="1"></button><button data-n="2"></button><button data-n="3"></button></div><button class="activity-start">Comenzar</button><p class="activity-feedback"></p>';const pads=$$('.memory-pad button',content),fb=$('.activity-feedback',content);let seq=[],input=[],busy=false,base=3;function flash(i){pads[i].classList.add('lit');setTimeout(()=>pads[i].classList.remove('lit'),380)}async function play(){busy=true;input=[];for(const n of seq){await new Promise(r=>setTimeout(r,300));flash(n);await new Promise(r=>setTimeout(r,420))}busy=false;fb.textContent='Ahora tú.'}function start(){seq=Array.from({length:base},()=>Math.floor(Math.random()*4));fb.textContent='Observa…';play()}pads.forEach((p,i)=>p.onclick=()=>{if(busy||!seq.length)return;flash(i);input.push(i);const k=input.length-1;if(input[k]!==seq[k]){fb.textContent='La secuencia cambió. Observa una vez más.';setTimeout(play,700);return}if(input.length===seq.length){fb.textContent='¡Secuencia completa! Añadimos un paso.';seq.push(Math.floor(Math.random()*4));setTimeout(play,800)}});$('.activity-start',content).onclick=start;levelPicker(l=>{base={semilla:3,brote:4,bosque:5}[l];start()});cleanup=()=>{};}

  function breathing(){title.textContent='Respirar con el árbol';content.innerHTML='<p class="activity-instruction">Acompaña el círculo sin forzar la respiración. Puedes detenerte cuando quieras.</p><div class="breath-orbit"><span></span><strong>Listo</strong></div><button class="activity-start">Iniciar 1 minuto</button><p class="activity-feedback"></p>';const orb=$('.breath-orbit',content),label=$('.breath-orbit strong',content),fb=$('.activity-feedback',content);let timer;$('.activity-start',content).onclick=()=>{clearInterval(timer);let t=0;orb.classList.add('running');const words=['Inhala suave','Exhala lento'];label.textContent=words[0];timer=setInterval(()=>{t++;label.textContent=words[Math.floor(t/5)%2];if(t>=60){clearInterval(timer);orb.classList.remove('running');label.textContent='Terminaste';fb.textContent='Nota cómo está tu cuerpo antes de continuar.'}},1000)};cleanup=()=>clearInterval(timer);}

  function sound(){title.textContent='Laboratorio de sonido';content.innerHTML='<p class="activity-instruction">Prueba a volumen bajo y elige también el silencio. Este ambiente se genera en tu navegador y no se descarga.</p><div class="sound-options"><button data-sound="soft">Brisa suave</button><button data-sound="pulse">Pulso lento</button><button data-sound="stop">Silencio</button></div><label class="volume-control">Volumen <input type="range" min="0" max="0.12" value="0.025" step="0.005"></label><p class="activity-feedback">Escucha por poco tiempo y observa: ¿ayuda, distrae o incomoda?</p>';let ac,nodes=[];const vol=$('input',content);function stop(){nodes.forEach(n=>{try{n.stop?.();n.disconnect()}catch{}});nodes=[];if(ac){ac.close();ac=null}}function play(type){stop();if(type==='stop')return;ac=new (window.AudioContext||window.webkitAudioContext)();const gain=ac.createGain();gain.gain.value=+vol.value;gain.connect(ac.destination);if(type==='pulse'){const o=ac.createOscillator();o.frequency.value=174;const g=ac.createGain();g.gain.value=.45;o.connect(g);g.connect(gain);o.start();nodes=[o,g,gain]}else{const len=ac.sampleRate*2,b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*.3;const s=ac.createBufferSource(),f=ac.createBiquadFilter();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=650;s.connect(f);f.connect(gain);s.start();nodes=[s,f,gain]}}$$('.sound-options button',content).forEach(b=>b.onclick=()=>play(b.dataset.sound));vol.oninput=()=>{const g=nodes[nodes.length-1];if(g?.gain)g.gain.value=+vol.value};cleanup=stop;}

  function rules(){title.textContent='Cambia la regla';content.innerHTML='<p class="activity-instruction">Toca todos los elementos que cumplen la regla.</p><h3 class="rule-title"></h3><div class="rule-board"></div><p class="activity-feedback"></p>';const board=$('.rule-board',content),rt=$('.rule-title',content),fb=$('.activity-feedback',content);const shapes=['●','▲','■'],colors=['terra','blue','green'];let round=0;function next(){const byColor=round%2===0,target=byColor?colors[round%3]:shapes[round%3];rt.textContent=byColor?`Regla: toca todo lo ${['naranja','azul','verde'][round%3]}`:`Regla: toca todos los ${target}`;board.innerHTML='';let remain=0;for(let i=0;i<18;i++){const shape=shapes[Math.floor(Math.random()*3)],color=colors[Math.floor(Math.random()*3)],ok=byColor?color===target:shape===target;if(ok)remain++;const b=document.createElement('button');b.textContent=shape;b.className=color;b.onclick=()=>{if(b.disabled)return;if(ok){b.disabled=true;b.classList.add('correct');remain--;if(!remain){fb.textContent='¡Regla completa! Ahora cambiaremos el criterio.';round++;setTimeout(next,700)}}else fb.textContent='Esa pieza sigue otra regla. Mira nuevamente.'};board.append(b)}}next();cleanup=()=>{};}
})();
