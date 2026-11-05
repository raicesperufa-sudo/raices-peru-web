(() => {
  const routes = [
    {id:'cantidad',icon:'🔢',name:'Números que puedo ver',about:'Cantidad, comparación, diez, unidades y decenas.',missions:[
      ['Cuenta conmigo','Cuenta los elementos uno por uno.','🍊 🍊 🍊 🍊 🍊','¿Cuántas naranjas hay?',['4','5','6'],1,'Toca cada naranja mientras cuentas: uno, dos, tres, cuatro, cinco.'],
      ['Mayor, menor o igual','Compara las dos cantidades.','🐦 🐦 🐦  ·  🐦 🐦 🐦 🐦 🐦','¿Qué grupo tiene más?',['El primero','El segundo','Son iguales'],1,'El segundo grupo tiene cinco aves; el primero tiene tres.'],
      ['Amigos del diez','Busca la parte que completa diez.','🟠 🟠 🟠 🟠 🟠 🟠  +  ❔','¿Cuántos faltan para llegar a 10?',['3','4','5'],1,'Ya hay seis. Puedes contar: siete, ocho, nueve y diez.'],
      ['Casas de números','Separa decenas y unidades.','<span class="math">34 = 3 decenas + ❔ unidades</span>','¿Cuántas unidades tiene 34?',['3','4','34'],1,'Treinta y cuatro se forma con tres grupos de diez y cuatro sueltas.'],
      ['La colección correcta','Un conjunto reúne elementos con una regla común.','🍎 🍌 🍇  ·  ⚽ 🚲','¿Cuál grupo es un conjunto de frutas?',['El primero','El segundo','Los dos'],0,'Manzana, plátano y uvas son frutas.']
    ]},
    {id:'operaciones',icon:'➕',name:'Sumo y resto historias',about:'Partes, total, recta numérica y valor desconocido.',missions:[
      ['Juntamos tesoros','Representa la suma con objetos.','⭐ ⭐ ⭐ ⭐  +  ⭐ ⭐ ⭐','¿Cuántas estrellas hay en total?',['6','7','8'],1,'Empieza con cuatro y cuenta tres más: cinco, seis, siete.'],
      ['Lo que queda','Quitar también cuenta una historia.','🍓 🍓 🍓 🍓 🍓 🍓 🍓 🍓 🍓  −  🍓 🍓 🍓 🍓','¿Cuántas fresas quedan?',['4','5','6'],1,'Puedes tapar cuatro de las nueve y contar las visibles.'],
      ['La parte escondida','Encuentra el número que falta.','<span class="math">7 + ❔ = 10</span>','¿Qué número completa la igualdad?',['2','3','4'],1,'Piensa en los amigos del diez: siete necesita tres.'],
      ['Saltos en el camino','Avanza en una recta numérica.','<span class="math">8 → 9 → 10 → 11 → 12 → 13</span>','Si empiezas en 8 y das 5 saltos, ¿dónde llegas?',['12','13','14'],1,'No cuentes el ocho como salto. El primer salto llega a nueve.'],
      ['Equilibrio numérico','Una igualdad mantiene los dos lados equivalentes.','<span class="math">14 − ❔ = 8</span>','¿Qué número debemos quitar?',['5','6','7'],1,'También puedes pensar: ocho más cuánto forma catorce.']
    ]},
    {id:'tablas',icon:'🧺',name:'Grupos y tablas',about:'Grupos iguales, arreglos y estrategias para multiplicar.',missions:[
      ['Dos canastas','Cuenta grupos iguales.','🧺 🍎🍎🍎🍎  ·  🧺 🍎🍎🍎🍎','¿Cuántas manzanas hay en 2 grupos de 4?',['6','8','10'],1,'Puedes sumar cuatro más cuatro.'],
      ['Cinco estrellas por equipo','Multiplicar abrevia una suma repetida.','⭐⭐⭐  ⭐⭐⭐  ⭐⭐⭐  ⭐⭐⭐  ⭐⭐⭐','¿Cuánto es 5 × 3?',['12','15','18'],1,'Son cinco grupos y cada grupo tiene tres.'],
      ['Jardín en filas','Un arreglo permite ver filas y columnas.','🌷 🌷 🌷 🌷<br>🌷 🌷 🌷 🌷<br>🌷 🌷 🌷 🌷','¿Cuántas flores hay en 3 filas de 4?',['7','12','14'],1,'Cuenta 4 + 4 + 4.'],
      ['Dobla y vuelve a doblar','Usa una tabla conocida para encontrar otra.','<span class="math">4 × 6 = (2 × 6) + (2 × 6)</span>','¿Cuánto es 4 × 6?',['20','24','28'],1,'Dos por seis es doce. Dos grupos de doce forman veinticuatro.'],
      ['Casi diez','La tabla del 9 puede pensarse como diez grupos menos uno.','<span class="math">9 × 7 = (10 × 7) − 7</span>','¿Cuánto es 9 × 7?',['56','63','70'],1,'Diez por siete es setenta; ahora quita siete.']
    ]},
    {id:'repartir',icon:'🍪',name:'Reparto justo',about:'División, mitades, tercios y familias de operaciones.',missions:[
      ['Galletas para tres','Reparte la misma cantidad a cada amigo.','🍪🍪🍪🍪  🍪🍪🍪🍪  🍪🍪🍪🍪','12 galletas entre 3 amigos. ¿Cuántas recibe cada uno?',['3','4','6'],1,'Forma tres grupos iguales y coloca una galleta en cada grupo por turno.'],
      ['Cinco equipos','Relaciona repartir con multiplicar.','<span class="math">15 ÷ 5 = ❔</span>','¿Cuántos recibe cada equipo?',['2','3','5'],1,'Busca qué número multiplicado por cinco da quince.'],
      ['La mitad','Una mitad es una de dos partes iguales.','🟢🟢🟢🟢🟢🟢🟢🟢🟢  |  🟢🟢🟢🟢🟢🟢🟢🟢🟢','¿Cuál es la mitad de 18?',['6','9','12'],1,'Dos grupos de nueve forman dieciocho.'],
      ['La tercera parte','Un tercio es una de tres partes iguales.','<span class="math">21 = 7 + 7 + 7</span>','¿Cuál es la tercera parte de 21?',['6','7','8'],1,'La cantidad aparece repartida en tres grupos iguales.'],
      ['Familia de hechos','Multiplicación y división cuentan la misma familia.','<span class="math">4 × 6 = 24</span>','¿Qué división pertenece a esa familia?',['24 ÷ 4 = 6','24 ÷ 5 = 6','24 ÷ 6 = 5'],0,'Si cuatro grupos de seis forman veinticuatro, veinticuatro repartido entre cuatro da seis.']
    ]},
    {id:'patrones',icon:'🌱',name:'Patrones y valor posicional',about:'Series, reglas, centenas y relaciones numéricas.',missions:[
      ['Pasos de dos','Encuentra lo que cambia de un número al siguiente.','<span class="math">2, 4, 6, 8, ❔</span>','¿Qué número sigue?',['9','10','12'],1,'Cada número aumenta dos.'],
      ['Cuenta hacia atrás','Una serie también puede disminuir.','<span class="math">30, 25, 20, 15, ❔</span>','¿Qué número sigue?',['5','10','20'],1,'Cada vez quitamos cinco.'],
      ['Saltos de diez','Observa qué cifra cambia.','<span class="math">125, 135, 145, ❔</span>','¿Qué número sigue?',['150','155','245'],1,'Al sumar diez cambia la cifra de las decenas.'],
      ['Centenas, decenas y unidades','Construye el número por posiciones.','<span class="math">3 centenas + 0 decenas + 5 unidades</span>','¿Qué número se forma?',['35','305','350'],1,'El cero conserva el lugar de las decenas.'],
      ['Patrón multiplicativo','Cada número se obtiene duplicando el anterior.','<span class="math">3, 6, 12, 24, ❔</span>','¿Qué número sigue?',['36','42','48'],2,'El veinticuatro se duplica: veinticuatro más veinticuatro.']
    ]},
    {id:'problemas',icon:'🗺️',name:'Problemas de la vida diaria',about:'Historias, medida, tiempo y geometría con sentido.',missions:[
      ['Libros compartidos','Primero decide qué está pasando en la historia.','📚 18 libros  +  📚 7 libros','Había 18 libros y llegaron 7. ¿Cuántos hay ahora?',['24','25','26'],1,'La palabra llegaron indica que la colección aumenta.'],
      ['El viaje de las aves','Dibuja o imagina lo que se va.','🐦 32 aves; 9 vuelan lejos','¿Cuántas aves quedan?',['21','23','41'],1,'La cantidad disminuye: treinta y dos menos nueve.'],
      ['Bolsas de semillas','Usa grupos iguales.','🌱 6 bolsas · 4 semillas en cada una','¿Cuántas semillas hay?',['10','20','24'],2,'Son seis grupos de cuatro. Puedes sumar 4 seis veces.'],
      ['La merienda justa','Decide cuántos grupos se forman.','🍎 28 manzanas · 7 por cesta','¿Cuántas cestas se necesitan?',['3','4','5'],1,'Busca siete por qué número da veintiocho.'],
      ['Tiempo, longitud y forma','Relaciona una medida con la herramienta adecuada.','📏 ⏰ ⚖️','¿Qué instrumento usarías para medir el largo de una mesa?',['Reloj','Regla o cinta','Balanza'],1,'El largo es una longitud; usamos regla o cinta métrica.']
    ]}
  ];

  const storageKey = 'raices-matematicas-progreso';
  const settingsKey = 'raices-matematicas-ajustes';
  const flat = routes.flatMap((route, routeIndex) => route.missions.map((mission, index) => ({route,routeIndex,index,mission,key:`${route.id}-${index}`})));
  let completed = new Set();
  let settings = {support:'ayuda',length:'5',voice:true};
  let active = null;
  let attempts = 0;
  try { completed = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch (_) {}
  try { settings = {...settings,...JSON.parse(localStorage.getItem(settingsKey) || '{}')}; } catch (_) {}

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const routeGrid = $('#route-grid');
  const shell = $('#mission-shell');
  const voiceButton = $('#voice-toggle');
  const gentlePhrases = ['Mira otra vez con calma. Todavía estamos descubriendo.','Buena prueba. Busca una pista y vuelve a intentar.','Casi encontramos la regla. Comparemos una parte a la vez.'];

  function save() {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }
  function speak(text, force=false) {
    if (!settings.voice) return;
    window.RaicesVoice?.speak(text.replace(/<[^>]+>/g,' ').replace(/[·❔]/g,' '), {force,rate:.74});
  }
  function beep(success=true) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      [0,success?0.12:0.08].forEach((delay,i) => {
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.type=success?'sine':'triangle'; osc.frequency.value=success?(i?660:520):260;
        gain.gain.setValueAtTime(.0001,ctx.currentTime+delay); gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+delay+.01); gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+.16);
        osc.connect(gain).connect(ctx.destination); osc.start(ctx.currentTime+delay); osc.stop(ctx.currentTime+delay+.18);
      });
    } catch (_) {}
  }
  function celebrate() {
    beep(true);
    const box=$('#confetti'); box.innerHTML='';
    const colors=['#df7d55','#f5c34b','#3a93bd','#759d7d','#9b6fb0'];
    for(let i=0;i<34;i++){const bit=document.createElement('i');bit.style.left=`${Math.random()*100}%`;bit.style.background=colors[i%colors.length];bit.style.setProperty('--drift',`${Math.random()*180-90}px`);bit.style.animationDelay=`${Math.random()*.25}s`;box.append(bit)}
    setTimeout(()=>box.innerHTML='',1800);
  }
  function updateProgress() {
    $('#total-count').textContent=`${completed.size}/30`;
    $('#total-progress').value=completed.size;
    routes.forEach(route=>{
      const count=route.missions.filter((_,i)=>completed.has(`${route.id}-${i}`)).length;
      const el=$(`[data-route="${route.id}"] .route-state`); if(el) el.textContent=`${count}/5 completadas`;
    });
  }
  function renderRoutes() {
    routeGrid.innerHTML=routes.map((r,i)=>{r.tier=i===0?'libre':'plus';const available=window.RaicesAccess?.canUse(r.tier)??r.tier==='libre';return `<button class="route-card${r.tier==='plus'?' is-plus':''}" type="button" data-route="${r.id}" data-index="${i}"><span class="route-icon">${r.icon}</span><span><small class="route-state">0/5 completadas</small><small>${r.tier==='libre'?'Ruta libre':'Familia Plus'}</small><h3>${r.name}</h3><p>${r.about}</p>${available?'':'<em>🔒 Requiere acceso total</em>'}</span><b>›</b></button>`}).join('');
    $$('.route-card').forEach(btn=>btn.addEventListener('click',()=>openRoute(Number(btn.dataset.index))));
    updateProgress();
  }
  function firstPending(routeIndex) {
    const route=routes[routeIndex];
    const pending=route.missions.findIndex((_,i)=>!completed.has(`${route.id}-${i}`));
    return pending<0?0:pending;
  }
  function openRoute(routeIndex,index=firstPending(routeIndex)) {
    const route=routes[routeIndex];
    if(!(window.RaicesAccess?.require(route.tier,route.name)??route.tier==='libre'))return;
    active={routeIndex,index}; attempts=0; shell.hidden=false; document.body.style.overflow='hidden'; renderMission();
  }
  function renderMission() {
    const {routeIndex,index}=active, route=routes[routeIndex], m=route.missions[index];
    $('#mission-route').textContent=route.name; $('#mission-title').textContent=m[0]; $('#mission-level').textContent=`Misión ${index+1}`; $('#mission-score').textContent=`${route.missions.filter((_,i)=>completed.has(`${route.id}-${i}`)).length}/5`; $('#route-progress').value=route.missions.filter((_,i)=>completed.has(`${route.id}-${i}`)).length;
    $('#mission-instruction').textContent=m[1]; $('#mission-model').innerHTML=m[2]; $('#mission-question').textContent=m[3]; $('#mission-hint').textContent=`Pista: ${m[6]}`; $('#mission-hint').hidden=true;
    $('#mission-feedback').className='feedback'; $('#mission-feedback').innerHTML='<span class="signal" aria-hidden="true"></span><p>Elige una respuesta cuando estés listo.</p>';
    $('#next-mission').disabled=true; $('#next-mission').textContent=index===4?'Terminar ruta ✓':'Siguiente misión →';
    const choices=m[4].map((text,i)=>({text,i}));
    if(settings.support==='desafio') choices.sort(()=>Math.random()-.5);
    $('#mission-answers').innerHTML=choices.map(({text,i})=>`<button class="answer" type="button" data-answer="${i}">${text}</button>`).join('');
    $$('.answer',$('#mission-answers')).forEach(btn=>btn.addEventListener('click',()=>checkAnswer(btn,Number(btn.dataset.answer))));
    setTimeout(()=>speak(`${m[0]}. ${m[1]} ${m[3]}`,true),250);
  }
  function checkAnswer(button,choice) {
    const route=routes[active.routeIndex], m=route.missions[active.index], feedback=$('#mission-feedback');
    if(choice===m[5]) {
      $$('.answer',$('#mission-answers')).forEach(b=>b.disabled=true); button.classList.add('correct'); completed.add(`${route.id}-${active.index}`); save(); updateProgress(); celebrate();
      feedback.className='feedback success'; feedback.innerHTML='<span class="signal" aria-hidden="true"></span><p>¡Lo descubriste! La luz verde nos dice que podemos avanzar.</p>'; $('#next-mission').disabled=false; speak('¡Lo descubriste! Puedes avanzar a la siguiente misión.',true);
    } else {
      attempts++; button.classList.add('retry'); beep(false); const phrase=gentlePhrases[(attempts-1)%gentlePhrases.length]; feedback.className='feedback gentle'; feedback.innerHTML=`<span class="signal" aria-hidden="true"></span><p>${phrase}</p>`; if(attempts>=2 || settings.support==='ayuda') $('#mission-hint').hidden=false; speak(`${phrase} ${attempts>=2?m[6]:''}`,true);
    }
  }
  function nextMission() {
    const route=routes[active.routeIndex];
    if(active.index<4){active.index++;attempts=0;renderMission();return}
    speak('Ruta completada. Puedes elegir otro camino o descansar.',true); shell.hidden=true; document.body.style.overflow=''; document.getElementById('rutas').scrollIntoView({behavior:'smooth'});
  }
  function closeMission(){window.RaicesVoice?.stop();shell.hidden=true;document.body.style.overflow=''}
  $$('input[name="support"]').forEach(input=>{input.checked=input.value===settings.support;input.addEventListener('change',()=>{settings.support=input.value;save()})});
  $$('input[name="length"]').forEach(input=>{input.checked=input.value===settings.length;input.addEventListener('change',()=>{settings.length=input.value;save()})});
  $('#start-route').addEventListener('click',()=>{const target=flat.find(x=>!completed.has(x.key))||flat[0];openRoute(target.routeIndex,target.index)});
  $('#hear-welcome').addEventListener('click',()=>speak('Hola, soy Queñal. En matemáticas primero miramos, después representamos y al final usamos números. Elige una ruta y avanzaremos a tu ritmo.',true));
  voiceButton.addEventListener('click',()=>{settings.voice=!settings.voice;voiceButton.setAttribute('aria-pressed',String(settings.voice));voiceButton.textContent=settings.voice?'🔊 Voz activa':'🔇 Voz apagada';if(!settings.voice)window.RaicesVoice?.stop();save()});
  voiceButton.setAttribute('aria-pressed',String(settings.voice)); voiceButton.textContent=settings.voice?'🔊 Voz activa':'🔇 Voz apagada';
  $$('[data-close]').forEach(btn=>btn.addEventListener('click',closeMission)); $('#stop-voice').addEventListener('click',()=>window.RaicesVoice?.stop()); $('#hear-mission').addEventListener('click',()=>{const m=routes[active.routeIndex].missions[active.index];speak(`${m[0]}. ${m[1]} ${m[3]}`,true)}); $('#show-hint').addEventListener('click',()=>{const hint=$('#mission-hint');hint.hidden=false;speak(hint.textContent,true)}); $('#next-mission').addEventListener('click',nextMission);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!shell.hidden)closeMission()});
  renderRoutes();
})();
