(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE = 'raices-gimnasia-progreso';
  const STATE = 'raices-gimnasia-niveles';
  const PROFILE = 'raices-gimnasia-perfil';
  const colors = ['#e78964', '#4d8fac', '#79a184', '#edbd45', '#9273ad', '#ed9690'];
  const gentleWords = ['Mira una vez más. La pista sigue ahí.', 'Casi. Prueba otra ruta, sin apurarte.', 'Observa el detalle y vuelve a intentar.', 'Tu intento cuenta. Haz una pausa si la necesitas.'];
  const successWords = ['¡Lo encontraste! Tu mirada estuvo atenta.', '¡Bien hecho! Se encendió el siguiente paso.', '¡Avanzaste! Queñal celebra contigo.', '¡Sí! Descubriste una estrategia que funciona.'];
  let profile = readJSON(PROFILE, { age: 'ninos', difficulty: 1 });
  let completed = new Set(readJSON(STORAGE, []));
  let levels = readJSON(STATE, {});
  let active = null;
  let levelIndex = 0;
  let runtime = {};
  let timers = [];
  let audioContext = null;

  const stations = [
    { id:'espejo', icon:'👐', family:'Coordinación bilateral', title:'Manos en espejo', text:'Toca con cada mano el color que pide Queñal.', type:'bilateral', levels:[
      {rounds:[[0,0],[1,1]],tiles:['●','■','▲']},{rounds:[[0,1],[1,2],[2,0]],tiles:['●','■','▲']},{rounds:[[2,1],[0,2],[1,0],[2,2]],tiles:['●','■','▲']},{rounds:[[0,2],[2,0],[1,2],[2,1],[0,0]],tiles:['★','◆','●']},{rounds:[[2,1],[1,0],[0,2],[2,2],[1,1],[0,0]],tiles:['★','◆','●']}
    ]},
    { id:'senderos', icon:'↔️', family:'Coordinación visomotora', title:'Senderos dobles', text:'Recorre dos caminos en el mismo orden.', type:'bilateral', levels:[
      {rounds:[[0,0],[1,1]],tiles:['1','2','3']},{rounds:[[0,2],[1,1],[2,0]],tiles:['1','2','3']},{rounds:[[2,0],[1,1],[0,2],[1,1]],tiles:['↑','●','↓']},{rounds:[[0,1],[2,1],[1,0],[1,2],[0,0]],tiles:['↗','●','↘']},{rounds:[[2,0],[0,2],[1,1],[0,1],[2,1],[1,2]],tiles:['↗','●','↘']}
    ]},
    { id:'eco', icon:'💡', family:'Memoria y ritmo', title:'Eco de colores', text:'Mira las luces y repite la secuencia.', type:'memory', levels:[
      {seq:[0,1,0]},{seq:[2,0,3,1]},{seq:[1,3,0,2,1]},{seq:[3,1,2,0,3,2]},{seq:[0,2,3,1,0,3,2]}
    ]},
    { id:'infiltrado', icon:'🔎', family:'Atención focalizada', title:'El infiltrado', text:'Encuentra la figura que rompe el grupo.', type:'odd', levels:[
      {base:'🍃',odd:'🌿',total:12,pos:8,cols:4},{base:'🐟',odd:'🐠',total:16,pos:5,cols:4},{base:'8',odd:'9',total:25,pos:18,cols:5},{base:'CASA',odd:'CAZA',total:30,pos:22,cols:6},{base:'↗',odd:'↖',total:36,pos:31,cols:6}
    ]},
    { id:'sombras', icon:'◐', family:'Percepción visual', title:'Sombras que coinciden', text:'Reconoce una figura por su contorno.', type:'shadow', levels:[
      {sample:'🦙',options:['🐑','🦙','🐕','🦌'],answer:'🦙'},{sample:'🐦',options:['🦋','🐟','🐦','🦇'],answer:'🐦'},{sample:'🌵',options:['🌲','🌵','🌷','🌿'],answer:'🌵'},{sample:'🚲',options:['🛵','🛒','🚲','🚗'],answer:'🚲'},{sample:'🏰',options:['🏠','🏰','⛺','🏫'],answer:'🏰'}
    ]},
    { id:'patrones', icon:'🔶', family:'Secuencias', title:'El patrón que crece', text:'Descubre qué elemento continúa la serie.', type:'pattern', levels:[
      {seq:['🍂','🌰','🍂'],options:['🌰','🍂','🌿'],answer:'🌰'},{seq:['●','■','●','■'],options:['▲','●','■'],answer:'●'},{seq:['🌙','⭐','⭐','🌙','⭐'],options:['🌙','⭐','☀️'],answer:'⭐'},{seq:['1','2','4','1','2'],options:['3','4','5'],answer:'4'},{seq:['▲','●','■','▲','●'],options:['●','■','◆'],answer:'■'}
    ]},
    { id:'explorador', icon:'👀', family:'Atención sostenida', title:'Ojos de explorador', text:'Marca todos los elementos iguales al modelo.', type:'hunt', levels:[
      {target:'🌱',cells:['🌱','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🍃','🌿','🍃'],cols:4},{target:'🔵',cells:['🔵','🟢','🟣','🔵','🟡','🔵','🟠','🟢','🔵','🟣','🟡','🔵','🟢','🟠','🔵','🟣'],cols:4},{target:'◆',cells:['◆','◇','◈','◇','◆','◈','◇','◇','◆','◇','◈','◆','◇','◆','◇','◈','◇','◆','◇','◇'],cols:5},{target:'62',cells:['26','62','26','28','62','29','26','62','28','29','62','26','28','62','29','26','62','28','29','26','62','29','28','62'],cols:6},{target:'bd',cells:['db','bd','dp','db','bd','pd','db','bd','dp','pd','bd','db','pd','bd','dp','db','bd','pd','db','dp','bd','db','pd','bd','dp','db','bd','pd','db','bd'],cols:6}
    ]},
    { id:'inversa', icon:'🔄', family:'Flexibilidad cognitiva', title:'Visión inversa', text:'Lee la serie y tócala desde el final.', type:'reverse', levels:[
      {seq:['●','▲','■']},{seq:['🌙','⭐','☀️','☁️']},{seq:['←','↑','→','↓','←']},{seq:['1','3','2','4','5','2']},{seq:['◆','●','▲','■','●','◆','▲']}
    ]},
    { id:'construye', icon:'🏗️', family:'Razonamiento', title:'Partes que construyen', text:'Elige la pieza necesaria para que funcione.', type:'parts', levels:[
      {image:0,title:'El auto quiere avanzar',question:'¿Qué pieza necesita para rodar?',options:['Una rueda','Una almohada','Una hoja','Una taza'],answer:'Una rueda'},
      {image:1,title:'La casa quiere proteger de la lluvia',question:'¿Qué parte debe estar arriba?',options:['El techo','La cuchara','La llanta','La vela'],answer:'El techo'},
      {image:2,title:'La bicicleta quiere detenerse',question:'¿Qué mecanismo ayuda a frenar?',options:['El freno','La ventana','La escalera','La almohada'],answer:'El freno'},
      {image:3,title:'El puente cruza un río',question:'¿Qué parte sostiene su peso?',options:['Los apoyos','Las cortinas','Las alas','El mantel'],answer:'Los apoyos'},
      {image:4,title:'El velero usa el viento',question:'¿Qué parte recibe el viento?',options:['La vela','El timbre','La puerta','El espejo'],answer:'La vela'}
    ]},
    { id:'camino', icon:'🧭', family:'Planificación', title:'Camino de Queñal', text:'Guía a Queñal por un laberinto con obstáculos.', type:'maze', levels:[
      {size:4,start:[0,0],goal:[3,3],blocked:[[1,1],[1,2],[2,2]]},{size:5,start:[0,0],goal:[4,4],blocked:[[0,2],[1,2],[2,0],[3,4]]},{size:5,start:[4,0],goal:[0,4],blocked:[[3,1],[3,2],[1,0],[1,1],[1,2],[1,3]]},{size:6,start:[0,0],goal:[5,5],blocked:[[0,3],[1,1],[1,3],[2,1],[2,4],[3,2],[3,4],[4,2],[5,2]]},{size:6,start:[5,0],goal:[0,5],blocked:[[4,1],[4,2],[2,0],[2,1],[2,2],[2,4],[1,4],[3,4],[4,4]]}
    ]},
    { id:'atencion-edades', icon:'🎯', family:'Atención por edades', title:'Misión atención', text:'Retos visuales adaptados a la edad elegida.', type:'attention', levels:[{},{},{},{},{}]}
  ];

  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || '') || fallback; } catch (_) { return fallback; } }
  function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function voice(text) { window.RaicesVoice?.speak(text, { rate:.74, pitch:1 }); }
  function stopVoice() { window.RaicesVoice?.stop(); }

  function tone(freq=520, duration=.12, type='sine', volume=.09) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc=audioContext.createOscillator(), gain=audioContext.createGain();
      osc.type=type; osc.frequency.value=freq; gain.gain.setValueAtTime(volume,audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration); osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime+duration);
    } catch (_) {}
  }
  function successSound(){[523,659,784,1047].forEach((f,i)=>later(()=>tone(f,.18,'sine',.1),i*90));}
  function gentleSound(){tone(310,.14,'triangle',.055);later(()=>tone(370,.16,'triangle',.05),110);}
  function confetti(){
    const box=$('#celebration'); box.innerHTML='<i class="success-beam"></i>';
    const palette=['#edbd45','#df805d','#4f9da3','#6f9c7b','#8d72ac'];
    for(let i=0;i<54;i++){const bit=document.createElement('i');bit.className='confetti';bit.style.left=`${Math.random()*100}%`;bit.style.setProperty('--color',palette[i%palette.length]);bit.style.setProperty('--drift',`${-80+Math.random()*160}px`);bit.style.animationDelay=`${Math.random()*.32}s`;box.append(bit);}
    later(()=>box.replaceChildren(),1900);
  }

  function renderCards(){
    $('#station-grid').innerHTML=stations.map((s,i)=>{
      const done=completed.has(s.id); const saved=Math.min(5,Number(levels[s.id]||0));
      const status=done?'✓ Estación completada':saved?`Continuar en nivel ${Math.min(5,saved+1)}`:'Comenzar · 5 niveles';
      return `<button class="station-card${done?' done':''}" type="button" data-station="${s.id}"><span class="station-icon">${s.icon}</span><span class="station-content"><small>${String(i+1).padStart(2,'0')} · ${s.family}</small><h3>${s.title}</h3><p>${s.text}</p><span class="station-status">${status}</span></span></button>`;
    }).join('');
    $$('[data-station]').forEach(b=>b.addEventListener('click',()=>openStation(b.dataset.station)));
    const count=completed.size; $('#completed-count').textContent=count; $('#journey-fill').style.width=`${Math.round(count/stations.length*100)}%`;
  }

  function updateProfile(){
    $$('[data-age]').forEach(b=>b.classList.toggle('is-active',b.dataset.age===profile.age));
    $$('[data-difficulty]').forEach(b=>b.classList.toggle('is-active',Number(b.dataset.difficulty)===profile.difficulty));
    const ages={infantes:'3 a 6 años',ninos:'7 a 10 años',adolescentes:'adolescentes'};
    const diff={1:'nivel 1',3:'nivel 3',5:'nivel 5'};
    $('#profile-note').textContent=`Ruta para ${ages[profile.age]}. Los juegos nuevos comenzarán en el ${diff[profile.difficulty]}.`;
    writeJSON(PROFILE,profile);
  }

  function openStation(id){
    active=stations.find(s=>s.id===id); if(!active)return;
    const saved=Number(levels[id]||0);
    levelIndex=completed.has(id)?0:(saved>0?Math.min(4,saved):profile.difficulty-1);
    $('#game-dialog').showModal(); document.body.style.overflow='hidden'; renderLevel();
  }
  function closeGame(){clearTimers();stopVoice();$('#game-dialog').close();document.body.style.overflow='';renderCards();}
  function instructionFor(s){
    const map={bilateral:'Usa un dedo de cada mano. Toca primero el lado izquierdo y luego el derecho.',memory:'Observa la secuencia de luces. Cuando termine, repítela en el mismo orden.',odd:'Busca el único elemento diferente y tócalo.',shadow:'Mira el modelo y elige la sombra que coincide.',pattern:'Observa la serie y elige lo que continúa.',hunt:'Encuentra todos los elementos iguales al modelo.',reverse:'Toca los símbolos empezando por el último.',parts:'Piensa qué función debe cumplir la estructura.',maze:'Usa las flechas para llegar a la hoja sin atravesar los árboles.',attention:'Encuentra las pistas que pide Queñal. El reto cambia según la edad elegida.'};
    return map[s.type];
  }
  function renderLevel(){
    clearTimers();runtime={};$('#next-level').hidden=true;$('#next-level').classList.remove('glow');$('#game-feedback').className='game-feedback';$('#game-feedback').textContent='';
    $('#game-title').textContent=active.title;$('#game-family').textContent=active.family;$('#level-label').textContent=`Nivel ${levelIndex+1} de 5`;$('#level-fill').style.width=`${(levelIndex+1)*20}%`;$('#round-label').textContent='Paso 1';
    $('#game-instruction').textContent=instructionFor(active);$('#game-stage').className='game-stage';
    const level=active.type==='attention'?attentionLevel(profile.age,levelIndex):active.levels[levelIndex];
    const renderers={bilateral:renderBilateral,memory:renderMemory,odd:renderOdd,shadow:renderShadow,pattern:renderPattern,hunt:renderHunt,reverse:renderReverse,parts:renderParts,maze:renderMaze,attention:renderAttention};
    renderers[active.type](level);
    later(()=>voice(`${active.title}. Nivel ${levelIndex+1}. ${instructionFor(active)}`),350);
  }
  function good(message){
    const f=$('#game-feedback');f.className='game-feedback good';f.textContent=message;$('#game-stage').classList.remove('try-again');void $('#game-stage').offsetWidth;$('#game-stage').classList.add('correct');tone(660,.1,'sine',.07);
  }
  function gentle(message){
    const f=$('#game-feedback');f.className='game-feedback gentle';f.textContent=message||gentleWords[Math.floor(Math.random()*gentleWords.length)];$('#game-stage').classList.remove('correct','try-again');void $('#game-stage').offsetWidth;$('#game-stage').classList.add('try-again');gentleSound();
  }
  function finishLevel(){
    runtime.locked=true; const message=successWords[Math.floor(Math.random()*successWords.length)];good(message);successSound();confetti();voice(message);
    levels[active.id]=Math.max(Number(levels[active.id]||0),levelIndex+1);writeJSON(STATE,levels);
    if(levelIndex===4){completed.add(active.id);writeJSON(STORAGE,[...completed]);$('#next-level').textContent='Terminar estación ✓';}
    else $('#next-level').textContent='Siguiente nivel →';
    $('#next-level').hidden=false;$('#next-level').classList.add('glow');renderCards();
  }

  function renderBilateral(level){
    runtime.round=0;runtime.left=null;runtime.right=null; const tiles=level.tiles;
    const prompt=()=>`Paso ${runtime.round+1}: izquierda ${tiles[level.rounds[runtime.round][0]]} y derecha ${tiles[level.rounds[runtime.round][1]]}`;
    const panel=(side,label)=>`<section class="hand-panel ${side}"><h3>${label}</h3><div class="hand-buttons">${tiles.map((t,i)=>`<button type="button" class="hand-button" style="--tile:${colors[i]}" data-hand="${side}" data-index="${i}">${t}</button>`).join('')}</div></section>`;
    $('#game-stage').innerHTML=`<div class="bilateral-wrap"><p class="bilateral-prompt" id="bilateral-prompt">${prompt()}</p><div class="bilateral-board">${panel('left','Mano izquierda')}${panel('right','Mano derecha')}</div><div class="round-dots">${level.rounds.map((_,i)=>`<span class="${i===0?'current':''}"></span>`).join('')}</div></div>`;
    $('#round-label').textContent=`Paso 1 de ${level.rounds.length}`;
    $$('[data-hand]',$('#game-stage')).forEach(b=>b.addEventListener('click',()=>{
      if(runtime.locked)return;const side=b.dataset.hand;runtime[side]=Number(b.dataset.index);$$(`[data-hand="${side}"]`).forEach(x=>x.classList.toggle('active',x===b));
      if(runtime.left===null||runtime.right===null)return;
      const expected=level.rounds[runtime.round];
      if(runtime.left===expected[0]&&runtime.right===expected[1]){
        tone(480+runtime.round*55,.1);$$('.round-dots span')[runtime.round].className='done';runtime.round++;
        if(runtime.round===level.rounds.length){finishLevel();return;}
        good('¡Par logrado! Ahora sigue el siguiente.');$$('.round-dots span')[runtime.round].className='current';$('#round-label').textContent=`Paso ${runtime.round+1} de ${level.rounds.length}`;$('#bilateral-prompt').textContent=prompt();
      } else gentle('Observa los dos lados. Puedes cambiar una mano y probar de nuevo.');
      runtime.left=runtime.right=null;later(()=>$$('[data-hand]').forEach(x=>x.classList.remove('active')),280);
    }));
  }

  function renderMemory(level){
    runtime.user=[];runtime.playing=false;const tileColors=['#e78964','#4d8fac','#79a184','#edbd45'];
    $('#game-stage').innerHTML=`<div><p class="memory-status" id="memory-status">Pulsa “Ver patrón” para comenzar</p><div class="simon-board">${tileColors.map((c,i)=>`<button type="button" class="simon-tile" style="--tile:${c}" data-simon="${i}" aria-label="Color ${i+1}"></button>`).join('')}</div><div class="simon-controls"><button class="stage-button" id="play-pattern" type="button">▶ Ver patrón</button></div></div>`;
    $('#round-label').textContent=`Longitud ${level.seq.length}`;
    const play=()=>{if(runtime.playing||runtime.locked)return;runtime.playing=true;runtime.user=[];$('#play-pattern').disabled=true;$('#memory-status').textContent='Mira y escucha';
      level.seq.forEach((value,i)=>later(()=>{const b=$(`[data-simon="${value}"]`);b.classList.add('lit');tone(330+value*105,.18,'sine',.07);later(()=>b.classList.remove('lit'),260);},i*520));
      later(()=>{runtime.playing=false;$('#play-pattern').disabled=false;$('#memory-status').textContent='Ahora tú: repite el patrón';},level.seq.length*520+120);
    };
    $('#play-pattern').addEventListener('click',play);
    $$('[data-simon]').forEach(b=>b.addEventListener('click',()=>{if(runtime.playing||runtime.locked)return;const value=Number(b.dataset.simon);b.classList.add('lit');tone(330+value*105,.12);later(()=>b.classList.remove('lit'),170);const pos=runtime.user.length;
      if(value!==level.seq[pos]){runtime.user=[];gentle('Mira bien: no pasa nada. Puedes volver a ver el patrón.');$('#memory-status').textContent='Prueba otra vez o vuelve a mirar';return;}
      runtime.user.push(value);$('#memory-status').textContent=`Recordaste ${runtime.user.length} de ${level.seq.length}`;if(runtime.user.length===level.seq.length)finishLevel();
    }));later(play,650);
  }

  function renderOdd(level){
    const cells=Array(level.total).fill(level.base);cells[level.pos]=level.odd;$('#round-label').textContent='1 diferente';
    $('#game-stage').innerHTML=`<div><div class="odd-grid" style="--cols:${level.cols}">${cells.map((v,i)=>`<button class="odd-cell" type="button" data-odd="${i}">${v}</button>`).join('')}</div></div>`;
    $$('[data-odd]').forEach(b=>b.addEventListener('click',()=>{if(runtime.locked)return;if(Number(b.dataset.odd)===level.pos){b.classList.add('found');finishLevel();}else{b.classList.add('wrong');gentle();later(()=>b.classList.remove('wrong'),500);}}));
  }
  function renderShadow(level){
    $('#game-stage').innerHTML=`<div><div class="shadow-sample"><small>Modelo</small><span>${level.sample}</span></div><div class="choice-grid shadow-options">${level.options.map(v=>`<button class="choice-button" type="button" data-choice="${v}" aria-label="Elegir esta sombra">${v}</button>`).join('')}</div></div>`;
    choiceHandlers(level.answer);
  }
  function renderPattern(level){
    $('#game-stage').innerHTML=`<div><div class="pattern-view">${level.seq.map(v=>`<span>${v}</span>`).join('')}<span class="blank">?</span></div><div class="choice-grid">${level.options.map(v=>`<button class="choice-button" type="button" data-choice="${v}">${v}</button>`).join('')}</div></div>`;choiceHandlers(level.answer);
  }
  function choiceHandlers(answer){$$('[data-choice]').forEach(b=>b.addEventListener('click',()=>{if(runtime.locked)return;if(b.dataset.choice===answer){b.classList.add('selected');finishLevel();}else{b.classList.add('wrong');gentle();later(()=>b.classList.remove('wrong'),550);}}));}

  function renderHunt(level){
    runtime.remaining=level.cells.filter(v=>v===level.target).length;$('#round-label').textContent=`Busca ${runtime.remaining}`;
    $('#game-stage').innerHTML=`<div><p class="hunt-summary">Modelo: <b>${level.target}</b> · Faltan <span id="hunt-left">${runtime.remaining}</span></p><div class="hunt-grid" style="--cols:${level.cols}">${level.cells.map((v,i)=>`<button class="hunt-cell" type="button" data-hunt="${i}" data-value="${v}">${v}</button>`).join('')}</div></div>`;
    $$('[data-hunt]').forEach(b=>b.addEventListener('click',()=>{if(runtime.locked||b.classList.contains('found'))return;if(b.dataset.value===level.target){b.classList.add('found');runtime.remaining--;$('#hunt-left').textContent=runtime.remaining;tone(540,.1);if(!runtime.remaining)finishLevel();}else{b.classList.add('wrong');gentle('Mira el modelo y compara con calma.');later(()=>b.classList.remove('wrong'),450);}}));
  }
  function renderReverse(level){
    runtime.answer=[];const options=[...new Set(level.seq)].sort(()=>.5-Math.random());$('#round-label').textContent=`${level.seq.length} símbolos`;
    $('#game-stage').innerHTML=`<div><p class="reverse-hint">Serie original</p><div class="reverse-source">${level.seq.map(v=>`<span>${v}</span>`).join('')}</div><p class="reverse-hint">Respuesta desde el final</p><div class="reverse-answer">${level.seq.map(()=>'<span>·</span>').join('')}</div><div class="reverse-options">${options.map(v=>`<button type="button" data-reverse="${v}">${v}</button>`).join('')}</div></div>`;
    $$('[data-reverse]').forEach(b=>b.addEventListener('click',()=>{if(runtime.locked)return;const expected=[...level.seq].reverse();const value=b.dataset.reverse;const pos=runtime.answer.length;if(value!==expected[pos]){runtime.answer=[];$$('.reverse-answer span').forEach(x=>x.textContent='·');gentle('Vuelve al último símbolo de la serie y avanza hacia la izquierda.');return;}runtime.answer.push(value);$$('.reverse-answer span')[pos].textContent=value;tone(420+pos*45,.09);if(runtime.answer.length===expected.length)finishLevel();}));
  }
  function renderParts(level){
    $('#game-stage').innerHTML=`<div class="parts-card"><div class="parts-picture parts-digital" style="background-position:${level.image*25}% center" role="img" aria-label="${level.title}. Observa la pieza ausente."></div><div class="parts-copy"><h3>${level.title}</h3><p>${level.question}</p><div class="parts-options">${level.options.map(v=>`<button type="button" data-choice="${v}">${v}</button>`).join('')}</div></div></div>`;choiceHandlers(level.answer);
  }

  function renderMaze(level){runtime.pos=[...level.start];runtime.moves=0;const isBlocked=(r,c)=>level.blocked.some(([br,bc])=>br===r&&bc===c);
    const draw=()=>{let html='';for(let r=0;r<level.size;r++)for(let c=0;c<level.size;c++){const player=runtime.pos[0]===r&&runtime.pos[1]===c;const goal=level.goal[0]===r&&level.goal[1]===c;const blocked=isBlocked(r,c);html+=`<span class="maze-cell${blocked?' blocked':''}${player?' player':''}${goal?' goal':''}">${player?'🧒':goal?'🍃':blocked?'🌳':''}</span>`;}$('.maze-board').innerHTML=html;$('#maze-moves').textContent=runtime.moves;};
    $('#game-stage').innerHTML=`<div><p class="maze-meta">Movimientos: <span id="maze-moves">0</span></p><div class="maze-wrap"><div class="maze-board" style="--size:${level.size}"></div><div class="maze-controls"><button type="button" data-move="-1,0" aria-label="Arriba">↑</button><button type="button" data-move="0,-1" aria-label="Izquierda">←</button><button type="button" data-move="1,0" aria-label="Abajo">↓</button><button type="button" data-move="0,1" aria-label="Derecha">→</button></div></div></div>`;draw();
    $$('[data-move]').forEach(b=>b.addEventListener('click',()=>{if(runtime.locked)return;const [dr,dc]=b.dataset.move.split(',').map(Number);const nr=runtime.pos[0]+dr,nc=runtime.pos[1]+dc;if(nr<0||nc<0||nr>=level.size||nc>=level.size||isBlocked(nr,nc)){gentle('Ese camino tiene un árbol. Busca otra dirección.');return;}runtime.pos=[nr,nc];runtime.moves++;tone(360+runtime.moves*8,.07);draw();if(nr===level.goal[0]&&nc===level.goal[1])finishLevel();}));
  }

  function grid(base,target,total,count,positions){const cells=Array(total).fill(base);positions.slice(0,count).forEach(i=>cells[i]=target);return cells;}
  function attentionLevel(age,index){
    const sets={
      infantes:[
        {target:'⭐',cells:grid('●','⭐',12,1,[7]),cols:4,prompt:'Encuentra la estrella.'},
        {target:'🐦',cells:grid('🦋','🐦',16,2,[3,12]),cols:4,prompt:'Encuentra los dos pájaros.'},
        {target:'🔺',cells:grid('🔵','🔺',20,3,[2,11,18]),cols:5,prompt:'Marca los tres triángulos.'},
        {target:'🌼',cells:grid('🌸','🌼',25,4,[1,8,16,23]),cols:5,prompt:'Mira el centro y busca las flores distintas.'},
        {target:'🦙',cells:['🦙','🐋','🐊','🐸','🐨','🐸','🐊','🐨','🐋','🦙','🐨','🐸','🐋','🐊','🦙','🐸','🐨','🐋','🐊','🦙'],cols:5,prompt:'Encuentra todas las llamas.'}
      ],
      ninos:[
        {target:'D',cells:grid('O','D',20,1,[13]),cols:5,prompt:'Encuentra la letra D.'},
        {target:'X',cells:grid('K','X',25,2,[7,19]),cols:5,prompt:'Encuentra las dos letras X.'},
        {target:'62',cells:grid('26','62',30,3,[4,17,26]),cols:6,prompt:'Encuentra 62 sin confundirlo con 26.'},
        {target:'bd',cells:grid('db','bd',30,4,[2,11,20,28]),cols:6,prompt:'Encuentra las parejas b d.'},
        {target:'CAZA',cells:grid('CASA','CAZA',36,5,[1,9,18,27,34]),cols:6,prompt:'Encuentra todas las palabras CAZA.'}
      ],
      adolescentes:[
        {target:'6b',cells:grid('b6','6b',25,2,[8,21]),cols:5,prompt:'Encuentra 6b entre b6.'},
        {target:'6289',cells:grid('6298','6289',30,3,[5,16,27]),cols:6,prompt:'Encuentra 6289.'},
        {target:'pqbd',cells:grid('pqdb','pqbd',36,4,[3,14,25,32]),cols:6,prompt:'Encuentra la secuencia p q b d.'},
        {target:'RAÍCES',cells:grid('RAICES','RAÍCES',36,5,[0,8,17,29,35]),cols:6,prompt:'Encuentra la palabra con tilde.'},
        {target:'↙↗',cells:grid('↘↖','↙↗',42,6,[4,11,18,25,33,40]),cols:7,prompt:'Encuentra las parejas que miran hacia afuera.'}
      ]
    };return sets[age][index];
  }
  function renderAttention(level){$('#game-instruction').textContent=level.prompt;renderHunt(level);}

  $$('[data-age]').forEach(b=>b.addEventListener('click',()=>{profile.age=b.dataset.age;updateProfile();}));
  $$('[data-difficulty]').forEach(b=>b.addEventListener('click',()=>{profile.difficulty=Number(b.dataset.difficulty);updateProfile();}));
  $('#start-route').addEventListener('click',()=>openStation(stations.find(s=>!completed.has(s.id))?.id||stations[0].id));
  $('#voice-intro').addEventListener('click',()=>voice('Bienvenido a Gimnasia cerebral con Queñal. Elige tu edad, una dificultad y la estación que quieras explorar. Puedes parar cuando lo necesites.'));
  $('#listen-guide').addEventListener('click',()=>voice(`${active.title}. Nivel ${levelIndex+1}. ${$('#game-instruction').textContent}`));
  $('#stop-guide').addEventListener('click',stopVoice);
  $('#close-game').addEventListener('click',closeGame);
  $('#game-dialog').addEventListener('cancel',e=>{e.preventDefault();closeGame();});
  $('#repeat-level').addEventListener('click',renderLevel);
  $('#next-level').addEventListener('click',()=>{if(levelIndex<4){levelIndex++;renderLevel();}else closeGame();});
  $('#reset-progress').addEventListener('click',()=>{if(!confirm('¿Reiniciar solamente el progreso de Gimnasia cerebral?'))return;completed=new Set();levels={};writeJSON(STORAGE,[]);writeJSON(STATE,{});renderCards();});
  updateProfile();renderCards();
})();
