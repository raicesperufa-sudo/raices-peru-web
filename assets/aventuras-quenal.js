(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const scenes = [
    { id:'semilla', kicker:'Escena 1 · Observar', title:'Una semilla en silencio', image:'assets/ilustraciones-raices/aventura-semilla-01-v2.webp', alt:'Queñal observa una semilla en su mano junto a un árbol de queñual', caption:'La imagen acompaña la acción: mirar la semilla antes de decidir.', narration:'Queñal encontró una semilla cerca del queñual. No sabía si estaba dormida o esperando. La puso sobre su mano y miró su forma, su color y la tierra que llevaba pegada.', question:'¿Qué hizo Queñal antes de decidir?', answers:['La observó con calma','La escondió sin mirar','La lanzó muy lejos'], answer:0, hint:'Busca la acción que le permitió conocer mejor la semilla.' },
    { id:'suelo', kicker:'Escena 2 · Comparar', title:'¿Qué necesita para crecer?', image:'assets/ilustraciones-raices/aventura-semilla-02-v2.webp', alt:'Queñal compara suelo húmedo, sombra y un lugar con luz suave', caption:'La imagen muestra tres condiciones diferentes para poder compararlas.', narration:'Sus amigos propusieron agua, luz y un lugar con tierra. Queñal no eligió la respuesta más rápida. Comparó los lugares y notó que uno estaba húmedo, otro muy oscuro y otro recibía luz suave.', question:'¿Qué información le ayuda a elegir un lugar?', answers:['Las condiciones de cada lugar','El lugar más lejano','El color de su mochila'], answer:0, hint:'Piensa en agua, luz y tierra.' },
    { id:'transferencia', kicker:'Escena 3 · Probar', title:'Una maceta para investigar', image:'assets/ilustraciones-raices/aventura-semilla-03-v2.webp', alt:'Queñal planta la semilla en una maceta y observa un cuaderno con dibujos', caption:'La imagen acompaña el plan: plantar, observar y registrar cambios.', narration:'Queñal colocó la semilla en una maceta y acordó observarla varios días. Si algo cambiaba, lo anotaría. Si no cambiaba, revisaría las condiciones sin culpar a la semilla ni a quien la cuidó.', question:'¿Qué puede hacer si la semilla todavía no cambia?', answers:['Revisar las condiciones y seguir observando','Decir que nunca crecerá','Culpar a quien la cuidó'], answer:0, hint:'La evidencia puede necesitar más tiempo.' }
  ];
  let index=0, utterance=null, timers=[], paused=false, solved=false;
  const pedagogy=()=>window.RaicesPedagogy;
  const markProgress=(scene)=>{try{const key='raices-aventuras-progreso';const list=JSON.parse(localStorage.getItem(key)||'[]');localStorage.setItem(key,JSON.stringify([...new Set([...list,scene])]));}catch(_){}};
  const clearTimers=()=>{timers.forEach(clearTimeout);timers=[];};
  const stopVoice=()=>{clearTimers();speechSynthesis?.cancel();utterance=null;paused=false;$('#pause').disabled=true;$('#pause').textContent='Ⅱ Pausar';};
  const words=(text)=>{let offset=0;return text.split(/(\s+)/).map(part=>{if(/\s+/.test(part)){offset+=part.length;return part;}const start=offset;offset+=part.length;return `<span data-start="${start}">${part}</span>`;}).join('');};
  const calmVoice=()=>{const voices=speechSynthesis.getVoices();const spanish=voices.filter(v=>/^es(?:-|_)/i.test(v.lang));return spanish.find(v=>/^es-PE/i.test(v.lang)&&/female|mujer|elvira|helena|laura|m[oó]nica|paulina|sabina|sofia/i.test(v.name))||spanish.find(v=>/female|mujer|elvira|helena|laura|m[oó]nica|paulina|sabina|sofia/i.test(v.name))||spanish.find(v=>/^es-PE/i.test(v.lang))||spanish[0]||null;};
  function log(type, detail, support='none'){pedagogy()?.record({activityId:'aventura-semilla',activityTitle:'La semilla que esperaba',sceneId:scenes[index].id,type,detail,support});}
  function speak(text, illuminate=false){
    stopVoice();
    if(!('speechSynthesis' in window)){ $('#reader-status').textContent='La voz no está disponible en este navegador'; return; }
    const rate=Number($('#voice-rate').value); utterance=new SpeechSynthesisUtterance(text); utterance.lang='es-PE'; utterance.rate=rate;utterance.pitch=.98;utterance.volume=.88;utterance.voice=calmVoice();paused=false;
    if(illuminate){const spans=[...$('#scene-narration').querySelectorAll('[data-start]')];utterance.onboundary=(event)=>{if(event.name&&event.name!=='word')return;let current=spans[0];for(const span of spans){if(Number(span.dataset.start)<=event.charIndex)current=span;else break;}spans.forEach(x=>x.classList.toggle('lit',x===current));};}
    utterance.onstart=()=>{$('#reader-status').textContent='Queñal está leyendo';$('#pause').disabled=false;};
    utterance.onend=()=>{clearTimers();$('#scene-narration').querySelectorAll('.lit').forEach(x=>x.classList.remove('lit'));$('#reader-status').textContent='Lectura terminada';$('#pause').disabled=true;log('lectura','Narración escuchada hasta el final.');};
    speechSynthesis.speak(utterance);
  }
  function render(){
    stopVoice();solved=false;const scene=scenes[index];
    $('#scene-label').textContent=`Escena ${index+1} de ${scenes.length}`;$('#scene-progress').style.width=`${(index+1)/scenes.length*100}%`;$('#reader-status').textContent='Lista para comenzar';
    $('#scene-image').src=scene.image;$('#scene-image').alt=scene.alt;$('#scene-caption').textContent=scene.caption;$('#scene-kicker').textContent=scene.kicker;$('#scene-title').textContent=scene.title;$('#scene-narration').innerHTML=words(scene.narration);
    $('#question').textContent=scene.question;$('#answers').innerHTML=scene.answers.map((answer,i)=>`<button type="button" data-answer="${i}">${answer}</button>`).join('');
    $('#challenge').hidden=true;$('#feedback').textContent='';$('#next-scene').hidden=true;$('#next-scene').textContent=index===scenes.length-1?'Terminar aventura ✓':'Siguiente escena →';
    $('[data-answer]')?.focus?.();
    document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>answer(Number(button.dataset.answer))));
    log('inicio',`Se presentó la escena ${index+1}.`);
  }
  function answer(choice){
    if(solved)return;const scene=scenes[index];log('intento',`Se eligió la alternativa ${choice+1}.`);
    const button=$(`[data-answer="${choice}"]`);
    if(choice===scene.answer){solved=true;button.classList.add('correct');$('#feedback').textContent='La respuesta coincide con lo observado en esta escena. Es una evidencia de esta actividad, no una calificación.';$('#next-scene').hidden=false;log('respuesta','Respuesta pertinente registrada.',document.querySelectorAll('.challenge.hinted').length?'requested':'none');}
    else{button.classList.add('try');$('#feedback').textContent='Esa opción no coincide todavía. Puedes volver a escuchar, mirar la pista o probar otra idea.';setTimeout(()=>button.classList.remove('try'),650);}
  }
  $('#listen').addEventListener('click',()=>{log('lectura','Se inició la narración.');speak(scenes[index].narration,true);});
  $('#repeat').addEventListener('click',()=>{log('lectura','Se solicitó volver a escuchar.');speak(scenes[index].narration,true);});
  $('#pause').addEventListener('click',()=>{if(!utterance)return;if(paused){speechSynthesis.resume();paused=false;$('#pause').textContent='Ⅱ Pausar';log('reanudacion','Narración reanudada.');}else{speechSynthesis.pause();paused=true;$('#pause').textContent='▶ Continuar';log('pausa','Narración pausada.');}});
  $('#show-challenge').addEventListener('click',()=>{stopVoice();$('#challenge').hidden=false;$('#challenge').scrollIntoView({behavior:'smooth',block:'center'});log('decision','La persona decidió abrir el desafío.');});
  $('#listen-question').addEventListener('click',()=>speak(`${scenes[index].question}. ${scenes[index].answers.join('. ')}`));
  $('#hint').addEventListener('click',()=>{$('#challenge').classList.add('hinted');$('#feedback').textContent=scenes[index].hint;log('pista','Pista solicitada por la persona.', 'requested');});
  $('#think').addEventListener('click',()=>{$('#feedback').textContent='Tómate el tiempo que necesites. Puedes continuar cuando quieras.';log('pausa','Se solicitó tiempo para pensar.');});
  $('#next-scene').addEventListener('click',()=>{log('cierre',`Escena ${index+1} finalizada.`);markProgress(scenes[index].id);if(index<scenes.length-1){index++;render();window.scrollTo({top:document.querySelector('.reader').offsetTop-80,behavior:'smooth'});}else{pedagogy()?.finish('TRANSFER');$('#feedback').textContent='Aventura terminada. Puedes abrir el informe familiar para revisar esta sesión.';$('#next-scene').hidden=true;}});
  window.addEventListener('pagehide',stopVoice);
  pedagogy()?.start({id:'aventura-semilla',title:'La semilla que esperaba'});render();
})();
