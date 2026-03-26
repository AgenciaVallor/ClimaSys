-- ============================================================
-- ClimaSys - Schema Completo do Banco de Dados (Supabase)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: empresas
-- Cada empresa é um tenant isolado no sistema multi-tenant
-- ============================================================
create table if not exists public.empresas (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null,
  slug       text unique not null,
  logo_url   text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: perfis
-- Vincula um usuário Supabase Auth a uma empresa e define seu papel
-- ============================================================
create table if not exists public.perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references public.empresas(id) on delete set null,
  nome       text not null default '',
  role       text not null default 'tecnico' check (role in ('admin', 'tecnico', 'gerente')),
  telefone   text,
  ativo      boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: clientes
-- Clientes de uma empresa (PF ou PJ)
-- ============================================================
create table if not exists public.clientes (
  id         uuid primary key default uuid_generate_v4(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome       text not null,
  email      text,
  telefone   text,
  cnpj_cpf   text,
  endereco   text,
  cidade     text,
  estado     text,
  observacoes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: equipamentos
-- Equipamentos instalados em um cliente
-- ============================================================
create table if not exists public.equipamentos (
  id                  uuid primary key default uuid_generate_v4(),
  empresa_id          uuid not null references public.empresas(id) on delete cascade,
  cliente_id          uuid not null references public.clientes(id) on delete cascade,
  descricao           text not null,       -- Ex: "LG Dual Inverter 12.000 BTU"
  marca               text,
  modelo              text,
  numero_serie        text,
  localizacao         text,               -- Ex: "Sala de Reuniões"
  data_instalacao     date,
  proxima_manutencao  date,
  status              text default 'ok' check (status in ('ok', 'alert', 'inativo')),
  created_at          timestamptz default now()
);

-- ============================================================
-- TABELA: ordens_servico
-- Ordens de Serviço (OS)
-- ============================================================
create table if not exists public.ordens_servico (
  id               uuid primary key default uuid_generate_v4(),
  empresa_id       uuid not null references public.empresas(id) on delete cascade,
  cliente_id       uuid not null references public.clientes(id),
  equipamento_id   uuid references public.equipamentos(id),
  tecnico_id       uuid references public.perfis(id),
  tipo_servico     text not null default 'preventiva' check (tipo_servico in ('instalação', 'preventiva', 'corretiva')),
  status           text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  descricao        text,
  data_agendada    timestamptz,
  valor_estimado   numeric(10,2),
  valor_final      numeric(10,2),
  forma_pagamento  text,
  assinatura_url   text,
  observacoes_tecnico text,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index if not exists idx_clientes_empresa on public.clientes(empresa_id);
create index if not exists idx_equipamentos_cliente on public.equipamentos(cliente_id);
create index if not exists idx_os_empresa on public.ordens_servico(empresa_id);
create index if not exists idx_os_cliente on public.ordens_servico(cliente_id);
create index if not exists idx_os_status on public.ordens_servico(status);
create index if not exists idx_os_data on public.ordens_servico(data_agendada);
create index if not exists idx_perfis_empresa on public.perfis(empresa_id);

-- ============================================================
-- FUNÇÃO: atualiza updated_at automaticamente
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_os_updated_at
  before update on public.ordens_servico
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenancy
-- Garante que cada empresa só vê seus próprios dados
-- ============================================================

-- Habilitar RLS em todas as tabelas
alter table public.empresas        enable row level security;
alter table public.perfis          enable row level security;
alter table public.clientes        enable row level security;
alter table public.equipamentos    enable row level security;
alter table public.ordens_servico  enable row level security;

-- HELPER: função para descobrir empresa_id do usuário logado
create or replace function public.minha_empresa_id()
returns uuid as $$
  select empresa_id from public.perfis where id = auth.uid()
$$ language sql stable security definer;

-- ------------------------------------------------------------
-- POLÍTICAS: empresas
-- O usuário só pode ver a SUA empresa
-- ------------------------------------------------------------
create policy "Usuário lê sua empresa"
  on public.empresas for select
  using (id = public.minha_empresa_id());

create policy "Usuário atualiza sua empresa"
  on public.empresas for update
  using (id = public.minha_empresa_id());

-- ------------------------------------------------------------
-- POLÍTICAS: perfis
-- Usuário pode ver perfis da mesma empresa; pode atualizar o próprio
-- ------------------------------------------------------------
create policy "Perfis da mesma empresa"
  on public.perfis for select
  using (empresa_id = public.minha_empresa_id() or id = auth.uid());

create policy "Inserir próprio perfil"
  on public.perfis for insert
  with check (id = auth.uid());

create policy "Atualizar próprio perfil"
  on public.perfis for update
  using (id = auth.uid() or empresa_id = public.minha_empresa_id());

-- ------------------------------------------------------------
-- POLÍTICAS: clientes
-- ------------------------------------------------------------
create policy "CRUD clientes da empresa"
  on public.clientes for all
  using (empresa_id = public.minha_empresa_id())
  with check (empresa_id = public.minha_empresa_id());

-- ------------------------------------------------------------
-- POLÍTICAS: equipamentos
-- ------------------------------------------------------------
create policy "CRUD equipamentos da empresa"
  on public.equipamentos for all
  using (empresa_id = public.minha_empresa_id())
  with check (empresa_id = public.minha_empresa_id());

-- ------------------------------------------------------------
-- POLÍTICAS: ordens_servico
-- ------------------------------------------------------------
create policy "CRUD OS da empresa"
  on public.ordens_servico for all
  using (empresa_id = public.minha_empresa_id())
  with check (empresa_id = public.minha_empresa_id());

-- ============================================================
-- STORAGE: Bucket para assinaturas
-- Execute no SQL Editor OU pela interface do Supabase Storage
-- ============================================================
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

create policy "Usuários autenticados fazem upload de assinaturas"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'signatures');

create policy "Usuários autenticados leem assinaturas"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'signatures');
