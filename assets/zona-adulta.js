(() => {
  'use strict';
  const STORAGE = 'raices-beta-accounts-v1';
  const SESSION = 'raices-beta-session-v1';
  const FREE_INVITE_HASH = 'ac6256fab6aff4a1b344e1a8bf6a5f403f763d45eaf2c5fd9373d9146a8df309';
  const PLAN_RULES = {
    libre: { label: 'RAÍCES Libre', maxChildren: 1, accessLevel: 'libre' },
    'prueba-invitada': { label: 'Prueba gratuita · 3 meses', maxChildren: 1, accessLevel: 'total' },
    'beta-fundadora': { label: 'Beta fundadora', maxChildren: 2, accessLevel: 'total' },
    'familia-plus-mensual': { label: 'Familia Plus mensual', maxChildren: 1, accessLevel: 'total' },
    'familia-plus-anual': { label: 'Familia Plus anual', maxChildren: 2, accessLevel: 'total' },
    cortesia: { label: 'Cortesía autorizada', maxChildren: 2, accessLevel: 'total' },
    'administracion-total': { label: 'Administración total', maxChildren: 0, accessLevel: 'total' }
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const readAccounts = () => { try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch (_) { return []; } };
  const writeAccounts = (accounts) => localStorage.setItem(STORAGE, JSON.stringify(accounts));
  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
  const id = () => `raices-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const addMonths = (iso, months) => { const date = new Date(iso); date.setMonth(date.getMonth() + months); return date.toISOString(); };
  const normalizeAccount = (source, issuedAt = new Date().toISOString()) => {
    const plan = PLAN_RULES[source.plan] ? source.plan : 'libre';
    const rule = PLAN_RULES[plan];
    const role = source.role === 'admin' ? 'admin' : 'family';
    const maxChildren = role === 'admin' ? 0 : rule.maxChildren;
    let validUntil = source.validUntil ?? null;
    if (!validUntil && plan === 'prueba-invitada') validUntil = addMonths(source.validFrom || issuedAt, 3);
    if (!validUntil && plan === 'familia-plus-mensual') validUntil = addMonths(source.validFrom || issuedAt, 1);
    if (!validUntil && plan === 'familia-plus-anual') validUntil = addMonths(source.validFrom || issuedAt, 12);
    return {
      ...source,
      email: normalizeEmail(source.email), role, plan,
      accessLevel: role === 'admin' ? 'total' : (source.accessLevel || rule.accessLevel),
      maxChildren,
      validFrom: source.validFrom || issuedAt,
      validUntil,
      children: (Array.isArray(source.children) ? source.children : []).slice(0, maxChildren)
    };
  };
  const expired = (account) => Boolean(account?.validUntil && Date.now() > new Date(account.validUntil).getTime());
  const hashPin = async (pin) => {
    const bytes = new TextEncoder().encode(`raices-beta:${pin}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  };
  const hashInviteCode = async (code) => {
    const normalized = String(code || '').trim();
    const bytes = new TextEncoder().encode(`raices-invite-v1:${normalized}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  };
  const setStatus = (element, message, error = false) => { element.textContent = message; element.classList.toggle('is-error', error); };

  $$('[data-panel-button]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-panel-button]').forEach((item) => item.classList.toggle('is-active', item === button));
    $$('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== button.dataset.panelButton; });
  }));

  const childrenFields = $('#children-fields');
  const addChild = (child = {}) => {
    const plan = $('#activation-form [name="plan"]')?.value || 'libre';
    const limit = PLAN_RULES[plan]?.maxChildren ?? 1;
    if ($$('.child-row', childrenFields).length >= limit) {
      setStatus($('#activation-status'), `Este plan admite hasta ${limit} perfil infantil.`, true);
      return;
    }
    const row = document.createElement('div');
    row.className = 'child-row';
    row.innerHTML = '<input aria-label="Alias del perfil" name="childAlias" maxlength="40" placeholder="Alias"><input aria-label="Edad aproximada" name="childAge" type="number" min="2" max="99" placeholder="Edad"><button type="button" aria-label="Quitar perfil">×</button>';
    $('[name="childAlias"]', row).value = child.alias || '';
    $('[name="childAge"]', row).value = child.age || '';
    $('button', row).addEventListener('click', () => { row.remove(); $('#add-child').disabled = false; });
    childrenFields.append(row);
    $('#add-child').disabled = $$('.child-row', childrenFields).length >= limit;
  };
  addChild();
  $('#add-child').addEventListener('click', () => addChild());

  const dashboard = $('#dashboard');
  const showDashboard = (account) => {
    if (!account) { dashboard.hidden = true; return; }
    dashboard.hidden = false;
    $('#dashboard-name').textContent = account.adultName || 'Cuenta familiar';
    const rule = PLAN_RULES[account.plan] || PLAN_RULES.libre;
    $('#dashboard-plan').textContent = `${rule.label} · ${account.email} · acceso ${expired(account) ? 'vencido' : account.accessLevel === 'total' ? 'total' : 'libre'}`;
    $('#dashboard-validity').textContent = account.validUntil ? `Vigente hasta: ${new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date(account.validUntil))}` : 'Sin fecha de vencimiento en esta activación.';
    const profiles = $('#dashboard-profiles');
    profiles.innerHTML = '';
    const children = Array.isArray(account.children) ? account.children : [];
    if (!children.length) profiles.innerHTML = '<article><strong>Sin perfiles infantiles</strong><span>Puedes agregarlos al volver a activar la cuenta.</span></article>';
    children.forEach((child) => {
      const card = document.createElement('article');
      const strong = document.createElement('strong'); strong.textContent = child.alias || 'Perfil';
      const span = document.createElement('span'); span.textContent = child.age ? `${child.age} años` : 'Edad no indicada';
      card.append(strong, span); profiles.append(card);
    });
    const adminSummary = $('#admin-summary');
    adminSummary.hidden = account.role !== 'admin';
    if (account.role === 'admin') {
      const localAccounts = readAccounts();
      const localBox = $('#admin-local-accounts');
      localBox.replaceChildren();
      const total = document.createElement('strong');
      total.textContent = `${localAccounts.length} cuenta${localAccounts.length === 1 ? '' : 's'} en este dispositivo`;
      localBox.append(total);
      localAccounts.forEach((item) => {
        const row = document.createElement('p');
        row.textContent = `${item.email} · ${(PLAN_RULES[item.plan] || PLAN_RULES.libre).label}`;
        localBox.append(row);
      });
    }
    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  $('#activation-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = normalizeEmail(data.get('email'));
    const aliases = $$('[name="childAlias"]', form);
    const ages = $$('[name="childAge"]', form);
    const children = aliases.map((input, index) => ({ alias: input.value.trim(), age: Number(ages[index].value) || null })).filter((child) => child.alias);
    // La autoactivación siempre crea una prueba temporal, aunque el formulario sea manipulado.
    const plan = 'prueba-invitada';
    const rule = PLAN_RULES[plan] || PLAN_RULES.libre;
    const invitationIsValid = await hashInviteCode(data.get('inviteCode')) === FREE_INVITE_HASH;
    if (!invitationIsValid) { setStatus($('#activation-status'), 'El código gratuito de invitación no es válido. Solicita el código vigente al equipo RAÍCES.', true); return; }
    if (children.length > rule.maxChildren) { setStatus($('#activation-status'), `Este plan admite hasta ${rule.maxChildren} perfil infantil.`, true); return; }
    const accounts = readAccounts();
    const existing = accounts.find((account) => normalizeEmail(account.email) === email);
    const account = normalizeAccount({
      id: existing?.id || id(), adultName: String(data.get('adultName')).trim(), email,
      role: 'family', plan, children,
      pinHash: await hashPin(String(data.get('pin'))), consentAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    writeAccounts([...accounts.filter((item) => normalizeEmail(item.email) !== email), account]);
    localStorage.setItem(SESSION, account.id);
    form.reset();
    setStatus($('#activation-status'), 'Cuenta de prueba creada por 3 meses. Ya puedes abrir el panel familiar y entrar después con tu correo y PIN.');
    showDashboard(account);
  });

  $('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const account = readAccounts().find((item) => normalizeEmail(item.email) === normalizeEmail(data.get('email')));
    if (!account || account.pinHash !== await hashPin(String(data.get('pin')))) { setStatus($('#login-status'), 'Revisa el correo y la clave numérica. En un dispositivo nuevo debes importar primero tu activación privada.', true); return; }
    if (expired(account)) { setStatus($('#login-status'), 'Esta activación venció. Solicita su renovación al soporte de RAÍCES.', true); return; }
    localStorage.setItem(SESSION, account.id); setStatus($('#login-status'), 'Sesión iniciada.'); showDashboard(account);
  });

  $('#import-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      const acceptedTypes = new Set(['raices-activation', 'raices-account-backup']);
      if (!acceptedTypes.has(payload.type) || !payload.account?.email) throw new Error('invalid');
      const imported = normalizeAccount(payload.account, payload.issuedAt || payload.exportedAt || new Date().toISOString());
      if (expired(imported)) throw new Error('expired');
      const expectedLimit = PLAN_RULES[imported.plan]?.maxChildren ?? 1;
      if (imported.role !== 'admin' && imported.children.length > expectedLimit) throw new Error('profiles');
      const includedPinHash = /^[a-f0-9]{64}$/i.test(imported.pinHash || '') ? imported.pinHash : '';
      let pinHash = includedPinHash;
      if (!pinHash) {
        const pin = window.prompt('Crea una clave numérica de 4 a 8 dígitos para este dispositivo:');
        if (!/^[0-9]{4,8}$/.test(pin || '')) throw new Error('pin');
        pinHash = await hashPin(pin);
      }
      const accounts = readAccounts();
      const account = { ...imported, id: imported.id || id(), pinHash, importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      writeAccounts([...accounts.filter((item) => normalizeEmail(item.email) !== account.email), account]);
      localStorage.setItem(SESSION, account.id); setStatus($('#import-status'), includedPinHash ? 'Activación importada. Ya puedes entrar con el correo y la clave numérica entregada por RAÍCES.' : 'Activación importada. La cuenta quedó lista en este dispositivo.'); showDashboard(account);
    } catch (error) {
      const messages = { pin: 'El PIN debe tener entre 4 y 8 dígitos.', expired: 'Esta activación ya venció.', profiles: 'La activación supera el número de perfiles permitido.' };
      setStatus($('#import-status'), messages[error.message] || 'El archivo no es una activación válida de RAÍCES.', true);
    }
    event.target.value = '';
  });

  $('#export-account').addEventListener('click', () => {
    const account = readAccounts().find((item) => item.id === localStorage.getItem(SESSION)); if (!account) return;
    const { pinHash, ...portableAccount } = account;
    const payload = { version: 1, type: 'raices-account-backup', exportedAt: new Date().toISOString(), account: portableAccount };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `respaldo-raices-${account.id}.json`; anchor.click(); URL.revokeObjectURL(url);
  });
  $('#logout-account').addEventListener('click', () => { localStorage.removeItem(SESSION); dashboard.hidden = true; });

  const sessionId = localStorage.getItem(SESSION);
  if (sessionId) showDashboard(readAccounts().find((account) => account.id === sessionId));
})();
