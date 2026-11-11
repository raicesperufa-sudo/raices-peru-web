(() => {
  'use strict';
  const config = window.RAICES_SUPABASE;
  if (!config?.enabled || !config.url || !config.publishableKey) return;

  const STORAGE = 'raices-beta-accounts-v1';
  const SESSION = 'raices-beta-session-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
  const setStatus = (element, message, error = false) => {
    element.textContent = message;
    element.classList.toggle('is-error', error);
  };
  const labels = {
    libre: 'RAÍCES Libre',
    'prueba-3-meses': 'Prueba gratuita · 3 meses',
    'familia-plus-mensual': 'Familia Plus mensual',
    'familia-plus-anual': 'Familia Plus anual',
    cortesia: 'Cortesía autorizada',
    'administracion-total': 'Administración total'
  };

  document.querySelectorAll('[data-panel-button]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-panel-button]').forEach((item) => item.classList.toggle('is-active', item === button));
    document.querySelectorAll('[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== button.dataset.panelButton;
    });
  }));

  const loginPanel = $('[data-panel="login"]');
  const signupPanel = $('[data-panel="activation"]');
  loginPanel.innerHTML = `
    <div class="panel-copy"><p class="kicker">Cuenta del adulto</p><h2>Entrar</h2><p>Usa el mismo correo y clave desde cualquier celular, tableta o computadora.</p></div>
    <form id="remote-login-form" class="account-form">
      <label>Correo<input type="email" name="email" autocomplete="email" required></label>
      <label>Clave<input type="password" name="password" minlength="8" autocomplete="current-password" required></label>
      <button type="submit">Entrar</button><p class="form-status" id="remote-login-status" role="status"></p>
    </form>`;
  signupPanel.innerHTML = `
    <div class="panel-copy"><p class="kicker">Cuenta familiar</p><h2>Crear mi cuenta</h2><p>Solo necesitas un correo de una persona adulta y una clave. La prueba gratuita dura 3 meses, no requiere tarjeta y permite un perfil infantil.</p></div>
    <form id="remote-signup-form" class="account-form">
      <label>Correo<input type="email" name="email" autocomplete="email" required></label>
      <label>Crear clave de al menos 8 caracteres<input type="password" name="password" minlength="8" autocomplete="new-password" required></label>
      <label>Repetir clave<input type="password" name="passwordConfirm" minlength="8" autocomplete="new-password" required></label>
      <label class="consent"><input type="checkbox" name="consent" required><span>Confirmo que soy la persona adulta responsable y acepto guardar únicamente los datos necesarios.</span></label>
      <button type="submit">Crear cuenta gratis</button><p class="form-status" id="remote-signup-status" role="status"></p>
    </form>`;

  const dashboard = $('#dashboard');
  $('#export-account')?.remove();
  $('.local-warning')?.remove();

  const toLocalAccount = (user, access, children = []) => ({
    id: user.id,
    email: normalizeEmail(user.email),
    adultName: 'Cuenta familiar',
    role: access.role === 'admin_support' || access.role === 'admin_security' ? 'admin' : 'family',
    plan: access.plan,
    accessLevel: access.access_level,
    maxChildren: access.max_children,
    validFrom: access.valid_from,
    validUntil: access.valid_until,
    children: children.map((child) => ({ alias: child.alias, age: child.approximate_age })),
    remote: true,
    updatedAt: new Date().toISOString()
  });

  const cacheAccount = (account) => {
    localStorage.setItem(STORAGE, JSON.stringify([account]));
    localStorage.setItem(SESSION, account.id);
  };
  const clearCachedAccount = () => {
    localStorage.removeItem(SESSION);
    const remaining = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE) || '[]').filter((item) => !item.remote); }
      catch (_) { return []; }
    })();
    localStorage.setItem(STORAGE, JSON.stringify(remaining));
  };

  const showDashboard = (account) => {
    dashboard.hidden = false;
    $('#dashboard-name').textContent = 'Cuenta familiar';
    $('#dashboard-plan').textContent = `${labels[account.plan] || account.plan} · ${account.email} · acceso ${account.accessLevel === 'total' ? 'total' : 'libre'}`;
    $('#dashboard-validity').textContent = account.validUntil
      ? `Vigente hasta: ${new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date(account.validUntil))}`
      : 'Sin fecha de vencimiento.';
    const profiles = $('#dashboard-profiles');
    profiles.replaceChildren();
    if (!account.children.length) profiles.innerHTML = '<article><strong>Sin perfiles infantiles</strong><span>Podrás crear el perfil desde el panel familiar.</span></article>';
    account.children.forEach((child) => {
      const card = document.createElement('article');
      const name = document.createElement('strong'); name.textContent = child.alias;
      const age = document.createElement('span'); age.textContent = child.age ? `${child.age} años` : 'Edad no indicada';
      card.append(name, age); profiles.append(card);
    });
    $('#admin-summary').hidden = account.role !== 'admin';
    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const start = async () => {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const supabase = createClient(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const loadAccount = async (user) => {
      const [{ data: access, error: accessError }, { data: children, error: childrenError }] = await Promise.all([
        supabase.from('raices_accounts').select('*').eq('user_id', user.id).single(),
        supabase.from('raices_child_profiles').select('alias,approximate_age').eq('owner_id', user.id).order('created_at')
      ]);
      if (accessError) throw accessError;
      if (childrenError) throw childrenError;
      if (access.status !== 'active' || (access.valid_until && Date.now() > new Date(access.valid_until).getTime())) throw new Error('expired');
      const account = toLocalAccount(user, access, children || []);
      cacheAccount(account); showDashboard(account); return account;
    };

    $('#remote-signup-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const status = $('#remote-signup-status');
      const email = normalizeEmail(data.get('email'));
      const password = String(data.get('password') || '');
      if (password !== String(data.get('passwordConfirm') || '')) { setStatus(status, 'Las dos claves deben ser iguales.', true); return; }
      setStatus(status, 'Creando tu cuenta…');
      const { data: result, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL('zona-adulta.html', location.href).href } });
      if (error) { setStatus(status, 'No se pudo crear la cuenta. Revisa el correo y usa una clave de al menos 8 caracteres.', true); return; }
      if (!result.session) { setStatus(status, 'Cuenta creada. Abre el mensaje de confirmación enviado a tu correo y luego entra con tu clave.'); return; }
      try { await loadAccount(result.user); setStatus(status, 'Cuenta creada. Ya tienes 3 meses de prueba.'); }
      catch (_) { setStatus(status, 'La cuenta se creó, pero el plan aún se está preparando. Actualiza la página en unos segundos.', true); }
    });

    $('#remote-login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const status = $('#remote-login-status');
      setStatus(status, 'Ingresando…');
      const { data: result, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(data.get('email')), password: String(data.get('password') || '') });
      if (error) { setStatus(status, 'Revisa el correo y la clave, o confirma primero tu correo.', true); return; }
      try { await loadAccount(result.user); setStatus(status, 'Sesión iniciada.'); }
      catch (loadError) { setStatus(status, loadError.message === 'expired' ? 'El acceso venció o fue suspendido. Escribe al soporte de RAÍCES.' : 'No se pudo cargar el plan de esta cuenta.', true); }
    });

    $('#logout-account').addEventListener('click', async () => { await supabase.auth.signOut(); clearCachedAccount(); dashboard.hidden = true; });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) { try { await loadAccount(session.user); } catch (_) { clearCachedAccount(); } }
    else { clearCachedAccount(); dashboard.hidden = true; }
  };

  start().catch(() => {
    loginPanel.innerHTML = '<div class="panel-copy"><h2>Servicio de cuentas temporalmente no disponible</h2><p>Las actividades libres siguen funcionando. Intenta nuevamente más tarde.</p></div>';
    signupPanel.innerHTML = '<div class="panel-copy"><h2>No pudimos abrir el registro</h2><p>Actualiza la página o escribe al soporte de RAÍCES.</p></div>';
  });
})();
