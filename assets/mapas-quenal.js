(() => {
  const library=window.RaicesTopicLibrary;
  if(!library)return;
  const key='raices-mapas-progreso-v1';
  let reviewed=new Set(),active=null,voice=true;
  try{reviewed=new Set(JSON.parse(localStorage.getItem(key)||'[]'))}catch(_){ }
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const imageFor=(topic)=>library.packs[topic.id]?.scenes?.[0]?.image||'assets/personaje-quenal-v2.webp';

  function render(filter='all'){
    $('#map-grid').innerHTML=library.topics.filter(t=>filter==='all'||t.categories.split(' ').includes(filter)).map(t=>`<button class="map-card" type="button" data-map="${t.id}"><img src="${imageFor(t)}" alt="Queñal presenta ${t.label.toLowerCase()}"><span><small>${reviewed.has(t.id)?'Revisado · Familia Plus':'Familia Plus'}</small><b>${t.label}</b><em>${t.summary}</em></span></button>`).join('');
    $$('[data-map]').forEach(btn=>btn.onclick=()=>open(btn.dataset.map));
  }
  function open(id){
    const topic=library.topics.find(t=>t.id===id);if(!topic)return;
    if(!(window.RaicesAccess?.require('plus',`Mapa: ${topic.label}`)??false))return;
    active=topic;$('#detail-title').textContent=topic.label;$('#detail-summary').textContent=topic.summary;$('#detail-fact').textContent=topic.fact;$('#detail-compare').textContent=topic.compare;$('#detail-action').textContent=topic.action;$('#detail-transfer').textContent=topic.transfer;$('#detail-image').src=imageFor(topic);$('#detail-image').alt=`Queñal explora ${topic.label.toLowerCase()}`;$('#explore-topic').href=`aventuras-quenal.html#tema-${topic.id}`;$('#detail-feedback').textContent=reviewed.has(topic.id)?'Este mapa ya fue revisado en este dispositivo. Puedes volver cuando quieras.':'';$('#map-detail').hidden=false;$('.catalog').hidden=true;history.replaceState(null,'',`#${topic.id}`);$('#map-detail').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function close(){$('#map-detail').hidden=true;$('.catalog').hidden=false;active=null;history.replaceState(null,'',location.pathname);$('.catalog').scrollIntoView({behavior:'smooth'})}
  function narration(){return `${active.label}. Idea clave: ${active.fact} Conecta: ${active.compare}. Pasos: observa una relación, represéntala y comprueba con otro caso. Atención: un modelo no contiene toda la realidad. Para aplicarlo: ${active.action}. Nueva situación: ${active.transfer}.`}
  $('#category-filter').onchange=e=>render(e.target.value);
  $('#close-detail').onclick=close;
  $('#hear-map').onclick=()=>active&&voice&&window.RaicesVoice?.speak(narration(),{force:true,rate:.75});
  $('#mark-map').onclick=()=>{if(!active)return;reviewed.add(active.id);localStorage.setItem(key,JSON.stringify([...reviewed]));$('#detail-feedback').textContent='Mapa guardado como revisado. No es una nota: solo recuerda que ya lo exploraste.';render($('#category-filter').value);window.RaicesPedagogy?.record?.({activityId:`mapa-${active.id}`,activityTitle:`Mapa: ${active.label}`,sceneId:'cierre',type:'revision',detail:'Mapa visual revisado voluntariamente.',context:'biblioteca:mapas-quenal'})};
  $('#voice-toggle').onclick=()=>{voice=!voice;$('#voice-toggle').textContent=voice?'🔊 Voz activa':'🔇 Voz apagada';$('#voice-toggle').setAttribute('aria-pressed',String(voice));if(!voice)window.RaicesVoice?.stop()};
  render();const requested=decodeURIComponent(location.hash.slice(1));if(requested&&library.topics.some(t=>t.id===requested))setTimeout(()=>open(requested),100);
})();
