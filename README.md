# Hable con ella

Cartelera pública (`index.html`) y panel de administración (`admin.html`). Es un sitio estático sin compilación. Los datos y el inicio de sesión de administradores viven en Supabase.

## Puesta en marcha

1. Crea un proyecto en Supabase. En **SQL Editor**, ejecuta `schema.sql`. Esto crea las tablas, las reglas de seguridad y 3 funciones de ejemplo.
2. Crea el usuario administrador en **Authentication → Users → Add user**, con correo y contraseña. Copia su `id` y regístralo como administrador:
   ```sql
   insert into admins (user_id) values ('<id-del-usuario>');
   ```
3. Abre **Authentication → Providers → Email** y desactiva *Allow new users to sign up*. Así nadie puede crearse una cuenta por su cuenta.
4. En `comun.js`, pon `supabaseUrl` y `supabaseKey`. Los encuentras en **Project Settings → API**: son la URL y la llave *anon public*. Esa llave está hecha para ser pública: la protección la dan las reglas de `schema.sql`.
5. Haz push a `main`. GitHub Pages publica la rama `main` tal cual, sin compilar: https://general-code-innovacion.github.io/hable-con-ella/ (el panel está en `/admin.html`).

Sin el paso 4, la cartelera muestra funciones de ejemplo para que puedas ver el diseño.

Para probarla en tu computadora: `python3 -m http.server` y abre http://localhost:8000.

## Cómo funciona

- **Reservar**: la persona deja su nombre y su WhatsApp, y queda guardado. Después se abre el DM de @hableconella.ca con el mensaje «Quiero reservar la función …» ya copiado, listo para pegar. Instagram no permite que un enlace escriba el mensaje dentro del chat.
- **Panel** (`/admin.html`): crear funciones, editarlas, cancelarlas o reactivarlas. Si cambias la fecha o la hora, la cartelera muestra la etiqueta «Nuevo horario».
- **Avisos por WhatsApp**: cada reserva tiene un botón que abre WhatsApp con el mensaje ya escrito, según el caso: cancelación, cambio de horario o recordatorio. El administrador lo envía desde su teléfono.
