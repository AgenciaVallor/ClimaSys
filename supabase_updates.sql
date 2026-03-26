-- ============================================================
-- ClimaSys - Atualização de Schema (Operacional e RBAC)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Adicionar novas colunas em ordens_servico
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS data_inicio timestamptz,
ADD COLUMN IF NOT EXISTS data_conclusao timestamptz,
ADD COLUMN IF NOT EXISTS equipe text;

-- 2. Atualizar a restrição (CHECK) da coluna status para incluir 'finalizado'
ALTER TABLE public.ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_status_check;
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_status_check 
CHECK (status in ('pendente', 'em_andamento', 'concluido', 'finalizado', 'cancelado'));

-- 3. Atualizar a restrição (CHECK) da coluna tipo_servico se necessário
ALTER TABLE public.ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_tipo_servico_check;
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_tipo_servico_check 
CHECK (tipo_servico in ('instalação', 'preventiva', 'corretiva', 'manutencao', 'visita_tecnica', 'limpeza'));
