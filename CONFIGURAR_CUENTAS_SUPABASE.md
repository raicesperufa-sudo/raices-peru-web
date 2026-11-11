# Cuentas RAÍCES con correo y clave

## Resultado preparado

La web puede cambiar del archivo JSON a un registro directo con correo y clave. Cada cuenta nueva recibe automáticamente una prueba total de tres meses y un perfil infantil. El usuario no puede asignarse planes pagados ni permisos administrativos.

## Activación pendiente

1. Crear un proyecto Supabase exclusivo para RAÍCES Perú. No reutilizar JUFANTICS.
2. En SQL Editor, ejecutar `supabase/migrations/202611110001_cuentas_raices.sql`.
3. En Authentication > URL Configuration configurar la web publicada y `zona-adulta.html` como retorno.
4. Copiar únicamente Project URL y Publishable key en `assets/raices-supabase-config.js` y cambiar `enabled` a `true`.
5. Crear desde la web las cuentas `raicesperu.fa@gmail.com` y `lpberrospia@gmail.com` con claves nuevas de por lo menos ocho caracteres.
6. Ejecutar en SQL Editor, después de confirmar ambos correos:

```sql
update public.raices_accounts account
set role = 'admin_security', plan = 'administracion-total', access_level = 'total', max_children = 0, valid_until = null, updated_at = now()
from auth.users users
where account.user_id = users.id and lower(users.email) = 'raicesperu.fa@gmail.com';

update public.raices_accounts account
set role = 'adult_guardian', plan = 'familia-plus-anual', access_level = 'total', max_children = 2,
    valid_from = '2026-11-01T00:00:00-05:00', valid_until = '2027-11-01T00:00:00-05:00', updated_at = now()
from auth.users users
where account.user_id = users.id and lower(users.email) = 'lpberrospia@gmail.com';
```

## Seguridad

- Nunca colocar `service_role` en la web o en GitHub.
- Mantener confirmación de correo y recuperación de contraseña habilitadas.
- Activar CAPTCHA y revisar límites antes de abrir el registro masivamente.
- El usuario puede leer su plan, pero no modificarlo.
- No almacenar diagnósticos, colegio, fotografías ni nombres completos de menores.

