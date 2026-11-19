-- Hable con ella: esquema para Supabase (SQL Editor → Run).

create table funciones (
  id uuid primary key default gen_random_uuid(),
  pelicula text not null,
  detalle text,                -- director · año · duración, etc.
  fecha timestamptz not null,
  poster_url text,
  estado text not null default 'activa' check (estado in ('activa', 'cancelada')),
  aviso text,                  -- se muestra en la cartelera (p. ej. cambio de horario)
  creada timestamptz not null default now()
);

create table reservas (
  id uuid primary key default gen_random_uuid(),
  funcion_id uuid not null references funciones on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  creada timestamptz not null default now()
);

-- Solo los usuarios listados aquí pueden administrar.
create table admins (user_id uuid primary key references auth.users on delete cascade);

create function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

alter table funciones enable row level security;
alter table reservas enable row level security;
alter table admins enable row level security;  -- sin políticas: nadie la lee desde la página

create policy "cartelera publica" on funciones for select using (true);
create policy "admin funciones" on funciones for all to authenticated
  using (es_admin()) with check (es_admin());

-- El público solo puede crear reservas (no leerlas) y solo para funciones activas y futuras.
create policy "reservar" on reservas for insert to anon, authenticated
  with check (exists (select 1 from funciones f
                      where f.id = funcion_id and f.estado = 'activa' and f.fecha > now()));
create policy "admin lee reservas" on reservas for select to authenticated using (es_admin());
create policy "admin borra reservas" on reservas for delete to authenticated using (es_admin());

-- Funciones de EJEMPLO: bórralas o edítalas desde el panel.
insert into funciones (pelicula, detalle, fecha) values
  ('Hable con ella', 'Pedro Almodóvar · 2002 · 112 min', date_trunc('day', now()) + interval '2 days 20 hours'),
  ('Todo sobre mi madre', 'Pedro Almodóvar · 1999 · 101 min', date_trunc('day', now()) + interval '3 days 19 hours'),
  ('Y tu mamá también', 'Alfonso Cuarón · 2001 · 106 min', date_trunc('day', now()) + interval '4 days 18 hours 30 minutes');
