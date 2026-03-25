-- ═══════════════════════════════════════════════════════════════════════════
-- CEROVUELTAS — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensiones ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── ENUM: roles de usuario ───────────────────────────────────────────────────
create type user_role as enum ('cliente', 'profesional', 'admin');

-- ─── ENUM: especialidades ────────────────────────────────────────────────────
create type especialidad as enum (
  'contador', 'asesor_tributario', 'abogado', 'auditor', 'ifrs'
);

-- ─── ENUM: estado de conexión ────────────────────────────────────────────────
create type estado_conexion as enum ('pendiente', 'pagada', 'activa', 'cerrada');

-- ─── ENUM: tipo de informe ────────────────────────────────────────────────────
create type tipo_informe as enum ('basico', 'completo', 'premium');

-- ─── ENUM: estado de informe ─────────────────────────────────────────────────
create type estado_informe as enum ('solicitado', 'en_proceso', 'entregado', 'cancelado');

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: profiles (extiende auth.users de Supabase)
-- ─────────────────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'cliente',
  nombre      text not null,
  apellido    text,
  email       text not null,
  telefono    text,
  empresa     text,
  rut         text unique,
  avatar_url  text,
  ciudad      text default 'Antofagasta',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: profesionales (perfil extendido para rol profesional)
-- ─────────────────────────────────────────────────────────────────────────────
create table profesionales (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  titulo          text not null,
  especialidades  especialidad[] not null default '{}',
  bio             text,
  anos_exp        int default 0,
  tarifa_hora     int,                    -- en CLP
  badge           text,                   -- ej: 'CPC', 'MBA'
  rating          numeric(3,2) default 0,
  total_reviews   int default 0,
  disponible      boolean default true,
  verificado      boolean default false,
  linkedin_url    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: conexiones (pago único $29.000 para contactar profesional)
-- ─────────────────────────────────────────────────────────────────────────────
create table conexiones (
  id              uuid primary key default uuid_generate_v4(),
  cliente_id      uuid not null references profiles(id) on delete cascade,
  profesional_id  uuid not null references profesionales(id) on delete cascade,
  estado          estado_conexion default 'pendiente',
  monto           int default 29000,      -- en CLP
  orden_pago      text,                   -- referencia Transbank/Stripe
  pagado_at       timestamptz,
  created_at      timestamptz default now(),
  unique(cliente_id, profesional_id)      -- un cliente no puede conectar dos veces
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: mensajes (chat entre cliente y profesional)
-- ─────────────────────────────────────────────────────────────────────────────
create table mensajes (
  id            uuid primary key default uuid_generate_v4(),
  conexion_id   uuid not null references conexiones(id) on delete cascade,
  emisor_id     uuid not null references profiles(id) on delete cascade,
  contenido     text not null,
  leido         boolean default false,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: informes (informes financieros)
-- ─────────────────────────────────────────────────────────────────────────────
create table informes (
  id              uuid primary key default uuid_generate_v4(),
  cliente_id      uuid not null references profiles(id) on delete cascade,
  profesional_id  uuid references profesionales(id),
  tipo            tipo_informe not null default 'basico',
  estado          estado_informe default 'solicitado',
  titulo          text,
  descripcion     text,
  precio          int not null,           -- en CLP (49900, 129900, 249900)
  archivo_url     text,                   -- URL en Supabase Storage
  orden_pago      text,
  pagado_at       timestamptz,
  entregado_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: reviews (calificaciones de profesionales)
-- ─────────────────────────────────────────────────────────────────────────────
create table reviews (
  id              uuid primary key default uuid_generate_v4(),
  conexion_id     uuid not null references conexiones(id) on delete cascade,
  cliente_id      uuid not null references profiles(id) on delete cascade,
  profesional_id  uuid not null references profesionales(id) on delete cascade,
  rating          int not null check (rating between 1 and 5),
  comentario      text,
  created_at      timestamptz default now(),
  unique(conexion_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-crear profile cuando se registra un usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-actualizar updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger profesionales_updated_at
  before update on profesionales
  for each row execute function update_updated_at();

create trigger informes_updated_at
  before update on informes
  for each row execute function update_updated_at();

-- Recalcular rating del profesional al insertar review
create or replace function recalcular_rating()
returns trigger language plpgsql security definer as $$
begin
  update profesionales
  set
    rating = (select avg(rating)::numeric(3,2) from reviews where profesional_id = new.profesional_id),
    total_reviews = (select count(*) from reviews where profesional_id = new.profesional_id)
  where id = new.profesional_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on reviews
  for each row execute function recalcular_rating();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles      enable row level security;
alter table profesionales enable row level security;
alter table conexiones    enable row level security;
alter table mensajes      enable row level security;
alter table informes      enable row level security;
alter table reviews       enable row level security;

-- PROFILES
create policy "Perfil propio visible" on profiles
  for select using (auth.uid() = id);

create policy "Perfil público de profesionales" on profiles
  for select using (
    exists (select 1 from profesionales where user_id = profiles.id)
  );

create policy "Actualizar propio perfil" on profiles
  for update using (auth.uid() = id);

-- PROFESIONALES (públicos para búsqueda)
create policy "Profesionales visibles a todos" on profesionales
  for select using (true);

create policy "Profesional edita su propio perfil" on profesionales
  for update using (
    auth.uid() = user_id
  );

create policy "Profesional crea su perfil" on profesionales
  for insert with check (
    auth.uid() = user_id
  );

-- CONEXIONES
create policy "Ver propias conexiones" on conexiones
  for select using (
    auth.uid() = cliente_id or
    auth.uid() = (select user_id from profesionales where id = profesional_id)
  );

create policy "Cliente crea conexión" on conexiones
  for insert with check (auth.uid() = cliente_id);

create policy "Actualizar propia conexión" on conexiones
  for update using (
    auth.uid() = cliente_id or
    auth.uid() = (select user_id from profesionales where id = profesional_id)
  );

-- MENSAJES
create policy "Ver mensajes de propias conexiones" on mensajes
  for select using (
    exists (
      select 1 from conexiones c
      where c.id = mensajes.conexion_id and (
        auth.uid() = c.cliente_id or
        auth.uid() = (select user_id from profesionales where id = c.profesional_id)
      )
    )
  );

create policy "Enviar mensajes en conexiones activas" on mensajes
  for insert with check (
    auth.uid() = emisor_id and
    exists (
      select 1 from conexiones c
      where c.id = mensajes.conexion_id
      and c.estado = 'activa'
      and (
        auth.uid() = c.cliente_id or
        auth.uid() = (select user_id from profesionales where id = c.profesional_id)
      )
    )
  );

-- INFORMES
create policy "Ver propios informes" on informes
  for select using (
    auth.uid() = cliente_id or
    auth.uid() = (select user_id from profesionales where id = profesional_id)
  );

create policy "Cliente solicita informe" on informes
  for insert with check (auth.uid() = cliente_id);

create policy "Profesional actualiza informe asignado" on informes
  for update using (
    auth.uid() = (select user_id from profesionales where id = profesional_id)
  );

-- REVIEWS
create policy "Reviews visibles a todos" on reviews
  for select using (true);

create policy "Cliente deja review de su conexión" on reviews
  for insert with check (auth.uid() = cliente_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (seed)
-- ═══════════════════════════════════════════════════════════════════════════
-- NOTA: Ejecutar DESPUÉS de crear usuarios reales en Auth,
-- o usar el panel de Supabase → Authentication → Add user

-- Descomenta para insertar profesionales de prueba
-- (requiere tener el UUID real del usuario en auth.users)

/*
insert into profesionales (user_id, titulo, especialidades, bio, anos_exp, tarifa_hora, badge, verificado)
values
  ('UUID_ANDREA_LARA',   'Contadora Pública Certificada', '{contador,ifrs}',         'Especialista en IFRS y estados financieros para PYMEs.', 12, 90000, 'CPC',  true),
  ('UUID_MIGUEL_RIQUELME','Asesor Tributario Senior',     '{asesor_tributario}',      'Experto en cumplimiento SII y planificación tributaria.',  8, 75000, 'AT',   true),
  ('UUID_CATALINA_PEREZ', 'Abogada Corporativa',          '{abogado}',               'Derecho corporativo, contratos y laboral.',               10, 95000, 'Abog', true);
*/
