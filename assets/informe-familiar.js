(() => {
  'use strict';const $=(s,r=document)=>r.querySelector(s);const api=()=>window.RaicesPedagogy;
  const labels={INSUFFICIENT_EVIDENCE:'Evidencia insuficiente',STABLE:'Autonomía contextual estable',VARIABLE:'Autonomía contextual variable'};
  function render(){
    const session=api().current();const summary=api().summarize(session);const engine=window.RaicesPedagogicalEngine?.interpretSession(session);$('#activity-title').textContent=session.events.length?session.activity.title:'Todavía no hay una actividad registrada';$('#session-state').textContent=engine?.decision==='WAIT_OBSERVE'?'Evidencia insuficiente':labels[engine?.autonomy]||engine?.autonomy||labels[summary.autonomy]||summary.autonomy;
    $('#metrics').innerHTML=[['Eventos',summary.total],['Respuestas',summary.responses],['Intentos',summary.attempts],['Pistas',summary.hints],['Pausas',summary.pauses]].map(([l,v])=>`<article><strong>${v}</strong><small>${l}</small></article>`).join('');
    $('#context-reading').textContent=engine?.reason||(!summary.responses?'Todavía no hay respuestas pertinentes. Corresponde observar o realizar una actividad antes de interpretar.':summary.hints?'Hubo respuestas y al menos una pista. La resolución describe desempeño con apoyo en este contexto, no independencia general.':'Hubo respuestas sin una pista registrada en esta sesión. Esto no prueba autonomía fuera de la actividad.');
    $('#uncertainty').textContent=engine?.uncertainty||summary.uncertainty;
    $('#guidance').textContent=summary.pauses?'Respetar la pausa y ofrecer retomar voluntariamente, sin aumentar la exigencia.':summary.hints?'En otra oportunidad puede ofrecerse primero tiempo para explorar y mantener la pista disponible.':'Preguntar qué parte llamó la atención y dejar que la persona elija si quiere repetir o cambiar de actividad.';
    const rows=Object.entries(summary.byScene);$('#scene-list').innerHTML=rows.length?rows.map(([scene,row])=>`<article class="scene-row"><strong>${scene}</strong><span>${row.events} eventos</span><span>${row.responses} respuestas</span><span>${row.attempts} intentos</span><span>${row.hints} pistas</span><span>${row.pauses} pausas</span></article>`).join(''):'<p>No se inventarán resultados. Abre una actividad infantil de demostración y vuelve a este informe.</p>';
    renderHistory();
  }
  function renderHistory(){const list=api().history();$('#history-list').innerHTML=list.length?list.map(item=>{const s=api().summarize(item);return `<article class="history-entry"><div><h3>${item.activity.title}</h3><p>${s.total} eventos · ${s.responses} respuestas · ${s.hints} pistas · ${s.pauses} pausas</p></div><time datetime="${item.updatedAt}">${new Date(item.updatedAt).toLocaleString('es-PE')}</time></article>`;}).join(''):'<p>No hay copias guardadas. Guardar es voluntario y ocurre solo en este navegador.</p>';}
  function message(text){$('#report-message').textContent=text;}
  $('#save-history').addEventListener('click',()=>{const result=api().saveCurrent();message(result.ok?`Copia guardada. El historial contiene ${result.count} sesión(es) ficticias.`:result.reason);renderHistory();});
  $('#export-txt').addEventListener('click',()=>{api().exportCurrent('txt');message('Resumen exportado. Protégelo si añades información fuera de esta demostración.');});
  $('#export-json').addEventListener('click',()=>{api().exportCurrent('json');message('Evidencias exportadas en JSON por acción explícita.');});
  $('#clear-current').addEventListener('click',()=>{if(confirm('¿Cerrar la sesión temporal? Las copias guardadas no se eliminarán.')){api().clearCurrent();render();message('Sesión temporal cerrada.');}});
  $('#clear-history').addEventListener('click',()=>{if(confirm('¿Vaciar las copias locales de demostración? Los archivos exportados no se modificarán.')){api().clearHistory();renderHistory();message('Historial local vaciado.');}});
  render();
})();
