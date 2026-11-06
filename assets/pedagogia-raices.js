(() => {
  'use strict';

  const SESSION_KEY = 'raices-demo-evidence-v1';
  const HISTORY_KEY = 'raices-demo-family-history-v1';
  const SCHEMA = 'raices.demo.evidence.v1';
  const allowedTypes = new Set(['inicio', 'lectura', 'pausa', 'reanudacion', 'intento', 'pista', 'respuesta', 'decision', 'cierre', 'movimiento', 'calma', 'interes', 'estrategia', 'creacion', 'transferencia']);

  const clean = (value, max = 240) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
  const read = (storage, key, fallback) => {
    try { return JSON.parse(storage.getItem(key) || '') || fallback; } catch (_) { return fallback; }
  };
  const write = (storage, key, value) => storage.setItem(key, JSON.stringify(value));
  const id = () => globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const emptySession = (activity = {}) => ({
    schema: SCHEMA,
    id: id(),
    fictional: true,
    activity: { id: clean(activity.id, 60) || 'actividad-demo', title: clean(activity.title, 100) || 'Actividad RAÍCES' },
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'EXPLORING',
    events: []
  });

  function current(activity) {
    const saved = read(sessionStorage, SESSION_KEY, null);
    if (saved?.schema === SCHEMA && Array.isArray(saved.events) && (!activity?.id || saved.activity?.id === activity.id)) return saved;
    const next = emptySession(activity);
    write(sessionStorage, SESSION_KEY, next);
    return next;
  }

  function start(activity) {
    const next = emptySession(activity);
    write(sessionStorage, SESSION_KEY, next);
    record({ activityId: next.activity.id, activityTitle: next.activity.title, type: 'inicio', detail: 'La persona inició la actividad de demostración.' });
    return current();
  }

  function record(input = {}) {
    const type = allowedTypes.has(input.type) ? input.type : 'decision';
    const session = current({ id: clean(input.activityId, 60), title: clean(input.activityTitle, 100) });
    const event = {
      id: id(),
      at: new Date().toISOString(),
      type,
      scene: clean(input.sceneId || input.scene, 60) || 'general',
      detail: clean(input.detail),
      source: clean(input.source, 40) || 'actividad',
      context: clean(input.context, 100) || 'app-raices-demo',
      support: ['none', 'requested', 'offered', 'adult'].includes(input.support) ? input.support : 'none',
      uncertainty: clean(input.uncertainty, 160) || 'La evidencia describe solo esta interacción.'
    };
    session.events.push(event);
    session.events = session.events.slice(-300);
    session.updatedAt = event.at;
    write(sessionStorage, SESSION_KEY, session);
    window.dispatchEvent(new CustomEvent('raices:evidence', { detail: event }));
    return event;
  }

  function finish(status = 'CONSOLIDATING') {
    const session = current();
    session.status = ['EXPLORING', 'CONSOLIDATING', 'TRANSFER', 'CREATING'].includes(status) ? status : 'CONSOLIDATING';
    session.completedAt = new Date().toISOString();
    session.updatedAt = session.completedAt;
    write(sessionStorage, SESSION_KEY, session);
    return session;
  }

  function summarize(session = current()) {
    const events = Array.isArray(session?.events) ? session.events : [];
    const byScene = {};
    events.forEach((event) => {
      const key = event.scene || 'general';
      byScene[key] ||= { events: 0, attempts: 0, hints: 0, pauses: 0, responses: 0, supported: 0 };
      const row = byScene[key];
      row.events += 1;
      if (event.type === 'intento') row.attempts += 1;
      if (event.type === 'pista') row.hints += 1;
      if (event.type === 'pausa') row.pauses += 1;
      if (event.type === 'respuesta') row.responses += 1;
      if (event.support !== 'none') row.supported += 1;
    });
    const responses = events.filter((event) => event.type === 'respuesta');
    const hints = events.filter((event) => event.type === 'pista');
    const interests = events.filter((event) => event.type === 'interes');
    const strategies = events.filter((event) => event.type === 'estrategia');
    const creations = events.filter((event) => event.type === 'creacion');
    const transfers = events.filter((event) => event.type === 'transferencia');
    const autonomy = !responses.length ? 'INSUFFICIENT_EVIDENCE' : hints.length ? 'VARIABLE' : 'STABLE';
    return {
      total: events.length,
      attempts: events.filter((event) => event.type === 'intento').length,
      hints: hints.length,
      pauses: events.filter((event) => event.type === 'pausa').length,
      responses: responses.length,
      interests: interests.length,
      strategies: strategies.length,
      creations: creations.length,
      transfers: transfers.length,
      autonomy,
      byScene,
      uncertainty: responses.length ? 'Hay evidencia contextual de esta sesión; no permite inferir una capacidad general.' : 'Faltan respuestas pertinentes para formular una interpretación.'
    };
  }

  function history() {
    const data = read(localStorage, HISTORY_KEY, []);
    return Array.isArray(data) ? data.filter((item) => item?.schema === SCHEMA && item.fictional === true).slice(0, 30) : [];
  }

  function saveCurrent() {
    const session = current();
    if (!session.events.length) return { ok: false, reason: 'No hay eventos para guardar.' };
    const list = history().filter((item) => item.id !== session.id);
    list.unshift(globalThis.structuredClone ? globalThis.structuredClone(session) : JSON.parse(JSON.stringify(session)));
    write(localStorage, HISTORY_KEY, list.slice(0, 30));
    return { ok: true, count: Math.min(30, list.length) };
  }

  function clearHistory() { localStorage.removeItem(HISTORY_KEY); }
  function clearCurrent() { sessionStorage.removeItem(SESSION_KEY); }
  function download(content, name, type = 'application/json') {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1200);
  }
  function exportCurrent(format = 'json') {
    const session = current();
    if (format === 'txt') {
      const summary = summarize(session);
      const lines = [
        'RAÍCES PERÚ - Resumen familiar de demostración',
        `Actividad: ${session.activity.title}`,
        `Eventos: ${summary.total} | Respuestas: ${summary.responses} | Pistas: ${summary.hints} | Pausas: ${summary.pauses}`,
        `Intereses expresados: ${summary.interests} | Estrategias elegidas: ${summary.strategies} | Creaciones: ${summary.creations} | Transferencias: ${summary.transfers}`,
        `Autonomía contextual: ${summary.autonomy}`,
        `Incertidumbre: ${summary.uncertainty}`,
        '',
        'Este archivo describe una actividad ficticia o de prueba. No es diagnóstico, calificación ni informe profesional.'
      ];
      download(lines.join('\n'), 'RAICES_resumen_familiar_demo.txt', 'text/plain');
    } else download(JSON.stringify(session, null, 2), 'RAICES_evidencias_demo.json');
  }

  window.RaicesPedagogy = { SCHEMA, start, current, record, finish, summarize, history, saveCurrent, clearHistory, clearCurrent, exportCurrent };
})();
