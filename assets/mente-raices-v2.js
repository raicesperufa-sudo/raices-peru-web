(() => {
  'use strict';

  const groups = {
    atencion: 'Atención', memoria: 'Memoria', aprendizaje: 'Aprendizaje', comprension: 'Comprensión',
    razonamiento: 'Razonamiento', funciones: 'Funciones ejecutivas', problemas: 'Resolver problemas',
    creatividad: 'Creatividad', comunicacion: 'Comunicación', metacognicion: 'Metacognición'
  };

  const gameRows = [
    ['Tacha las estrellas','atencion','Encuentra las estrellas y supera cinco recorridos.','starLevels'],
    ['El intruso','atencion','Descubre qué elemento rompe el patrón.','oddLevels'],
    ['Cuenta cada figura','atencion','Cuenta, comprueba y aumenta la dificultad.','countLevels'],
    ['Mira, tapa y recuerda','memoria','Observa, tapa y recupera los objetos.','recallLevels'],
    ['Recuerda el camino','memoria','Repite luces y sonidos en tableros 2×2 y 3×3.','simon'],
    ['Palacio de la memoria','memoria','Guarda cinco palabras en una casa imaginaria.','palace'],
    ['Fauna curiosa del Perú','aprendizaje','Elige un animal, lee, tapa el texto y resuelve retos.','animals'],
    ['Antes de saber','aprendizaje','Predice, compara evidencias y mejora tu explicación.','prediction'],
    ['Mapa de una planta','aprendizaje','Relaciona partes, funciones y necesidades.','plantMap'],
    ['Inti y sus pistas','comprension','Lee ocho situaciones y encuentra la evidencia.','readingSeries'],
    ['Sigue las instrucciones','comprension','Recuerda y ejecuta órdenes de uno a ocho pasos.','instructions'],
    ['Ciclos en orden','comprension','Ordena ocho historias y ciclos naturales.','cycles'],
    ['¿Qué sigue?','razonamiento','Completa patrones cada vez más complejos.','patterns'],
    ['La pieza que falta','razonamiento','Observa construcciones e identifica la pieza ausente.','structures'],
    ['La palabra diferente','razonamiento','Clasifica imágenes y palabras en cinco niveles.','categories'],
    ['Cambia la regla','funciones','Escucha la regla, elige y cambia de criterio.','rules'],
    ['Mi plan posible','funciones','Convierte una meta en un plan claro y realizable.','planner'],
    ['Mi día en orden','funciones','Organiza rutinas y avanza por ocho situaciones.','routines'],
    ['Laberinto del bosque','problemas','Guía a Kantu por cinco laberintos dinámicos.','maze'],
    ['Equilibrio de figuras','problemas','Resuelve diez balanzas de dificultad gradual.','balances'],
    ['Cuadrado mágico','problemas','Completa diez desafíos numéricos paso a paso.','mathSeries'],
    ['Dibujo paso a paso','creatividad','Sigue diez trazos y completa una casa.','trace'],
    ['Inventa un animal','creatividad','Combina rasgos y crea un boceto divertido.','creature'],
    ['Diez usos para una taza','creatividad','Imagina usos distintos sin juzgar ideas.','ideaList'],
    ['Caras y palabras','comunicacion','Relaciona expresiones con emociones.','emotionMatch'],
    ['Describe sin decir','comunicacion','Da pistas sin usar la palabra secreta.','taboo'],
    ['Dictado de dibujo','comunicacion','Escucha o lee y dibuja lo que imaginas.','freeDraw'],
    ['Termómetro de dificultad','metacognicion','Indica cómo se sintió el reto.','thermometer'],
    ['Mi caja de estrategias','metacognicion','Elige lo que te ayudó hoy.','strategies'],
    ['Así pensé','metacognicion','Cuenta tu camino, no solo la respuesta.','reflection']
  ];
  const games = gameRows.map((row, index) => ({id:index + 1, title:row[0], group:row[1], intro:row[2], type:row[3]}));

  const $ = selector => document.querySelector(selector);
  const dialog = $('#mind-dialog');
  const body = $('#mind-dialog-body');
  const completeButton = $('#mind-complete');
  const saved = new Set(JSON.parse(localStorage.getItem('raices-mente-progreso') || '[]'));
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let current = null;
  let currentCleanup = () => {};
  let activeFilter = 'all';
  let audioContext = null;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function speak(text) {
    if (!canSpeak || !text) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim());
    utterance.lang = 'es-PE';
    utterance.rate = .9;
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => /^es-PE/i.test(v.lang)) || voices.find(v => /^es/i.test(v.lang)) || null;
    speechSynthesis.speak(utterance);
  }

  function getAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(frequency, duration = .16, type = 'sine', volume = .065, delay = 0) {
    try {
      const audio = getAudio();
      const start = audio.currentTime + delay;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .03);
    } catch (_) { /* el juego continúa aunque el navegador bloquee audio */ }
  }

  function successSound() {
    tone(523.25, .13); tone(659.25, .13, 'sine', .065, .13); tone(783.99, .2, 'sine', .07, .26);
  }

  function gentleCue() { tone(220, .13, 'triangle', .04); tone(196, .18, 'triangle', .04, .13); }

  function confetti() {
    const layer = document.createElement('div');
    layer.className = 'raices-confetti';
    const colors = ['#dc7f58','#e2b954','#4b7790','#6f9277','#ef8c8c','#8f6bb3'];
    for (let i = 0; i < 44; i += 1) {
      const bit = document.createElement('i');
      bit.style.setProperty('--x', `${Math.random() * 100}%`);
      bit.style.setProperty('--dx', `${-90 + Math.random() * 180}px`);
      bit.style.setProperty('--delay', `${Math.random() * .18}s`);
      bit.style.setProperty('--spin', `${240 + Math.random() * 760}deg`);
      bit.style.background = colors[i % colors.length];
      layer.append(bit);
    }
    dialog.querySelector('.mind-dialog-card').append(layer);
    setTimeout(() => layer.remove(), 1500);
  }

  function setFeedback(message, kind = '') {
    const feedback = body.querySelector('.mind-feedback');
    if (!feedback) return;
    feedback.className = `mind-feedback ${kind ? `is-${kind}` : ''}`;
    feedback.innerHTML = message;
  }

  function celebrate(message = '¡Lo lograste!', nextLabel = 'Siguiente reto', nextAction = null) {
    successSound();
    confetti();
    body.classList.remove('mind-warm-flash');
    void body.offsetWidth;
    body.classList.add('mind-success-flash');
    setFeedback(`<span class="feedback-light" aria-hidden="true"></span><strong>${message}</strong>`, 'success');
    speak(message);
    if (nextAction) {
      const old = body.querySelector('[data-next-level]');
      if (old) old.remove();
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'mind-next-level';
      next.dataset.nextLevel = 'true';
      next.textContent = nextLabel;
      next.onclick = nextAction;
      body.append(next);
      setTimeout(() => next.focus(), 250);
    }
  }

  function coach(message = 'Mira con calma y prueba otra vez.') {
    gentleCue();
    body.classList.remove('mind-success-flash');
    void body.offsetWidth;
    body.classList.add('mind-warm-flash');
    setFeedback(`<span class="feedback-light" aria-hidden="true"></span><strong>${message}</strong>`, 'coach');
    speak(message);
  }

  function progress(currentStep, total, label = 'Reto') {
    const level = Math.min(5, Math.max(1, Math.ceil(currentStep / Math.max(1, total / 5))));
    return `<div class="game-progress"><b>Nivel ${level}</b><span>${label} ${currentStep} de ${total}</span><em>${Math.round(currentStep / total * 100)}%</em></div><div class="game-progress-track"><i style="width:${currentStep / total * 100}%"></i></div>`;
  }

  function voiceBar() {
    if (!canSpeak || body.querySelector('.voice-guide')) return;
    const bar = document.createElement('div');
    bar.className = 'voice-guide';
    bar.innerHTML = '<span>Guía de voz</span><button type="button">Escuchar actividad</button><button type="button">Detener</button>';
    bar.children[1].onclick = () => {
      const clone = body.cloneNode(true);
      clone.querySelectorAll('button,input,textarea,canvas,.voice-guide,.raices-confetti').forEach(node => node.remove());
      speak(`${current.title}. ${clone.textContent}`);
    };
    bar.children[2].onclick = () => speechSynthesis.cancel();
    body.prepend(bar);
  }

  function lockCompletion(text = 'Completa los niveles para marcarla') {
    completeButton.disabled = true;
    completeButton.textContent = text;
  }

  function unlockCompletion() {
    completeButton.disabled = false;
    completeButton.textContent = 'Marcar como explorada';
  }

  function finishSeries(game, message = '¡Completaste todos los niveles!') {
    unlockCompletion();
    celebrate(message, 'Cerrar y guardar progreso', () => {
      saved.add(game.id);
      saveProgress();
      closeDialog();
    });
  }

  function saveProgress() {
    localStorage.setItem('raices-mente-progreso', JSON.stringify([...saved]));
    updateProgress();
    renderCards(activeFilter);
  }

  function updateProgress() {
    $('#mind-progress-count').textContent = saved.size;
    $('#mind-progress-bar').style.width = `${saved.size / games.length * 100}%`;
  }

  function renderCards(filter = 'all') {
    const grid = $('#mind-game-grid');
    grid.innerHTML = '';
    games.filter(game => filter === 'all' || game.group === filter).forEach(game => {
      const card = document.createElement('article');
      card.className = `mind-game-card${saved.has(game.id) ? ' is-done' : ''}`;
      card.innerHTML = `<span>${String(game.id).padStart(2,'0')}</span><p>${groups[game.group]}</p><h3>${game.title}</h3><p>${game.intro}</p><button type="button">${saved.has(game.id) ? 'Volver a jugar' : 'Abrir aventura'}</button><b aria-label="Explorada">✓</b>`;
      card.querySelector('button').onclick = () => openGame(game);
      grid.append(card);
    });
  }

  function closeDialog() {
    currentCleanup();
    currentCleanup = () => {};
    if (canSpeak) speechSynthesis.cancel();
    dialog.hidden = true;
    document.body.classList.remove('mind-dialog-open');
  }

  function openGame(game) {
    currentCleanup();
    currentCleanup = () => {};
    if (canSpeak) speechSynthesis.cancel();
    current = game;
    unlockCompletion();
    $('#mind-dialog-title').textContent = game.title;
    $('#mind-dialog-meta').textContent = `Aventura ${game.id} · ${groups[game.group]}`;
    dialog.hidden = false;
    document.body.classList.add('mind-dialog-open');
    buildGame(game);
    voiceBar();
    setTimeout(() => $('#mind-close').focus(), 20);
  }

  function renderChoiceSeries(game, items, renderer, label = 'Reto') {
    lockCompletion();
    let index = 0;
    const draw = () => {
      body.innerHTML = `${progress(index + 1, items.length, label)}${renderer(items[index], index, draw)}`;
      voiceBar();
    };
    const next = () => {
      index += 1;
      if (index >= items.length) finishSeries(game);
      else draw();
    };
    draw();
    return next;
  }

  function buildStars(game) {
    lockCompletion();
    const levels = [
      {cells:24, targets:5, decoys:['✦','●','▲']}, {cells:30, targets:6, decoys:['✦','●','▲','◆']},
      {cells:36, targets:7, decoys:['✦','●','▲','◆','✚']}, {cells:42, targets:8, decoys:['☆','✦','●','▲','◆']},
      {cells:48, targets:9, decoys:['☆','✦','●','▲','◆','✚']}
    ];
    let level = 0;
    function draw() {
      const config = levels[level];
      const cells = Array(config.targets).fill('★');
      while (cells.length < config.cells) cells.push(config.decoys[cells.length % config.decoys.length]);
      const mixed = shuffle(cells);
      body.innerHTML = `${progress(level + 1, levels.length, 'Nivel')}<p class="mind-instruction">Toca únicamente las <strong>estrellas llenas ★</strong>. Hay ${config.targets}.</p><div class="mind-symbol-grid star-grid">${mixed.map(symbol => `<button type="button" aria-label="Símbolo ${symbol}">${symbol}</button>`).join('')}</div><p class="mind-feedback" aria-live="polite">Encontradas: 0 de ${config.targets}.</p>`;
      let hits = 0;
      body.querySelectorAll('.star-grid button').forEach(button => {
        button.onclick = () => {
          if (button.disabled) return;
          if (button.textContent === '★') {
            button.disabled = true;
            button.classList.add('hit');
            tone(420 + hits * 35, .1);
            hits += 1;
            setFeedback(`<strong>¡Bien!</strong> Encontradas: ${hits} de ${config.targets}.`);
            if (hits === config.targets) celebrate('¡Encontraste todas las estrellas!', level === levels.length - 1 ? 'Completar aventura' : 'Siguiente nivel', () => {
              level += 1;
              if (level === levels.length) finishSeries(game, '¡Atención estelar completada!'); else draw();
            });
          } else {
            button.classList.add('try-again');
            setTimeout(() => button.classList.remove('try-again'), 500);
            coach('Mira bien la forma: buscamos la estrella llena ★.');
          }
        };
      });
      voiceBar();
    }
    draw();
  }

  function buildOdd(game) {
    lockCompletion();
    const rounds = [
      {items:['○','○','□','○','○'], odd:2, hint:'Observa cuál tiene esquinas.'},
      {items:['△','△','▽','△','△','△'], odd:2, hint:'Una figura apunta en otra dirección.'},
      {items:['🍎','🍎','🍐','🍎','🍎','🍎'], odd:2, hint:'Busca una fruta diferente.'},
      {items:['12','12','21','12','12','12'], odd:2, hint:'Compara el orden de las cifras.'},
      {items:['b','b','d','b','b','b','b'], odd:2, hint:'Mira hacia qué lado apunta cada letra.'},
      {items:['🌕','🌕','🌑','🌕','🌕','🌕','🌕'], odd:2, hint:'Una luna no está iluminada.'},
      {items:['AB','AB','AB','BA','AB','AB','AB','AB'], odd:3, hint:'Lee el orden de las letras.'},
      {items:['↗','↗','↗','↖','↗','↗','↗','↗','↗'], odd:3, hint:'Sigue la dirección de las flechas.'}
    ];
    let round = 0;
    function draw() {
      const item = rounds[round];
      body.innerHTML = `${progress(round + 1, rounds.length)}<p class="mind-instruction">Descubre cuál elemento rompe el patrón.</p><div class="mind-choice-row odd-row">${item.items.map((value,index) => `<button type="button" data-index="${index}">${value}</button>`).join('')}</div><p class="mind-feedback" aria-live="polite">Compara forma, dirección, color u orden.</p>`;
      body.querySelectorAll('.odd-row button').forEach(button => button.onclick = () => {
        if (+button.dataset.index === item.odd) {
          button.classList.add('correct-answer');
          body.querySelectorAll('.odd-row button').forEach(x => x.disabled = true);
          celebrate('¡Lo encontraste!', round === rounds.length - 1 ? 'Completar aventura' : 'Siguiente intruso', () => {
            round += 1;
            if (round === rounds.length) finishSeries(game, '¡Ocho intrusos descubiertos!'); else draw();
          });
        } else {
          button.classList.add('try-again');
          setTimeout(() => button.classList.remove('try-again'), 500);
          coach(`Todavía no. ${item.hint}`);
        }
      });
      voiceBar();
    }
    draw();
  }

  function buildCount(game) {
    lockCompletion();
    const rounds = [
      ['●','▲','●','■','▲','●','■','●','▲'],
      ['★','◆','★','●','◆','★','●','◆','★','●','★'],
      ['🍃','🌸','🍃','🍃','🌸','☀️','🍃','☀️','🌸','🍃','☀️','🍃'],
      ['1','2','1','3','2','1','3','1','2','3','1','2','1'],
      ['○','●','○','△','●','○','△','○','●','△','○','●','○','△'],
      ['🐟','🐠','🐟','🐡','🐠','🐟','🐡','🐟','🐠','🐡','🐟','🐠','🐟','🐡','🐠'],
      ['A','E','A','I','E','A','O','I','A','E','O','A','I','E','A','O'],
      ['▲','△','■','□','▲','□','△','■','▲','△','□','■','▲','□','△','■','▲','△']
    ];
    let round = 0;
    function draw() {
      const items = rounds[round];
      const counts = {};
      items.forEach(value => { counts[value] = (counts[value] || 0) + 1; });
      body.innerHTML = `${progress(round + 1, rounds.length)}<p class="mind-instruction">Cuenta cada tipo de figura y escribe la cantidad.</p><div class="mind-choice-row symbols count-board">${items.map(value => `<span>${value}</span>`).join('')}</div><div class="mind-counts">${Object.keys(counts).map(value => `<label>${value}<input inputmode="numeric" min="0" data-symbol="${value}" aria-label="Cantidad de ${value}"></label>`).join('')}</div><button class="mind-check" data-check-count>Comprobar</button><p class="mind-feedback" aria-live="polite">Puedes señalar cada figura mientras cuentas.</p>`;
      body.querySelector('[data-check-count]').onclick = () => {
        const inputs = [...body.querySelectorAll('.mind-counts input')];
        const correct = inputs.every(input => +input.value === counts[input.dataset.symbol]);
        inputs.forEach(input => input.classList.toggle('input-error', input.value !== '' && +input.value !== counts[input.dataset.symbol]));
        if (correct) {
          celebrate('¡Las cantidades coinciden!', round === rounds.length - 1 ? 'Completar aventura' : 'Siguiente conteo', () => {
            round += 1;
            if (round === rounds.length) finishSeries(game, '¡Conteo completo!'); else draw();
          });
        } else coach('Cuenta otra vez sin prisa. Recorre de izquierda a derecha.');
      };
      voiceBar();
    }
    draw();
  }

  function buildRecall(game) {
    lockCompletion();
    const pool = [
      ['🔑','llave'],['🍃','hoja'],['🌙','luna'],['☕','taza'],['🐟','pez'],['🔔','campana'],
      ['⚽','pelota'],['📘','libro'],['🌻','flor'],['🕯️','vela'],['🪁','cometa'],['🧢','gorra'],
      ['🥄','cuchara'],['🎒','mochila'],['🚲','bicicleta'],['🧸','oso']
    ];
    const sizes = [4,5,6,7,8,9,10,11];
    let round = 0;
    function draw() {
      const shown = shuffle(pool).slice(0, sizes[round]);
      const distractors = shuffle(pool.filter(item => !shown.some(value => value[1] === item[1]))).slice(0, Math.min(5, 2 + Math.floor(round / 2)));
      body.innerHTML = `${progress(round + 1, sizes.length)}<p class="mind-instruction">Observa los objetos. Cuando estés listo, tapa la bandeja.</p><div class="memory-tray">${shown.map(item => `<span><i>${item[0]}</i><b>${item[1]}</b></span>`).join('')}</div><button class="mind-check" data-hide-memory>Tapar y comenzar</button><div class="memory-answer" hidden></div><p class="mind-feedback" aria-live="polite">Busca una imagen mental, una historia o un recorrido.</p>`;
      body.querySelector('[data-hide-memory]').onclick = () => {
        const tray = body.querySelector('.memory-tray');
        tray.classList.add('is-covered');
        tray.innerHTML = '<div class="memory-cover"><span>🌿</span><strong>La bandeja está tapada</strong></div>';
        body.querySelector('[data-hide-memory]').remove();
        const answer = body.querySelector('.memory-answer');
        const options = shuffle([...shown, ...distractors]);
        answer.hidden = false;
        answer.innerHTML = `<p>Marca solamente los ${shown.length} objetos que viste.</p><div class="memory-options">${options.map(item => `<button type="button" data-name="${item[1]}"><i>${item[0]}</i><span>${item[1]}</span></button>`).join('')}</div><button class="mind-check" data-check-memory>Comprobar recuerdos</button>`;
        body.querySelectorAll('.memory-options button').forEach(button => button.onclick = () => button.classList.toggle('selected'));
        body.querySelector('[data-check-memory]').onclick = () => {
          const selected = [...body.querySelectorAll('.memory-options button.selected')].map(button => button.dataset.name);
          const correct = selected.length === shown.length && selected.every(name => shown.some(item => item[1] === name));
          if (correct) celebrate('¡Recuperaste todos los objetos!', round === sizes.length - 1 ? 'Completar aventura' : 'Siguiente bandeja', () => {
            round += 1;
            if (round === sizes.length) finishSeries(game, '¡Memoria visual completada!'); else draw();
          });
          else coach(`Recuperaste ${selected.filter(name => shown.some(item => item[1] === name)).length} de ${shown.length}. Observa tus elecciones y prueba otra vez.`);
        };
      };
      voiceBar();
    }
    draw();
  }

  function buildSimon(game) {
    lockCompletion('Supera un recorrido para marcarla');
    let size = 2;
    let level = 1;
    let sequence = [];
    let position = 0;
    let locked = true;
    let timers = [];
    let autoPlay = false;
    const palettes = ['#dc7f58','#4b7790','#6f9277','#e2b954','#8f6bb3','#d66060','#46a2a2','#d98c35','#6876bd'];
    const frequencies = [262,330,392,523,294,349,440,587,698];
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function draw() {
      clearTimers();
      const count = size * size;
      body.innerHTML = `<div class="simon-mode"><button type="button" data-size="2" class="${size===2?'is-active':''}">Inicio 2×2</button><button type="button" data-size="3" class="${size===3?'is-active':''}">Avanzado 3×3</button></div><div class="simon-status"><b>Nivel <span>${level}</span></b><em>Longitud: <span>${sequence.length || (size===2?3:4)}</span></em></div><p class="mind-instruction">Mira las luces y escucha los sonidos. Después repite el mismo camino.</p><div class="mind-sequence simon-${size}" style="--simon-size:${size}">${Array.from({length:count},(_,i)=>`<button type="button" data-i="${i}" style="--tile:${palettes[i]}" aria-label="Luz ${i+1}"></button>`).join('')}</div><div class="simon-actions"><button class="mind-check" data-start>${sequence.length?'Reiniciar':'Comenzar'}</button><button class="mind-clear" data-repeat ${sequence.length?'':'disabled'}>Repetir patrón</button></div><p class="mind-feedback" aria-live="polite">Pulsa comenzar para ver el patrón.</p>`;
      body.querySelectorAll('.simon-mode button').forEach(button => button.onclick = () => {
        size = +button.dataset.size;
        level = 1;
        sequence = [];
        draw();
      });
      const board = body.querySelector('.mind-sequence');
      function flash(index, duration = 360) {
        const tile = board.children[index];
        tile.classList.add('lit');
        tone(frequencies[index], duration / 1000);
        later(() => tile.classList.remove('lit'), duration);
      }
      function showPattern() {
        clearTimers();
        locked = true;
        position = 0;
        setFeedback(`Observa y escucha ${sequence.length} señales.`);
        sequence.forEach((value,index) => later(() => flash(value), 380 + index * 540));
        later(() => { locked = false; setFeedback('<strong>Ahora tú:</strong> toca las luces en el mismo orden.'); }, 480 + sequence.length * 540);
      }
      async function begin() {
        getAudio();
        level = 1;
        sequence = Array.from({length:size===2?3:4}, () => Math.floor(Math.random() * count));
        autoPlay = true;
        draw();
      }
      board.querySelectorAll('button').forEach((button,index) => button.onclick = () => {
        if (locked || !sequence.length) return;
        flash(index, 220);
        if (index === sequence[position]) {
          button.classList.add('tap-correct');
          later(() => button.classList.remove('tap-correct'), 260);
          position += 1;
          setFeedback(`<strong>Bien:</strong> ${position} de ${sequence.length}.`);
          if (position === sequence.length) {
            locked = true;
            if (level >= 6) {
              unlockCompletion();
              celebrate(`¡Dominaste el tablero ${size}×${size}!`, 'Elegir otro tablero', () => { sequence=[]; level=1; draw(); });
            } else {
              celebrate('¡Patrón correcto!', 'Agregar una señal', () => {
                level += 1;
                sequence.push(Math.floor(Math.random() * count));
                autoPlay = true;
                draw();
              });
            }
          }
        } else {
          locked = true;
          button.classList.add('tap-wrong');
          coach('Casi. Mira y escucha el patrón una vez más.');
          later(() => { button.classList.remove('tap-wrong'); showPattern(); }, 1100);
        }
      });
      body.querySelector('[data-start]').onclick = begin;
      body.querySelector('[data-repeat]').onclick = showPattern;
      voiceBar();
      if (autoPlay && sequence.length) { autoPlay = false; later(showPattern, 160); }
    }
    currentCleanup = clearTimers;
    draw();
  }

  function buildPalace(game) {
    lockCompletion();
    const rooms = [['🚪','Entrada'],['🛋️','Sala'],['🍳','Cocina'],['🛏️','Cuarto'],['🌳','Jardín']];
    const words = ['PAN','LUNA','PERRO','LLAVE','PELOTA'];
    const scenes = {PAN:'baila y deja migas',LUNA:'brilla con un sombrero',PERRO:'canta una canción',LLAVE:'salta como una rana',PELOTA:'rebota hasta el techo'};
    let placed = Array(5).fill(null), solution = null, selected = null, phase = 'place';
    body.innerHTML = '<div class="palace-steps"><b class="is-active">1 · Coloca</b><b>2 · Imagina</b><b>3 · Recuerda</b></div><p class="palace-phase-note">Elige una palabra y un lugar. Crea una imagen exagerada.</p><div class="palace-bank"></div><div class="palace-route"></div><div class="palace-actions"><button class="mind-check" data-main disabled>Tapar y comenzar</button><button class="mind-clear" data-clear>Limpiar</button></div><p class="mind-feedback" aria-live="polite">Primero guarda las cinco palabras.</p>';
    const bank = body.querySelector('.palace-bank'), route = body.querySelector('.palace-route'), main = body.querySelector('[data-main]');
    function renderPalace() {
      bank.innerHTML = '';
      words.forEach(word => {
        const button = document.createElement('button');
        button.textContent = word;
        button.classList.toggle('selected', selected === word);
        button.disabled = placed.includes(word);
        button.onclick = () => { selected = word; renderPalace(); };
        bank.append(button);
      });
      route.innerHTML = '';
      rooms.forEach((room,index) => {
        const button = document.createElement('button');
        button.className = `palace-room${placed[index]?' has-word':''}`;
        button.innerHTML = `<span>${index+1}</span><i>${room[0]}</i><strong>${room[1]}</strong><em>${placed[index]||'Lugar vacío'}</em>${phase==='place'&&placed[index]?`<small>Imagina: ${placed[index].toLowerCase()} ${scenes[placed[index]]}.</small>`:''}`;
        button.onclick = () => {
          if (selected) { const old=placed.indexOf(selected); if(old>=0) placed[old]=null; placed[index]=selected; selected=null; }
          else if (placed[index]) placed[index]=null;
          renderPalace();
        };
        route.append(button);
      });
      main.disabled = placed.some(value => !value);
    }
    main.onclick = () => {
      if (phase === 'place') {
        solution = [...placed]; phase = 'imagine'; bank.hidden = true;
        route.querySelectorAll('.palace-room').forEach(card => card.classList.add('covered'));
        main.disabled = false; main.textContent = 'Ya recorrí la casa';
        setFeedback('Recorre mentalmente: entrada, sala, cocina, cuarto y jardín.');
      } else if (phase === 'imagine') {
        phase='recall'; placed=Array(5).fill(null); selected=null; bank.hidden=false; main.textContent='Comprobar recuerdos'; renderPalace();
        setFeedback('Devuelve cada palabra al lugar donde la imaginaste.');
      } else {
        let hits=0;
        [...route.children].forEach((card,index) => { const ok=placed[index]===solution[index]; card.classList.toggle('correct',ok); card.classList.toggle('wrong',!ok); if(ok) hits+=1; });
        if(hits===5){ unlockCompletion(); celebrate('¡Cinco de cinco recuerdos!'); }
        else coach(`Recuperaste ${hits} de 5. Conserva los verdes y cambia los lugares amarillos.`);
      }
    };
    body.querySelector('[data-clear]').onclick = () => { placed=Array(5).fill(null); selected=null; renderPalace(); };
    renderPalace();
  }

  const animalLibrary = {
    condor:{name:'Cóndor andino',icon:'🦅',image:'assets/condor-andino-raices.webp',challenges:[
      {t:'El cóndor aprovecha las corrientes de aire para planear grandes distancias moviendo poco las alas.',q:'¿Qué le ayuda a ahorrar energía?',a:['Las corrientes de aire','Correr por el suelo','Esconder las alas'],ok:0,e:'Las corrientes elevan al ave y reducen el esfuerzo.'},
      {t:'El cóndor es carroñero: consume animales que ya murieron y ayuda a retirar restos del ambiente.',q:'¿Cuál es su aporte al ecosistema?',a:['Ayuda a limpiar restos','Hace crecer árboles con sus alas','Produce agua'],ok:0,e:'Su alimentación cumple una función de limpieza natural.'},
      {t:'El cóndor madura lentamente y cría pocos pichones. Por eso una población que pierde adultos tarda en recuperarse.',q:'¿Qué acción se justifica mejor?',a:['Evitar la muerte de adultos','Esperar muchos pichones cada año','Acercarse a sus nidos'],ok:0,e:'En una especie de reproducción lenta, cada adulto es muy importante.'}
    ]},
    oso:{name:'Oso andino',icon:'🐻',challenges:[
      {t:'El oso andino tiene manchas claras alrededor de los ojos. El dibujo de esas manchas es diferente en cada individuo.',q:'¿Para qué pueden servir las manchas?',a:['Para reconocer individuos','Para saber su edad exacta','Para volar de noche'],ok:0,e:'Las manchas funcionan como una señal individual.'},
      {t:'Al comer frutos y desplazarse por el bosque, el oso dispersa semillas que pueden originar nuevas plantas.',q:'¿Por qué lo llaman arquitecto del bosque?',a:['Ayuda a regenerarlo','Construye casas de madera','Derriba todos los árboles'],ok:0,e:'Dispersar semillas favorece la regeneración del bosque.'},
      {t:'El oso necesita moverse entre distintas zonas para encontrar alimento. La fragmentación separa esos espacios.',q:'¿Qué medida protege mejor su recorrido?',a:['Conservar corredores de bosque','Encerrarlo en un solo árbol','Quitar la vegetación'],ok:0,e:'Los corredores conectan los lugares que necesita.'}
    ]},
    camelidos:{name:'Vicuña y alpaca',icon:'🦙',challenges:[
      {t:'La vicuña es silvestre y esbelta; la alpaca es doméstica y suele tener un vellón abundante.',q:'¿Cuál vive bajo cuidado humano?',a:['La alpaca','La vicuña','Las dos son siempre silvestres'],ok:0,e:'La alpaca es un camélido doméstico.'},
      {t:'Sus almohadillas les permiten caminar sobre suelos andinos con menor impacto que una pezuña dura.',q:'¿Qué ventaja tienen sus almohadillas?',a:['Cuidan mejor el suelo','Les permiten respirar','Cambian el clima'],ok:0,e:'Distribuyen el peso y reducen el daño al terreno.'},
      {t:'La fibra protege del frío. En la vicuña es especialmente fina y su aprovechamiento requiere manejo responsable.',q:'¿Qué idea integra producción y cuidado?',a:['Obtener fibra sin dañar al animal','Cortar toda la fibra sin control','Cazar vicuñas libremente'],ok:0,e:'El aprovechamiento sostenible protege al animal y su población.'}
    ]},
    gallito:{name:'Gallito de las rocas',icon:'🐦',challenges:[
      {t:'El gallito de las rocas peruano vive en bosques húmedos de la vertiente oriental de los Andes.',q:'¿Qué ambiente necesita?',a:['Bosques húmedos','Desiertos sin plantas','Hielo marino'],ok:0,e:'Es un ave de bosques húmedos andinos.'},
      {t:'Come muchos frutos silvestres y puede transportar semillas a otros lugares.',q:'¿Qué función puede cumplir?',a:['Dispersar semillas','Secar los ríos','Construir carreteras'],ok:0,e:'Al desplazarse después de comer frutos, puede dispersar semillas.'},
      {t:'Los machos se reúnen en lugares de exhibición. El ruido y la cercanía excesiva pueden interrumpir su conducta.',q:'¿Cómo observarlos responsablemente?',a:['A distancia y en silencio','Persiguiéndolos','Tocando sus nidos'],ok:0,e:'La distancia reduce la perturbación.'}
    ]},
    delfin:{name:'Delfín rosado',icon:'🐬',challenges:[
      {t:'El delfín rosado vive en ríos amazónicos y usa sonidos para orientarse y encontrar alimento.',q:'¿Dónde vive?',a:['En ríos amazónicos','En lagunas heladas','En montañas secas'],ok:0,e:'Es un mamífero de agua dulce de la Amazonía.'},
      {t:'Cuando el agua está turbia, la vista ayuda menos. Sus sonidos rebotan en objetos y regresan con información.',q:'¿Por qué son útiles esos sonidos?',a:['Le ayudan a orientarse','Cambian el color del agua','Hacen crecer peces'],ok:0,e:'El eco le aporta información aunque el agua no sea transparente.'},
      {t:'La contaminación y las redes de pesca pueden afectarlo aunque no sean dirigidas a él.',q:'¿Qué acción reduce el riesgo?',a:['Mantener ríos limpios y usar pesca responsable','Dejar residuos en el agua','Cerrar todos los bosques'],ok:0,e:'El cuidado del río y la pesca responsable protegen su hábitat.'}
    ]},
    pinguino:{name:'Pingüino de Humboldt',icon:'🐧',challenges:[
      {t:'El pingüino de Humboldt vive en la costa e islas y nada en las aguas frías del mar peruano.',q:'¿Qué ambiente prefiere?',a:['Aguas marinas frías','Ríos de montaña','Bosques secos'],ok:0,e:'Habita la costa influida por la corriente de Humboldt.'},
      {t:'Su cuerpo tiene forma hidrodinámica y sus alas funcionan como aletas dentro del agua.',q:'¿Para qué le sirve esa forma?',a:['Para nadar con eficacia','Para trepar árboles','Para correr en arena caliente'],ok:0,e:'La forma reduce la resistencia del agua.'},
      {t:'Necesita alimento marino y lugares seguros para descansar y reproducirse.',q:'¿Qué protección es más completa?',a:['Cuidar mar e islas','Cuidar solo una roca','Dar comida desde la playa'],ok:0,e:'Su ciclo depende tanto del agua como de lugares costeros seguros.'}
    ]},
    perro:{name:'Perro peruano sin pelo',icon:'🐕',challenges:[
      {t:'El perro peruano sin pelo es una raza originaria del Perú reconocida por su escaso o nulo pelaje.',q:'¿Cuál es su rasgo más visible?',a:['Tiene poco o ningún pelo','Posee plumas','Vive solo en el mar'],ok:0,e:'Su apariencia característica se debe a la falta de pelaje.'},
      {t:'Al tener la piel expuesta necesita protección responsable frente al sol intenso y al frío.',q:'¿Qué cuidado se deduce?',a:['Proteger su piel','Cortarle plumas','Mantenerlo siempre mojado'],ok:0,e:'La piel expuesta requiere cuidados frente al clima.'},
      {t:'Es parte del patrimonio cultural peruano y aparece representado desde tiempos antiguos.',q:'¿Por qué su cuidado también es cultural?',a:['Conecta con la historia del Perú','Porque solo sabe cazar','Porque cambia de especie'],ok:0,e:'La raza forma parte de la historia y la identidad cultural.'}
    ]}
  };

  function buildAnimals(game) {
    lockCompletion('Completa una ruta animal para marcarla');
    let selected = null, index = 0;
    function choose() {
      body.innerHTML = '<p class="mind-instruction">Elige qué animal peruano quieres investigar.</p><div class="animal-selector">'+Object.entries(animalLibrary).map(([key,animal])=>`<button type="button" data-animal="${key}"><span>${animal.icon}</span><strong>${animal.name}</strong><small>3 niveles</small></button>`).join('')+'</div><p class="mind-feedback">Cada ruta empieza con una idea directa y termina con una pregunta para analizar.</p>';
      body.querySelectorAll('[data-animal]').forEach(button => button.onclick=()=>{selected=button.dataset.animal;index=0;draw();});
      voiceBar();
    }
    function draw() {
      const animal=animalLibrary[selected], item=animal.challenges[index], options=shuffle(item.a.map((text,i)=>({text,correct:i===item.ok})));
      body.innerHTML=`${progress(index+1,animal.challenges.length,'Nivel')}<button class="animal-back" type="button">← Cambiar animal</button><section class="animal-reading">${animal.image?`<img src="${animal.image}" alt="${animal.name}">`:`<div class="animal-portrait" aria-label="${animal.name}">${animal.icon}</div>`}<div><p class="section-kicker">${animal.name}</p><p>${item.t}</p><button type="button" class="mind-check" data-animal-start>Iniciar reto y tapar lectura</button></div></section><section class="animal-question" hidden><div class="animal-cover"><span>${animal.icon}</span><strong>La lectura está tapada</strong></div><h3>${item.q}</h3><div class="mind-options">${options.map(option=>`<button type="button" data-correct="${option.correct}">${option.text}</button>`).join('')}</div><p class="mind-feedback">Elige la respuesta que se apoya mejor en la lectura.</p></section>`;
      body.querySelector('.animal-back').onclick=choose;
      const reading=body.querySelector('.animal-reading'), question=body.querySelector('.animal-question');
      body.querySelector('[data-animal-start]').onclick=()=>{reading.hidden=true;question.hidden=false;speak(item.q);};
      body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{
        if(button.dataset.correct==='true'){
          body.querySelectorAll('.mind-options button').forEach(x=>x.disabled=true);button.classList.add('correct-answer');
          celebrate(`¡Correcto! ${item.e}`,index===animal.challenges.length-1?'Terminar esta ruta':'Siguiente nivel',()=>{index+=1;if(index===animal.challenges.length){unlockCompletion();celebrate(`¡Completaste la ruta del ${animal.name}!`,'Elegir otro animal',choose);}else draw();});
        }else{button.classList.add('wrong-answer');coach('Revisa la idea principal y vuelve a intentarlo.');}
      });
      voiceBar();
    }
    choose();
  }

  function buildPrediction(game) {
    lockCompletion();
    const labs=[
      {q:'¿Qué necesita una semilla para comenzar a germinar?',facts:'La germinación necesita agua, oxígeno y una temperatura adecuada. La luz puede ser importante después para el crecimiento.',keys:['agua','aire','oxígeno','temperatura','calor'],next:'Coloca dos semillas iguales: una con agua y otra sin agua. Observa sin cambiar otras condiciones.'},
      {q:'¿Qué cubo de hielo se derretirá primero: uno al sol o uno a la sombra? ¿Por qué?',facts:'El cubo que recibe más energía térmica suele derretirse antes.',keys:['sol','calor','temperatura','energía'],next:'Usa cubos del mismo tamaño y mide el tiempo en ambos lugares.'},
      {q:'¿Una planta crecerá igual dentro de una caja cerrada que cerca de una ventana?',facts:'Las plantas necesitan luz para fabricar alimento; con poca luz pueden debilitarse o crecer de manera anormal.',keys:['luz','sol','ventana','alimento'],next:'Compara dos plantas semejantes y registra altura, color y número de hojas.'},
      {q:'¿Un avión de papel con alas anchas volará igual que uno con alas estrechas?',facts:'La forma de las alas cambia la sustentación y la resistencia del aire.',keys:['alas','aire','forma','peso'],next:'Usa el mismo papel y la misma fuerza de lanzamiento; cambia solo las alas.'},
      {q:'¿Dónde se secará antes una tela húmeda: extendida o hecha una bola?',facts:'Al extenderla, una mayor superficie queda expuesta al aire y facilita la evaporación.',keys:['aire','superficie','extendida','evapor'],next:'Moja dos telas iguales con la misma cantidad de agua y compara.'},
      {q:'¿Qué pasará con una sombra cuando el objeto se acerque a una linterna?',facts:'Al acercar el objeto a la fuente de luz, la sombra suele verse más grande.',keys:['luz','cerca','grande','distancia'],next:'Mueve un objeto entre la linterna y una pared; marca tres posiciones.'}
    ];
    let index=0;
    function draw(){const lab=labs[index];body.innerHTML=`${progress(index+1,labs.length,'Investigación')}<p class="mind-instruction">Primero piensa. Una buena predicción dice <strong>qué crees</strong> y <strong>por qué</strong>.</p><label class="mind-writing"><span>${lab.q}</span><textarea rows="5" placeholder="Creo que… porque…"></textarea></label><button class="mind-check" data-analyze>Analizar mi idea</button><div class="prediction-report" hidden></div><p class="mind-feedback">Tu idea no necesita ser perfecta; sí necesita una razón que podamos comprobar.</p>`;
      body.querySelector('[data-analyze]').onclick=()=>{const text=body.querySelector('textarea').value.trim(),lower=text.toLowerCase();if(text.length<18){coach('Escribe qué crees que ocurrirá y agrega una razón.');return;}const hasReason=/porque|ya que|debido|entonces|por eso/.test(lower),hasClue=lab.keys.some(key=>lower.includes(key));const report=body.querySelector('.prediction-report');report.hidden=false;report.innerHTML=`<h3>Tu mesa de análisis</h3><div class="rubric"><span class="${text.length>=18?'yes':''}">✓ Predicción visible</span><span class="${hasReason?'yes':''}">${hasReason?'✓':'○'} Explica una causa</span><span class="${hasClue?'yes':''}">${hasClue?'✓':'○'} Usa una pista científica</span></div><p><strong>Lo que sabemos:</strong> ${lab.facts}</p><p><strong>Cómo comprobarlo:</strong> ${lab.next}</p>`;if(hasReason&&hasClue)celebrate('¡Tu predicción tiene idea, razón y pista!',index===labs.length-1?'Completar laboratorio':'Siguiente investigación',()=>{index+=1;if(index===labs.length)finishSeries(game,'¡Completaste el laboratorio de predicciones!');else draw();});else coach('Tu idea ya empezó. Añade una causa o una pista que podamos observar.');};voiceBar();}
    draw();
  }

  function buildPlantMap(game) {
    lockCompletion();
    const rounds=[
      [['Raíz','absorbe agua'],['Tallo','sostiene'],['Hoja','recibe luz']],
      [['Flor','participa en la reproducción'],['Fruto','protege semillas'],['Semilla','puede originar otra planta']],
      [['Agua','viaja desde la raíz'],['Luz','aporta energía'],['Suelo','ofrece soporte y minerales']]
    ];let round=0,first=null,hits=0;
    function draw(){const pairs=rounds[round];hits=0;first=null;body.innerHTML=`${progress(round+1,rounds.length,'Mapa')}<p class="mind-instruction">Une cada elemento con su función.</p><div class="mind-match plant-match">${shuffle(pairs.flat()).map(value=>`<button type="button">${value}</button>`).join('')}</div><p class="mind-feedback">Elige dos tarjetas relacionadas.</p>`;body.querySelectorAll('.plant-match button').forEach(button=>button.onclick=()=>{if(button.disabled)return;if(!first){first=button;button.classList.add('selected');return;}const correct=pairs.some(pair=>pair.includes(first.textContent)&&pair.includes(button.textContent));if(correct){first.disabled=button.disabled=true;first.classList.remove('selected');hits+=1;tone(480+hits*50,.1);if(hits===pairs.length)celebrate('¡Mapa conectado!',round===rounds.length-1?'Completar aventura':'Siguiente mapa',()=>{round+=1;if(round===rounds.length)finishSeries(game);else draw();});else setFeedback('¡Relación correcta! Sigue conectando.');}else{first.classList.remove('selected');coach('Esas dos tarjetas no forman la misma relación.');}first=null;});voiceBar();}draw();
  }

  const readingChallenges=[
    {t:'Inti vio nubes oscuras y sintió gotas. Guardó su cuaderno dentro de la mochila.',q:'¿Por qué guardó el cuaderno?',a:['Para protegerlo de la lluvia','Porque terminó de dibujar','Porque quería correr'],ok:0,e:'Las nubes y las gotas anuncian lluvia.'},
    {t:'Killa dejó una botella con agua junto a la puerta antes de salir a caminar bajo el sol.',q:'¿Qué necesidad anticipó?',a:['Tener agua durante la caminata','Regar una planta de noche','Guardar una llave'],ok:0,e:'El sol y la caminata hacen importante hidratarse.'},
    {t:'La abuela apagó la hornilla, se puso un guante y recién entonces levantó la olla.',q:'¿Qué muestra esa secuencia?',a:['Previno una quemadura','Olvidó cocinar','Quería enfriar la cocina'],ok:0,e:'Apagar y usar un guante son acciones de seguridad.'},
    {t:'El camino estaba cubierto de hojas mojadas. Mateo avanzó más despacio y apoyó bien cada pie.',q:'¿Por qué cambió su manera de caminar?',a:['Para evitar resbalar','Para llegar antes','Para hacer ruido'],ok:0,e:'Las hojas mojadas pueden ser resbalosas.'},
    {t:'Amaru comparó dos plantas. Una estaba verde junto a la ventana; la otra, pálida dentro de un armario.',q:'¿Qué explicación tiene más apoyo?',a:['La diferencia de luz influyó','El armario le dio más sol','Las plantas no necesitan luz'],ok:0,e:'La ubicación cambia la cantidad de luz recibida.'},
    {t:'Sara leyó una noticia y antes de compartirla buscó la fecha, el autor y otra fuente que dijera lo mismo.',q:'¿Qué estrategia usó?',a:['Verificó la información','Memorizó el título','Cambió la noticia'],ok:0,e:'Comparar fuentes y revisar autor y fecha ayuda a verificar.'},
    {t:'En el huerto había menos abejas y varias flores no formaron frutos. Ese año también se usaron más pesticidas.',q:'¿Qué relación conviene investigar?',a:['Pesticidas, abejas y formación de frutos','Color de las macetas y tamaño del cielo','Número de piedras y viento'],ok:0,e:'La disminución de polinizadores puede relacionarse con el uso de pesticidas y los frutos.'},
    {t:'Dos grupos limpiaron el mismo sendero. Uno separó residuos y registró de dónde provenían; el otro solo los retiró. Semanas después, el primer grupo cambió carteles y redujo nuevos residuos.',q:'¿Qué hizo más útil su acción?',a:['Usó los datos para prevenir','Trabajó sin observar','Ocultó los residuos'],ok:0,e:'Registrar el origen permitió tomar una decisión preventiva.'}
  ];

  function buildReadings(game){lockCompletion();let index=0;function draw(){const item=readingChallenges[index],options=shuffle(item.a.map((text,i)=>({text,correct:i===item.ok})));body.innerHTML=`${progress(index+1,readingChallenges.length,'Lectura')}<section class="reading-card"><p>${item.t}</p></section><h3 class="challenge-title">${item.q}</h3><div class="mind-options">${options.map(option=>`<button type="button" data-correct="${option.correct}">${option.text}</button>`).join('')}</div><p class="mind-feedback">Busca la pista dentro de la lectura.</p>`;body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{if(button.dataset.correct==='true'){body.querySelectorAll('.mind-options button').forEach(x=>x.disabled=true);button.classList.add('correct-answer');celebrate(`¡Comprendiste la pista! ${item.e}`,index===readingChallenges.length-1?'Completar lecturas':'Siguiente lectura',()=>{index+=1;if(index===readingChallenges.length)finishSeries(game,'¡Ocho lecturas comprendidas!');else draw();});}else{button.classList.add('wrong-answer');coach('Vuelve a la lectura y busca la frase que demuestra la respuesta.');}});voiceBar();}draw();}

  function buildInstructions(game){lockCompletion();const symbols=[['🔵','círculo azul'],['🍃','hoja'],['⭐','estrella'],['🔺','triángulo rojo'],['🌙','luna'],['🟨','cuadrado amarillo'],['🐟','pez'],['🔑','llave']];let level=1,target=[],position=0;
    function prepare(){target=shuffle(symbols).slice(0,level).map(item=>item[1]);position=0;body.innerHTML=`${progress(level,8,'Orden')}<section class="instruction-memory"><p class="section-kicker">Lee y recuerda</p><ol>${target.map(value=>`<li>Toca ${value}</li>`).join('')}</ol><button type="button" class="mind-check" data-begin-order>Ya lo recuerdo: empezar</button></section><section class="instruction-play" hidden><div class="instruction-cover">Las órdenes están tapadas</div><div class="instruction-grid">${shuffle(symbols).map(item=>`<button type="button" data-name="${item[1]}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join('')}</div><button type="button" class="mind-clear" data-reread>Volver a leer</button></section><p class="mind-feedback">Cuando estés listo, tapa las órdenes y ejecútalas.</p>`;const memory=body.querySelector('.instruction-memory'),play=body.querySelector('.instruction-play');body.querySelector('[data-begin-order]').onclick=()=>{memory.hidden=true;play.hidden=false;setFeedback(`Orden 1 de ${level}: ¿qué tocabas primero?`);};body.querySelector('[data-reread]').onclick=prepare;body.querySelectorAll('.instruction-grid button').forEach(button=>button.onclick=()=>{if(button.dataset.name===target[position]){button.classList.add('correct-answer');button.disabled=true;position+=1;tone(360+position*55,.1);if(position===target.length)celebrate('¡Seguiste todas las órdenes!',level===8?'Completar aventura':'Aumentar una orden',()=>{level+=1;if(level===9)finishSeries(game,'¡Ocho órdenes recordadas en secuencia!');else prepare();});else setFeedback(`<strong>Bien.</strong> Ahora recuerda la orden ${position+1} de ${level}.`);}else{button.classList.add('try-again');setTimeout(()=>button.classList.remove('try-again'),500);coach('Esa no era la siguiente. Puedes intentarlo o volver a leer.');}});voiceBar();}prepare();}

  const cycles=[
    {name:'La planta',icon:'🌱',items:['Se planta la semilla','Sale el brote','Crecen las hojas','Aparece la flor']},
    {name:'La mariposa',icon:'🦋',items:['Se pone el huevo','Nace la oruga','Se forma la crisálida','Sale la mariposa']},
    {name:'Las fases de la Luna',icon:'🌙',items:['Luna nueva','Cuarto creciente','Luna llena','Cuarto menguante']},
    {name:'El agua',icon:'💧',items:['El sol evapora agua','Se forman nubes','Cae la lluvia','El agua vuelve a ríos']},
    {name:'La rana',icon:'🐸',items:['Se ponen huevos','Nace el renacuajo','Crecen patas','Se forma la rana adulta']},
    {name:'Un mamífero',icon:'🐕',items:['Nace la cría','Se alimenta y crece','Llega a adulto','Puede tener nuevas crías']},
    {name:'El día',icon:'☀️',items:['Amanece','El Sol está alto','Atardece','Llega la noche']},
    {name:'El maíz',icon:'🌽',items:['Se prepara la tierra','Se siembra','La planta crece','Se cosechan mazorcas','Se guardan nuevas semillas']}
  ];
  function buildCycles(game){lockCompletion();let index=0,choice=[];function draw(){const item=cycles[index];choice=[];body.innerHTML=`${progress(index+1,cycles.length,'Ciclo')}<div class="cycle-heading"><span>${item.icon}</span><div><p class="section-kicker">Ordena el ciclo</p><h3>${item.name}</h3></div></div><div class="mind-order cycle-order">${shuffle(item.items.map((text,i)=>({text,i}))).map(entry=>`<button type="button" data-i="${entry.i}">${entry.text}</button>`).join('')}</div><button type="button" class="mind-clear" data-clear-order>Borrar orden</button><p class="mind-feedback">Toca las tarjetas desde el inicio hasta el final.</p>`;body.querySelectorAll('.cycle-order button').forEach(button=>button.onclick=()=>{if(button.dataset.step)return;choice.push(+button.dataset.i);button.dataset.step=choice.length;if(choice.length===item.items.length){const correct=choice.every((value,i)=>value===i);if(correct)celebrate('¡El ciclo tiene sentido!',index===cycles.length-1?'Completar ciclos':'Siguiente ciclo',()=>{index+=1;if(index===cycles.length)finishSeries(game,'¡Ocho ciclos ordenados!');else draw();});else coach('Hay un paso fuera de lugar. Borra y busca qué ocurre primero.');}});body.querySelector('[data-clear-order]').onclick=draw;voiceBar();}draw();}

  const patterns=[
    ['● ▲ ● ▲ ● …',['▲','■','●'],0],['1 2 1 2 1 …',['2','3','1'],0],['A A B A A …',['B','A','C'],0],['2 4 6 8 …',['10','9','12'],0],['🌱 🌿 🌱 🌿 …',['🌱','🌿','🌸'],1],['1 3 5 7 …',['8','9','10'],1],['■ ■ ● ■ ■ …',['●','■','▲'],0],['2 4 8 16 …',['18','24','32'],2],['A C E G …',['H','I','J'],1],['1 1 2 3 5 …',['6','7','8'],2]
  ].map(row=>({q:row[0],a:row[1],ok:row[2]}));
  function buildPatterns(game){lockCompletion();let index=0;function draw(){const item=patterns[index],options=shuffle(item.a.map((text,i)=>({text,correct:i===item.ok})));body.innerHTML=`${progress(index+1,patterns.length,'Patrón')}<div class="mind-question reasoning-sequence">${item.q}</div><div class="mind-options">${options.map(option=>`<button type="button" data-correct="${option.correct}">${option.text}</button>`).join('')}</div><p class="mind-feedback">Busca qué parte se repite o cómo cambia.</p>`;body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{if(button.dataset.correct==='true'){button.classList.add('correct-answer');body.querySelectorAll('.mind-options button').forEach(x=>x.disabled=true);celebrate('¡Encontraste la regla!',index===patterns.length-1?'Completar patrones':'Siguiente patrón',()=>{index+=1;if(index===patterns.length)finishSeries(game,'¡Diez patrones resueltos!');else draw();});}else coach('Observa los saltos o el bloque que se repite.');});voiceBar();}draw();}

  const structureLevels=[
    {scene:'tower',title:'La torre',question:'¿Qué pieza permite entrar?',options:['Puerta','Chimenea','Rueda'],ok:0},
    {scene:'car',title:'El automóvil',question:'¿Qué pieza necesita para rodar?',options:['Rueda','Ventana','Techo'],ok:0},
    {scene:'house',title:'La casa',question:'¿Qué pieza deja pasar la luz?',options:['Ventana','Base','Puente'],ok:0},
    {scene:'bridge',title:'El puente',question:'¿Qué pieza sostiene el tramo central?',options:['Pilar','Volante','Chimenea'],ok:0},
    {scene:'bike',title:'La bicicleta',question:'¿Qué pieza transmite el movimiento de los pedales?',options:['Cadena','Teja','Columna'],ok:0}
  ];
  function drawStructure(canvas,scene){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#e8f3f1';ctx.fillRect(0,0,w,h);ctx.fillStyle='#cde5ef';ctx.fillRect(0,0,w,170);ctx.fillStyle='#7ea37d';ctx.fillRect(0,170,w,70);ctx.lineWidth=7;ctx.strokeStyle='#173a5e';ctx.fillStyle='#df8a62';
    if(scene==='tower'){ctx.fillRect(190,45,220,170);ctx.strokeRect(190,45,220,170);ctx.fillStyle='#f4cf6b';[210,285,360].forEach(x=>ctx.fillRect(x,80,30,38));ctx.setLineDash([10,8]);ctx.strokeRect(275,155,50,60);ctx.setLineDash([]);}
    if(scene==='car'){ctx.fillRect(145,105,310,70);ctx.strokeRect(145,105,310,70);ctx.beginPath();ctx.moveTo(220,105);ctx.lineTo(270,60);ctx.lineTo(380,60);ctx.lineTo(420,105);ctx.fill();ctx.stroke();ctx.fillStyle='#d7edf2';ctx.fillRect(280,70,85,35);ctx.setLineDash([10,8]);ctx.strokeStyle='#dc7f58';ctx.beginPath();ctx.arc(210,180,28,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(400,180,28,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    if(scene==='house'){ctx.fillRect(185,90,230,130);ctx.strokeRect(185,90,230,130);ctx.beginPath();ctx.moveTo(160,90);ctx.lineTo(300,25);ctx.lineTo(440,90);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#8c5b3f';ctx.fillRect(275,150,50,70);ctx.setLineDash([10,8]);ctx.strokeStyle='#dc7f58';ctx.strokeRect(350,115,40,40);ctx.setLineDash([]);}
    if(scene==='bridge'){ctx.strokeStyle='#173a5e';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(60,95);ctx.lineTo(540,95);ctx.stroke();ctx.lineWidth=7;ctx.fillStyle='#df8a62';ctx.fillRect(70,100,55,115);ctx.fillRect(475,100,55,115);ctx.setLineDash([10,8]);ctx.strokeStyle='#dc7f58';ctx.strokeRect(275,100,50,115);ctx.setLineDash([]);ctx.fillStyle='#4b7790';ctx.fillRect(0,215,600,25);}
    if(scene==='bike'){ctx.strokeStyle='#173a5e';ctx.lineWidth=7;[180,420].forEach(x=>{ctx.beginPath();ctx.arc(x,165,55,0,Math.PI*2);ctx.stroke();});ctx.beginPath();ctx.moveTo(180,165);ctx.lineTo(280,90);ctx.lineTo(350,165);ctx.lineTo(180,165);ctx.moveTo(280,90);ctx.lineTo(420,165);ctx.moveTo(270,75);ctx.lineTo(320,75);ctx.stroke();ctx.setLineDash([10,8]);ctx.strokeStyle='#dc7f58';ctx.beginPath();ctx.arc(300,145,38,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    ctx.fillStyle='#fff7db';ctx.strokeStyle='#dc7f58';ctx.lineWidth=4;ctx.beginPath();ctx.arc(510,45,27,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#173a5e';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('?',510,56);
  }
  function buildStructures(game){lockCompletion();let index=0;function draw(){const item=structureLevels[index];body.innerHTML=`${progress(index+1,structureLevels.length,'Estructura')}<h3 class="challenge-title">${item.title}: observa qué falta</h3><canvas class="structure-canvas" width="600" height="240" aria-label="Ilustración de ${item.title} con una pieza faltante"></canvas><p class="mind-question">${item.question}</p><div class="mind-options">${shuffle(item.options.map((text,i)=>({text,correct:i===item.ok}))).map(option=>`<button type="button" data-correct="${option.correct}">${option.text}</button>`).join('')}</div><p class="mind-feedback">Piensa qué función debe cumplir la pieza.</p>`;drawStructure(body.querySelector('canvas'),item.scene);body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{if(button.dataset.correct==='true'){button.classList.add('correct-answer');celebrate('¡La estructura vuelve a funcionar!',index===structureLevels.length-1?'Completar estructuras':'Siguiente estructura',()=>{index+=1;if(index===structureLevels.length)finishSeries(game,'¡Cinco estructuras reparadas!');else draw();});}else coach('Esa pieza existe, pero no cumple la función que falta aquí.');});voiceBar();}draw();}

  const categoryRounds=[
    {items:[['🐶','perro'],['🐱','gato'],['🐰','conejo'],['🪑','mesa']],odd:3,why:'Tres son animales; mesa es un mueble.'},
    {items:[['🔴','rojo'],['🔵','azul'],['🟢','verde'],['🎵','cantar']],odd:3,why:'Tres son colores; cantar es una acción.'},
    {items:[['🍎','manzana'],['🍌','plátano'],['🥕','zanahoria'],['🍐','pera']],odd:2,why:'Tres son frutas; zanahoria es una hortaliza.'},
    {items:[['🚗','auto'],['🚌','bus'],['🚲','bicicleta'],['🏠','casa']],odd:3,why:'Tres sirven para transportarse; casa es un lugar.'},
    {items:[['lunes','lunes'],['martes','martes'],['enero','enero'],['miércoles','miércoles']],odd:2,why:'Tres son días; enero es un mes.'},
    {items:[['alegre','alegre'],['contento','contento'],['feliz','feliz'],['gigante','gigante']],odd:3,why:'Tres expresan alegría; gigante expresa tamaño.'},
    {items:[['nadar','nadar'],['correr','correr'],['saltar','saltar'],['azul','azul']],odd:3,why:'Tres son acciones; azul es un color.'},
    {items:[['pétalo','pétalo'],['tallo','tallo'],['raíz','raíz'],['pluma','pluma']],odd:3,why:'Tres son partes de una planta; pluma pertenece a un ave.'},
    {items:[['evaporar','evaporar'],['condensar','condensar'],['llover','llover'],['multiplicar','multiplicar']],odd:3,why:'Tres forman parte del ciclo del agua; multiplicar es una operación.'},
    {items:[['observar','observar'],['comparar','comparar'],['concluir','concluir'],['adivinar sin mirar','adivinar sin mirar']],odd:3,why:'Las tres primeras ayudan a investigar; la última evita usar evidencia.'}
  ];
  function buildCategories(game){lockCompletion();let index=0;function draw(){const item=categoryRounds[index];body.innerHTML=`${progress(index+1,categoryRounds.length,'Grupo')}<p class="mind-instruction">¿Cuál no pertenece al mismo grupo?</p><div class="category-grid">${item.items.map((entry,i)=>`<button type="button" data-i="${i}"><span>${entry[0]}</span><strong>${entry[1]}</strong></button>`).join('')}</div><p class="mind-feedback">Nombra qué comparten tres elementos.</p>`;body.querySelectorAll('.category-grid button').forEach(button=>button.onclick=()=>{if(+button.dataset.i===item.odd){button.classList.add('correct-answer');celebrate(`¡Buena clasificación! ${item.why}`,index===categoryRounds.length-1?'Completar clasificación':'Siguiente grupo',()=>{index+=1;if(index===categoryRounds.length)finishSeries(game,'¡Cinco niveles de clasificación completados!');else draw();});}else coach('Ese elemento sí comparte una característica con otros. Mira las imágenes y palabras.');});voiceBar();}draw();}

  const ruleLevels=[
    {rule:'Toca todos los elementos naranjas',test:item=>item.color==='orange',items:8},
    {rule:'Toca todos los círculos',test:item=>item.shape==='circle',items:9},
    {rule:'Toca solo los triángulos azules',test:item=>item.shape==='triangle'&&item.color==='blue',items:10},
    {rule:'Toca todo lo que NO sea verde',test:item=>item.color!=='green',items:10},
    {rule:'Toca los cuadrados grandes',test:item=>item.shape==='square'&&item.size==='large',items:12},
    {rule:'Toca círculos amarillos o triángulos naranjas',test:item=>(item.shape==='circle'&&item.color==='yellow')||(item.shape==='triangle'&&item.color==='orange'),items:12},
    {rule:'Toca figuras pequeñas que NO sean círculos',test:item=>item.size==='small'&&item.shape!=='circle',items:14},
    {rule:'Toca cuadrados azules grandes y triángulos verdes pequeños',test:item=>(item.shape==='square'&&item.color==='blue'&&item.size==='large')||(item.shape==='triangle'&&item.color==='green'&&item.size==='small'),items:16}
  ];
  function buildRules(game){lockCompletion();let level=0;const colors=['orange','blue','green','yellow'],shapes=['circle','square','triangle'];function makeItems(config){const universe=[];colors.forEach(color=>shapes.forEach(shape=>['small','large'].forEach(size=>universe.push({color,shape,size}))));const valid=universe.filter(config.test),invalid=universe.filter(item=>!config.test(item)),items=[valid[Math.floor(Math.random()*valid.length)],invalid[Math.floor(Math.random()*invalid.length)]];while(items.length<config.items)items.push(universe[Math.floor(Math.random()*universe.length)]);return shuffle(items);}function draw(){const config=ruleLevels[level],items=makeItems(config);body.innerHTML=`${progress(level+1,ruleLevels.length,'Regla')}<div class="rule-banner"><span class="feedback-light"></span><strong>${config.rule}</strong></div><div class="rule-grid">${items.map((item,i)=>`<button type="button" data-i="${i}" data-color="${item.color}" data-shape="${item.shape}" class="${item.size}" aria-label="${item.shape} ${item.color} ${item.size}"><i></i></button>`).join('')}</div><button type="button" class="mind-check" data-check-rule>Comprobar selección</button><p class="mind-feedback">Revisa la regla antes de tocar.</p>`;body.querySelectorAll('.rule-grid button').forEach(button=>button.onclick=()=>button.classList.toggle('selected'));body.querySelector('[data-check-rule]').onclick=()=>{const selected=[...body.querySelectorAll('.rule-grid button')].map((button,i)=>({selected:button.classList.contains('selected'),correct:config.test(items[i]),button}));const correct=selected.every(item=>item.selected===item.correct);if(correct){selected.filter(item=>item.correct).forEach(item=>item.button.classList.add('correct-answer'));celebrate('¡Cambiaste de regla con éxito!',level===ruleLevels.length-1?'Completar reglas':'Nueva regla',()=>{level+=1;if(level===ruleLevels.length)finishSeries(game,'¡Ocho cambios de regla completados!');else draw();});}else{selected.filter(item=>item.selected!==item.correct).forEach(item=>item.button.classList.add('try-again'));coach('Detente, mira la regla actual y revisa las figuras amarillas.');}};voiceBar();}draw();}

  function buildPlanner(game){lockCompletion();body.innerHTML=`<p class="mind-instruction">Construye una meta pequeña. Después RAÍCES la convierte en una agenda clara.</p><div class="planner-form"><label>Mi meta<input data-goal placeholder="Quiero terminar…"></label>${[1,2,3].map(n=>`<label><span>${n}</span>Paso ${n}<input data-step="${n}" placeholder="Una acción pequeña y visible"></label>`).join('')}<div class="planner-details"><label>¿Cuándo empiezo?<input data-when type="date"></label><label>Tiempo por paso<select data-time><option>10 minutos</option><option>20 minutos</option><option>30 minutos</option><option>45 minutos</option></select></label><label>¿Quién puede ayudar?<input data-help placeholder="Persona o recurso"></label></div><button type="button" class="mind-check" data-build-plan>Armar mi agenda</button></div><div class="plan-result" hidden></div><p class="mind-feedback">Una meta funciona mejor cuando cada paso empieza con un verbo.</p>`;
    body.querySelector('[data-build-plan]').onclick=()=>{const goal=body.querySelector('[data-goal]').value.trim(),steps=[...body.querySelectorAll('[data-step]')].map(input=>input.value.trim()),when=body.querySelector('[data-when]').value,time=body.querySelector('[data-time]').value,help=body.querySelector('[data-help]').value.trim();if(goal.length<5||steps.some(step=>step.length<3)){coach('Escribe una meta y completa los tres pasos. Cada paso debe ser una acción.');return;}const verbs=['leer','buscar','anotar','preparar','practicar','ordenar','pedir','hacer','revisar','terminar','dibujar','guardar'],actionScore=steps.filter(step=>verbs.some(verb=>step.toLowerCase().startsWith(verb))).length;const report=body.querySelector('.plan-result');report.hidden=false;report.innerHTML=`<h3>Mi agenda RAÍCES</h3><p class="plan-goal">🎯 ${goal}</p><ol>${steps.map((step,i)=>`<li><b>${i+1}</b><span>${step}</span><small>${time}</small></li>`).join('')}</ol><div class="plan-advice"><p><strong>Primer inicio:</strong> ${when?`el ${new Date(`${when}T12:00:00`).toLocaleDateString('es-PE',{day:'numeric',month:'long'})}`:'elige una fecha antes de cerrar'}.</p><p><strong>Apoyo:</strong> ${help||'anota una persona o recurso que pueda ayudarte'}.</p><p><strong>Revisión:</strong> marca cada paso y ajusta solo uno si resulta demasiado grande.</p><p><strong>Claridad:</strong> ${actionScore===3?'Tus tres pasos empiezan como acciones claras.':'Conviene comenzar cada paso con un verbo: preparar, buscar, practicar o revisar.'}</p></div><button type="button" class="mind-next-level" data-save-plan>Mi plan está listo</button>`;body.querySelector('[data-save-plan]').onclick=()=>{unlockCompletion();celebrate('¡Ya tienes por dónde empezar!');};speak(`Tu meta es ${goal}. Primer paso: ${steps[0]}.`);};voiceBar();}

  const routines=[
    {name:'Mi mañana escolar',items:['Despertar','Vestirse','Desayunar','Preparar la mochila','Salir a la escuela']},
    {name:'Sábado de fútbol',items:['Bañarse','Ponerse ropa deportiva','Preparar agua y pelota','Ir al parque','Jugar fútbol']},
    {name:'Leer un libro',items:['Elegir un libro','Buscar un lugar tranquilo','Leer','Guardar el separador','Devolver el libro a su lugar']},
    {name:'Preparar una ensalada',items:['Lavarse las manos','Lavar los alimentos','Cortar con ayuda adulta','Mezclar','Servir']},
    {name:'Cuidar una planta',items:['Observar la tierra','Comprobar si está seca','Añadir agua si hace falta','Retirar hojas secas','Volver a observar al día siguiente']},
    {name:'Hacer una tarea',items:['Leer la consigna','Reunir materiales','Resolver','Revisar','Guardar']},
    {name:'Cruzar una calle',items:['Detenerse en la vereda','Mirar a ambos lados','Esperar que sea seguro','Cruzar caminando','Llegar a la otra vereda']},
    {name:'Preparar una exposición',items:['Elegir la idea central','Buscar información confiable','Organizar tres ideas','Practicar en voz alta','Presentar']}
  ];
  function buildRoutines(game){lockCompletion();let index=0,choice=[];function draw(){const routine=routines[index];choice=[];body.innerHTML=`${progress(index+1,routines.length,'Rutina')}<h3 class="challenge-title">${routine.name}</h3><div class="mind-order routine-order">${shuffle(routine.items.map((text,i)=>({text,i}))).map(item=>`<button type="button" data-i="${item.i}">${item.text}</button>`).join('')}</div><button type="button" class="mind-clear" data-clear-routine>Borrar orden</button><p class="mind-feedback">Elige qué ocurre primero, después y al final.</p>`;body.querySelectorAll('.routine-order button').forEach(button=>button.onclick=()=>{if(button.dataset.step)return;choice.push(+button.dataset.i);button.dataset.step=choice.length;if(choice.length===routine.items.length){if(choice.every((value,i)=>value===i))celebrate('¡La rutina quedó clara!',index===routines.length-1?'Completar rutinas':'Siguiente rutina',()=>{index+=1;if(index===routines.length)finishSeries(game,'¡Ocho rutinas organizadas!');else draw();});else coach('Ese orden podría causar un problema. Borra y busca la preparación necesaria.');}});body.querySelector('[data-clear-routine]').onclick=draw;voiceBar();}draw();}

  function makeMaze(size){const cells=Array.from({length:size},()=>Array.from({length:size},()=>({walls:[1,1,1,1],seen:false})));const stack=[[0,0]];cells[0][0].seen=true;const dirs=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]];while(stack.length){const [x,y]=stack[stack.length-1],choices=shuffle(dirs).filter(([dx,dy])=>{const nx=x+dx,ny=y+dy;return nx>=0&&ny>=0&&nx<size&&ny<size&&!cells[ny][nx].seen;});if(!choices.length){stack.pop();continue;}const [dx,dy,wall,other]=choices[0],nx=x+dx,ny=y+dy;cells[y][x].walls[wall]=0;cells[ny][nx].walls[other]=0;cells[ny][nx].seen=true;stack.push([nx,ny]);}return cells;}
  function buildMaze(game){lockCompletion();const sizes=[5,7,9,11,13];let level=0,maze,player,activeKeyHandler=null;function drawMaze(ctx,canvas){const size=maze.length,cell=canvas.width/size;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#eff7f1';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#245b49';ctx.lineWidth=Math.max(2,8-size/2);ctx.lineCap='round';for(let y=0;y<size;y++)for(let x=0;x<size;x++){const w=maze[y][x].walls,x0=x*cell,y0=y*cell;ctx.beginPath();if(w[0]){ctx.moveTo(x0,y0);ctx.lineTo(x0+cell,y0);}if(w[1]){ctx.moveTo(x0+cell,y0);ctx.lineTo(x0+cell,y0+cell);}if(w[2]){ctx.moveTo(x0,y0+cell);ctx.lineTo(x0+cell,y0+cell);}if(w[3]){ctx.moveTo(x0,y0);ctx.lineTo(x0,y0+cell);}ctx.stroke();}ctx.font=`${cell*.58}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌳',(size-.5)*cell,(size-.5)*cell);ctx.fillText('🦙',(player.x+.5)*cell,(player.y+.5)*cell);}
    function setup(){if(activeKeyHandler)window.removeEventListener('keydown',activeKeyHandler);maze=makeMaze(sizes[level]);player={x:0,y:0};body.innerHTML=`${progress(level+1,sizes.length,'Laberinto')}<p class="mind-instruction">Lleva a Kantu 🦙 hasta el árbol 🌳 sin atravesar paredes.</p><canvas class="maze-canvas" width="520" height="520" aria-label="Laberinto interactivo nivel ${level+1}"></canvas><div class="maze-controls"><button data-dir="up">↑</button><div><button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button></div></div><button type="button" class="mind-clear" data-new-maze>Nuevo laberinto</button><p class="mind-feedback">Usa las flechas o los botones. Si una pared bloquea, busca otra ruta.</p>`;const canvas=body.querySelector('canvas'),ctx=canvas.getContext('2d');drawMaze(ctx,canvas);function move(dir){const map={up:[0,-1,0],right:[1,0,1],down:[0,1,2],left:[-1,0,3]},[dx,dy,wall]=map[dir],cell=maze[player.y][player.x];if(cell.walls[wall]){coach('Hay una pared. Observa y prueba otra dirección.');return;}player.x+=dx;player.y+=dy;tone(300+(player.x+player.y)*15,.06,'sine',.025);drawMaze(ctx,canvas);if(player.x===maze.length-1&&player.y===maze.length-1)celebrate('¡Encontraste la salida!',level===sizes.length-1?'Completar laberintos':'Laberinto siguiente',()=>{level+=1;if(level===sizes.length)finishSeries(game,'¡Cinco laberintos superados!');else setup();});}body.querySelectorAll('[data-dir]').forEach(button=>button.onclick=()=>move(button.dataset.dir));body.querySelector('[data-new-maze]').onclick=setup;activeKeyHandler=e=>{const keys={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'};if(keys[e.key]){e.preventDefault();move(keys[e.key]);}};window.addEventListener('keydown',activeKeyHandler);currentCleanup=()=>{if(activeKeyHandler)window.removeEventListener('keydown',activeKeyHandler);};voiceBar();}setup();}

  const balances=[
    ['★ + ★ = 10. ¿Cuánto vale ★?',['5','10','2'],0],['● + ● + ● = 12. ¿Cuánto vale ●?',['3','4','6'],1],['▲ + 3 = 8. ¿Cuánto vale ▲?',['5','4','6'],0],['■ + ■ = 14. ¿Cuánto vale ■?',['6','7','8'],1],['★ = 4 y ★ + ● = 10. ¿Cuánto vale ●?',['5','6','7'],1],['▲ + ▲ + 2 = 16. ¿Cuánto vale ▲?',['6','7','8'],1],['■ = 3 y ● = 5. ¿Cuánto es ■ + ● + ●?',['11','13','10'],1],['★ + ● = 12 y ★ = 7. ¿Cuánto vale ●?',['4','5','6'],1],['▲ + ▲ = 18 y ■ = ▲ − 4. ¿Cuánto vale ■?',['4','5','6'],1],['★ + ● = 15 y ★ − ● = 3. ¿Cuánto vale ★?',['6','9','12'],1]
  ].map(row=>({q:row[0],a:row[1],ok:row[2]}));
  function buildBalances(game){buildMathChoiceSeries(game,balances,'Balanza','¡La balanza está equilibrada!','¡Diez balanzas resueltas!');}
  const mathChallenges=[
    ['2 + ? + 6 = 12',['4','3','6'],0],['? + 5 = 11',['5','6','7'],1],['15 − ? = 8',['6','7','8'],1],['3 × ? = 12',['3','4','6'],1],['20 ÷ ? = 5',['2','4','5'],1],['7 + 4 + ? = 18',['6','7','8'],1],['2 × ? + 3 = 13',['4','5','6'],1],['? ÷ 3 = 7',['18','21','24'],1],['4 × ? − 6 = 18',['5','6','7'],1],['(? + 4) × 2 = 24',['6','8','10'],1]
  ].map(row=>({q:row[0],a:row[1],ok:row[2]}));
  function buildMath(game){buildMathChoiceSeries(game,mathChallenges,'Problema','¡Cálculo correcto!','¡Llegaste a los problemas complejos!');}
  function buildMathChoiceSeries(game,items,label,success,finish){lockCompletion();let index=0;function draw(){const item=items[index],options=shuffle(item.a.map((text,i)=>({text,correct:i===item.ok})));body.innerHTML=`${progress(index+1,items.length,label)}<div class="mind-question math-question">${item.q}</div><div class="mind-options">${options.map(option=>`<button type="button" data-correct="${option.correct}">${option.text}</button>`).join('')}</div><p class="mind-feedback">Puedes usar tus dedos, dibujos o cálculo mental.</p>`;body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{if(button.dataset.correct==='true'){button.classList.add('correct-answer');celebrate(success,index===items.length-1?'Completar aventura':'Siguiente problema',()=>{index+=1;if(index===items.length)finishSeries(game,finish);else draw();});}else coach('Comprueba la operación paso por paso y prueba otra opción.');});voiceBar();}draw();}

  const traceSegments=[
    [[160,330],[160,150],'Pared izquierda'],[[160,150],[360,150],'Techo de la pared'],[[360,150],[360,330],'Pared derecha'],[[360,330],[160,330],'Base de la casa'],
    [[140,150],[260,60],'Lado izquierdo del techo'],[[260,60],[380,150],'Lado derecho del techo'],[[225,330],[225,245],'Lado izquierdo de la puerta'],[[225,245],[295,245],'Parte superior de la puerta'],[[295,245],[295,330],'Lado derecho de la puerta'],[[95,350],[425,350],'Camino frente a la casa']
  ];
  function distanceToSegment(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;if(!l2)return Math.hypot(px-ax,py-ay);let t=((px-ax)*dx+(py-ay)*dy)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));}
  function buildTrace(game){lockCompletion();let step=0,done=[];function draw(){body.innerHTML=`${progress(step+1,traceSegments.length,'Trazo')}<p class="mind-instruction">Traza sobre la guía punteada: <strong>${traceSegments[step][2]}</strong>.</p><canvas class="trace-canvas" width="520" height="400" aria-label="Lienzo de dibujo guiado"></canvas><div class="trace-actions"><button type="button" class="mind-clear" data-clear-trace>Borrar mi trazo</button><button type="button" class="mind-check" data-check-trace>Comprobar trazo</button></div><p class="mind-feedback">Empieza cerca del punto naranja y termina cerca del punto verde.</p>`;const canvas=body.querySelector('canvas'),ctx=canvas.getContext('2d'),current=traceSegments[step];let points=[],drawing=false;function paint(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineWidth=8;ctx.strokeStyle='#173a5e';done.forEach(seg=>{ctx.beginPath();ctx.moveTo(...seg[0]);ctx.lineTo(...seg[1]);ctx.stroke();});ctx.save();ctx.setLineDash([12,10]);ctx.strokeStyle='#d7a145';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(...current[0]);ctx.lineTo(...current[1]);ctx.stroke();ctx.restore();ctx.fillStyle='#dc7f58';ctx.beginPath();ctx.arc(...current[0],10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6f9277';ctx.beginPath();ctx.arc(...current[1],10,0,Math.PI*2);ctx.fill();if(points.length){ctx.strokeStyle='#4b7790';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.stroke();}}function pos(e){const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}canvas.onpointerdown=e=>{drawing=true;points=[pos(e)];canvas.setPointerCapture(e.pointerId);paint();};canvas.onpointermove=e=>{if(!drawing)return;points.push(pos(e));paint();};canvas.onpointerup=()=>{drawing=false;};body.querySelector('[data-clear-trace]').onclick=()=>{points=[];paint();};body.querySelector('[data-check-trace]').onclick=()=>{if(points.length<5){coach('Necesito ver un trazo completo desde el punto naranja.');return;}const [a,b]=current,start=points[0],end=points[points.length-1],nearStart=Math.hypot(start[0]-a[0],start[1]-a[1])<42,nearEnd=Math.hypot(end[0]-b[0],end[1]-b[1])<42,close=points.filter(p=>distanceToSegment(p[0],p[1],a[0],a[1],b[0],b[1])<35).length/points.length>.72;if(nearStart&&nearEnd&&close){done.push(current);celebrate('¡Seguiste la guía!',step===traceSegments.length-1?'Ver dibujo completo':'Siguiente trazo',()=>{step+=1;if(step===traceSegments.length){unlockCompletion();body.innerHTML=`<div class="finished-drawing"><canvas width="520" height="400"></canvas><h3>¡Tu casa está completa!</h3><p>Diez trazos pequeños formaron un dibujo entero.</p></div><p class="mind-feedback is-success"><span class="feedback-light"></span><strong>¡Trabajo terminado!</strong></p>`;const final=body.querySelector('canvas'),fctx=final.getContext('2d');fctx.fillStyle='#e8f3f1';fctx.fillRect(0,0,520,400);fctx.strokeStyle='#173a5e';fctx.lineWidth=9;fctx.lineCap='round';done.forEach(seg=>{fctx.beginPath();fctx.moveTo(...seg[0]);fctx.lineTo(...seg[1]);fctx.stroke();});fctx.fillStyle='#e2b954';fctx.beginPath();fctx.arc(440,70,32,0,Math.PI*2);fctx.fill();confetti();successSound();}else draw();});}else coach('Mira la guía: empieza en naranja, sigue cerca de la línea y llega al verde.');};paint();voiceBar();}draw();}

  function buildCreature(game){lockCompletion();body.innerHTML=`<p class="mind-instruction">Combina rasgos. El taller dibujará un <strong>boceto referencial</strong> en este dispositivo.</p><div class="creature-studio"><form class="creature-form"><label>Nombre<input data-creature-name placeholder="Ejemplo: Orejadragón"></label><label>Cabeza<select data-head><option value="rabbit">Conejo</option><option value="bear">Oso</option><option value="bird">Ave</option><option value="fish">Pez</option></select></label><label>Cuerpo<select data-body><option value="round">Redondo</option><option value="long">Alargado</option><option value="tiny">Pequeño</option></select></label><label>Patas<select data-legs><option value="long">Largas</option><option value="short">Cortas</option><option value="wheels">Con ruedas</option></select></label><label>Extra<select data-extra><option value="wings">Alas de dragón</option><option value="tail">Cola enorme</option><option value="horns">Cuernos de colores</option><option value="fins">Aletas</option></select></label><label>Hábitat<select data-home><option value="andes">Andes</option><option value="jungle">Amazonía</option><option value="sea">Mar peruano</option><option value="city">Ciudad fantástica</option></select></label><label class="wide">Habilidad especial<input data-power placeholder="Ejemplo: convierte estornudos en burbujas"></label><button type="button" class="mind-check wide" data-create>Crear mi animal</button></form><section class="creature-preview"><canvas width="480" height="420" aria-label="Boceto del animal inventado"></canvas><div class="creature-caption">Elige rasgos y pulsa crear.</div></section></div><p class="mind-feedback">No hay una combinación incorrecta: buscamos una idea visible, sorprendente y divertida.</p>`;
    body.querySelector('[data-create]').onclick=()=>{const values={name:body.querySelector('[data-creature-name]').value.trim()||'Animal sin nombre',head:body.querySelector('[data-head]').value,body:body.querySelector('[data-body]').value,legs:body.querySelector('[data-legs]').value,extra:body.querySelector('[data-extra]').value,home:body.querySelector('[data-home]').value,power:body.querySelector('[data-power]').value.trim()||'hacer reír cuando alguien está preocupado'},canvas=body.querySelector('canvas'),ctx=canvas.getContext('2d');drawCreature(ctx,values);body.querySelector('.creature-caption').innerHTML=`<strong>${values.name}</strong><span>Vive en ${body.querySelector('[data-home]').selectedOptions[0].text.toLowerCase()} y puede ${values.power}.</span>`;unlockCompletion();celebrate(`¡${values.name} acaba de aparecer!`);};voiceBar();}
  function drawCreature(ctx,v){const w=ctx.canvas.width,h=ctx.canvas.height,backgrounds={andes:['#d8edf2','#b88761'],jungle:['#d7f0df','#47805d'],sea:['#d5eff7','#3183a4'],city:['#f7e6c7','#8b6cac']},[sky,ground]=backgrounds[v.home];ctx.clearRect(0,0,w,h);ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);ctx.fillStyle=ground;ctx.fillRect(0,300,w,120);ctx.fillStyle='#dc7f58';ctx.strokeStyle='#173a5e';ctx.lineWidth=6;const bx=v.body==='long'?125:160,by=165,bw=v.body==='long'?250:180,bh=v.body==='tiny'?105:145;ctx.beginPath();ctx.ellipse(240,by+bw/8,bw/2,bh/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(v.extra==='wings'){ctx.fillStyle='#e2b954';ctx.beginPath();ctx.moveTo(170,170);ctx.lineTo(55,90);ctx.lineTo(105,230);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(310,170);ctx.lineTo(425,90);ctx.lineTo(375,230);ctx.closePath();ctx.fill();ctx.stroke();}if(v.extra==='tail'){ctx.beginPath();ctx.moveTo(365,200);ctx.quadraticCurveTo(455,120,440,270);ctx.stroke();}if(v.extra==='fins'){ctx.fillStyle='#6f9277';ctx.beginPath();ctx.moveTo(240,135);ctx.lineTo(210,70);ctx.lineTo(285,130);ctx.closePath();ctx.fill();ctx.stroke();}const legY=250+(bh-105)/2;ctx.strokeStyle='#173a5e';ctx.lineWidth=v.legs==='short'?13:9;if(v.legs==='wheels'){[185,295].forEach(x=>{ctx.beginPath();ctx.arc(x,300,28,0,Math.PI*2);ctx.stroke();});}else{const len=v.legs==='long'?85:45;[185,295].forEach(x=>{ctx.beginPath();ctx.moveTo(x,legY);ctx.lineTo(x-8,legY+len);ctx.stroke();ctx.beginPath();ctx.moveTo(x+24,legY);ctx.lineTo(x+30,legY+len);ctx.stroke();});}ctx.fillStyle='#f2c79d';ctx.beginPath();ctx.arc(240,130,75,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#173a5e';ctx.lineWidth=6;ctx.stroke();if(v.head==='rabbit'){ctx.fillStyle='#f2c79d';[-35,35].forEach(dx=>{ctx.beginPath();ctx.ellipse(240+dx,45,20,65,dx/300,0,Math.PI*2);ctx.fill();ctx.stroke();});}if(v.head==='bear'){[-55,55].forEach(dx=>{ctx.beginPath();ctx.arc(240+dx,75,28,0,Math.PI*2);ctx.fill();ctx.stroke();});}if(v.head==='bird'){ctx.fillStyle='#e2b954';ctx.beginPath();ctx.moveTo(235,135);ctx.lineTo(150,155);ctx.lineTo(235,175);ctx.closePath();ctx.fill();ctx.stroke();}if(v.head==='fish'){ctx.fillStyle='#7fb6c9';ctx.beginPath();ctx.moveTo(210,65);ctx.lineTo(240,15);ctx.lineTo(270,65);ctx.closePath();ctx.fill();ctx.stroke();}if(v.extra==='horns'){ctx.fillStyle='#8f6bb3';[-32,32].forEach(dx=>{ctx.beginPath();ctx.moveTo(240+dx,65);ctx.lineTo(240+dx*1.5,5);ctx.lineTo(255+dx,65);ctx.closePath();ctx.fill();ctx.stroke();});}ctx.fillStyle='#173a5e';[215,265].forEach(x=>{ctx.beginPath();ctx.arc(x,125,7,0,Math.PI*2);ctx.fill();});ctx.beginPath();ctx.arc(240,155,25,0,Math.PI);ctx.stroke();ctx.font='32px sans-serif';ctx.fillText('✨',365,70);ctx.fillText('✨',75,265);}

  function buildIdeaList(game){lockCompletion();const rounds=[['una taza',5],['una caja de cartón',6],['una bufanda',7],['una cuchara',8],['un tubo de papel',10]];let index=0;function draw(){const [object,target]=rounds[index];body.innerHTML=`${progress(index+1,rounds.length,'Ronda')}<p class="mind-instruction">Busca cantidad antes que perfección. Imagina <strong>${target} usos para ${object}</strong>.</p><label class="mind-writing"><textarea rows="9" placeholder="Una idea por línea…"></textarea></label><button type="button" class="mind-check" data-count-ideas>Contar ideas</button><p class="mind-feedback">Las ideas raras también cuentan.</p>`;body.querySelector('[data-count-ideas]').onclick=()=>{const ideas=body.querySelector('textarea').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);if(ideas.length>=target)celebrate(`¡${ideas.length} ideas diferentes!`,index===rounds.length-1?'Completar creatividad':'Siguiente objeto',()=>{index+=1;if(index===rounds.length)finishSeries(game,'¡Tu imaginación llegó a diez ideas!');else draw();});else coach(`Tienes ${ideas.length}. Te faltan ${target-ideas.length}; piensa en juego, decoración, orden o naturaleza.`);};voiceBar();}draw();}
  function buildEmotionMatch(game){lockCompletion();const rounds=[[['😊','alegría'],['😟','preocupación'],['😠','enojo'],['😮','sorpresa'],['😢','tristeza']],[['😌','calma'],['😳','vergüenza'],['😨','miedo'],['🤔','duda'],['🥳','entusiasmo']],[['Me sudan las manos','nervios'],['Quiero alejarme','incomodidad'],['Respiro lento','autorregulación'],['Pido compañía','búsqueda de apoyo']]];let round=0;function draw(){const pairs=rounds[round];let first=null,hits=0;body.innerHTML=`${progress(round+1,rounds.length,'Nivel')}<p class="mind-instruction">Une cada expresión o señal con su emoción.</p><div class="mind-match">${shuffle(pairs.flat()).map(x=>`<button>${x}</button>`).join('')}</div><p class="mind-feedback">Elige dos tarjetas relacionadas.</p>`;body.querySelectorAll('.mind-match button').forEach(b=>b.onclick=()=>{if(!first){first=b;b.classList.add('selected');return;}const ok=pairs.some(p=>p.includes(first.textContent)&&p.includes(b.textContent));if(ok){first.disabled=b.disabled=true;first.classList.remove('selected');hits++;if(hits===pairs.length)celebrate('¡Reconociste todas las señales!',round===rounds.length-1?'Completar emociones':'Siguiente nivel',()=>{round+=1;if(round===rounds.length)finishSeries(game);else draw();});else setFeedback('¡Pareja correcta!');}else{first.classList.remove('selected');coach('Mira la expresión o señal y prueba otra relación.');}first=null;});voiceBar();}draw();}
  function buildTaboo(game){lockCompletion();const words=['árbol','bicicleta','lluvia','biblioteca','volcán','alpaca'];let index=0;function draw(){const word=words[index];body.innerHTML=`${progress(index+1,words.length,'Palabra')}<div class="mind-secret"><span>Palabra secreta</span><b>${word}</b><p>Descríbela sin decirla. La otra persona intenta adivinar.</p></div><button type="button" class="mind-check" data-guessed>¡La adivinaron!</button><button type="button" class="mind-clear" data-hint>Dame una pista</button><p class="mind-feedback">Habla de su forma, uso, lugar o partes.</p>`;body.querySelector('[data-hint]').onclick=()=>coach('Prueba esta ruta: di dónde se encuentra, para qué sirve y cómo es, sin nombrarla.');body.querySelector('[data-guessed]').onclick=()=>celebrate('¡Buena descripción!',index===words.length-1?'Completar palabras':'Siguiente palabra',()=>{index+=1;if(index===words.length)finishSeries(game,'¡Seis palabras descritas!');else draw();});voiceBar();}draw();}
  function setupCanvas(prompt){body.innerHTML+=`<p class="mind-draw-prompt">${prompt}</p><canvas class="mind-canvas" width="720" height="420"></canvas><button class="mind-clear" data-clear-canvas>Borrar dibujo</button>`;const c=body.querySelector('canvas'),ctx=c.getContext('2d');ctx.strokeStyle='#173a5e';ctx.lineWidth=7;ctx.lineCap='round';let down=false,marks=0;const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height];};c.onpointerdown=e=>{down=true;marks+=1;ctx.beginPath();ctx.moveTo(...p(e));};c.onpointermove=e=>{if(!down)return;ctx.lineTo(...p(e));ctx.stroke();};c.onpointerup=()=>{down=false;};body.querySelector('[data-clear-canvas]').onclick=()=>{ctx.clearRect(0,0,c.width,c.height);marks=0;};return()=>marks;}
  function buildFreeDraw(game){lockCompletion();const prompts=['Dibuja una casa pequeña, un árbol a la izquierda y una nube arriba.','Dibuja un círculo grande; dentro, dos triángulos y una línea ondulada.','Dibuja una montaña; a su derecha un río y sobre ella un ave.','Dibuja un robot con tres botones, una antena y ruedas.','Dibuja un jardín con una flor alta, dos flores pequeñas y un insecto.'];let index=0;function draw(){body.innerHTML=`${progress(index+1,prompts.length,'Dictado')}`;const getMarks=setupCanvas(prompts[index]);body.insertAdjacentHTML('beforeend','<button type="button" class="mind-check" data-finish-drawing>Terminé mi dibujo</button><p class="mind-feedback">Escucha o relee. Comprueba posición, cantidad y partes.</p>');body.querySelector('[data-finish-drawing]').onclick=()=>{if(getMarks()<2){coach('Añade algunos trazos antes de terminar.');return;}celebrate('¡Convertiste palabras en una imagen!',index===prompts.length-1?'Completar dictados':'Siguiente dictado',()=>{index+=1;if(index===prompts.length)finishSeries(game);else draw();});};voiceBar();}draw();}
  function buildThermometer(game){lockCompletion();const questions=['¿Qué tan difícil fue empezar?','¿Cuánta atención necesitaste?','¿Cuánto te ayudó una pista?','¿Cuánta energía tienes ahora?','¿Qué tan dispuesto estás a intentarlo otra vez?'];let index=0,answers=[];const labels=['Muy poco','Poco','Intermedio','Bastante','Mucho'];function draw(){body.innerHTML=`${progress(index+1,questions.length,'Pausa')}<p class="mind-instruction">${questions[index]}</p><div class="mind-thermometer"><input type="range" min="1" max="5" value="3"><output>3 · ${labels[2]}</output></div><button type="button" class="mind-check" data-save-meter>Guardar y seguir</button><p class="mind-feedback">No hay una respuesta correcta: notar cómo estás ayuda a elegir.</p>`;const input=body.querySelector('input'),out=body.querySelector('output');input.oninput=()=>out.textContent=`${input.value} · ${labels[input.value-1]}`;body.querySelector('[data-save-meter]').onclick=()=>{answers.push(+input.value);celebrate('¡Registraste cómo te sientes!',index===questions.length-1?'Ver mi cierre':'Siguiente pregunta',()=>{index+=1;if(index===questions.length){unlockCompletion();const average=answers.reduce((a,b)=>a+b,0)/answers.length;body.innerHTML=`<div class="plan-result"><h3>Mi pausa consciente</h3><p>Registraste cinco señales. Tu promedio fue ${average.toFixed(1)} de 5.</p><p>${average<2.5?'Quizás te conviene una pausa, pedir ayuda o elegir un reto más breve.':'Tienes una base útil para seguir; recuerda que pausar también vale.'}</p></div><p class="mind-feedback is-success"><span class="feedback-light"></span><strong>¡Registro completo!</strong></p>`;confetti();}else draw();});};voiceBar();}draw();}
  function buildStrategies(game){lockCompletion();const situations=[['No recuerdo una instrucción',['Volver a leer','Adivinar rápido','Cerrar sin mirar'],0],['El problema parece muy grande',['Dividirlo en pasos','Hacer todo a la vez','Compararme'],0],['Me siento tenso',['Respirar y hacer una pausa','Apretar más fuerte','Ocultarlo'],0],['No entiendo una palabra',['Buscar su significado','Saltarla siempre','Inventar cualquier cosa'],0],['Me equivoqué dos veces',['Pedir una pista y probar distinto','Decir que no puedo','Repetir igual sin mirar'],0]];let index=0;function draw(){const [q,options,ok]=situations[index];body.innerHTML=`${progress(index+1,situations.length,'Situación')}<p class="mind-question">${q}</p><div class="mind-options">${options.map((x,i)=>`<button type="button" data-i="${i}">${x}</button>`).join('')}</div><p class="mind-feedback">Elige una estrategia que te ayude a continuar cuidándote.</p>`;body.querySelectorAll('.mind-options button').forEach(button=>button.onclick=()=>{if(+button.dataset.i===ok)celebrate('¡Esa estrategia te da una nueva ruta!',index===situations.length-1?'Completar estrategias':'Siguiente situación',()=>{index+=1;if(index===situations.length)finishSeries(game);else draw();});else coach('Esa opción puede detenerte o hacerte sentir peor. Busca una que aporte apoyo o claridad.');});voiceBar();}draw();}
  function buildReflection(game){lockCompletion();const prompts=['¿Qué hiciste primero?','¿Qué pista o estrategia te ayudó?','¿Qué cambiaste cuando algo no funcionó?','¿Qué probarías la próxima vez?'];let index=0,answers=[];function draw(){body.innerHTML=`${progress(index+1,prompts.length,'Paso')}<p class="mind-instruction">Contar el camino ayuda a aprender de lo que hiciste.</p><label class="mind-writing"><span>${prompts[index]}</span><textarea rows="6" placeholder="Escribe o dicta aquí…"></textarea></label><button type="button" class="mind-check" data-reflect>Guardar y seguir</button><p class="mind-feedback">No buscamos perfección; buscamos hacer visible tu estrategia.</p>`;body.querySelector('[data-reflect]').onclick=()=>{const text=body.querySelector('textarea').value.trim();if(text.length<8){coach('Añade una idea concreta antes de seguir.');return;}answers.push(text);celebrate('¡Idea guardada!',index===prompts.length-1?'Ver mi reflexión':'Siguiente pregunta',()=>{index+=1;if(index===prompts.length){unlockCompletion();body.innerHTML=`<div class="plan-result"><h3>Así pensé</h3><ol>${answers.map((answer,i)=>`<li><b>${i+1}</b><span>${answer}</span></li>`).join('')}</ol></div><p class="mind-feedback is-success"><span class="feedback-light"></span><strong>¡Tu proceso ya es visible!</strong></p>`;confetti();}else draw();});};voiceBar();}draw();}

  //__ACTIVITIES__

  function buildGame(game) {
    body.className = '';
    const builders = {
      starLevels: buildStars, oddLevels: buildOdd, countLevels: buildCount, recallLevels: buildRecall,
      simon: buildSimon, palace: buildPalace, animals: buildAnimals, prediction: buildPrediction,
      plantMap: buildPlantMap, readingSeries: buildReadings, instructions: buildInstructions,
      cycles: buildCycles, patterns: buildPatterns, structures: buildStructures, categories: buildCategories,
      rules: buildRules, planner: buildPlanner, routines: buildRoutines, maze: buildMaze,
      balances: buildBalances, mathSeries: buildMath, trace: buildTrace, creature: buildCreature,
      ideaList: buildIdeaList, emotionMatch: buildEmotionMatch, taboo: buildTaboo,
      freeDraw: buildFreeDraw, thermometer: buildThermometer, strategies: buildStrategies,
      reflection: buildReflection
    };
    builders[game.type](game);
  }

  const filters = $('#mind-filters');
  Object.entries({all:'Todas', ...groups}).forEach(([key,label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = key === 'all' ? 'is-active' : '';
    button.onclick = () => {
      activeFilter = key;
      [...filters.children].forEach(item => item.classList.toggle('is-active', item === button));
      renderCards(key);
    };
    filters.append(button);
  });
  $('#mind-close').onclick = closeDialog;
  completeButton.onclick = () => { saved.add(current.id); saveProgress(); closeDialog(); };
  $('#mind-again').onclick = () => { currentCleanup(); currentCleanup=()=>{}; buildGame(current); voiceBar(); };
  dialog.onclick = event => { if (event.target === dialog) closeDialog(); };
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.hidden) closeDialog(); });
  $('#mind-reset').onclick = () => {
    if (confirm('¿Quieres borrar el recorrido guardado en este dispositivo?')) { saved.clear(); saveProgress(); }
  };
  renderCards();
  updateProgress();
})();
