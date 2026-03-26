-- ============================================================
-- ClimaSys - Seed de Dados para Testes
-- ATENÇÃO: Execute APENAS DEPOIS do supabase_schema.sql
-- ATENÇÃO: Substitua o UUID abaixo pelo ID do seu usuário admin
--          (veja em Authentication > Users no painel do Supabase)
-- ============================================================

-- PASSO 1: Descubra seu USER_ID no painel do Supabase:
--   Authentication > Users > copie o "UID" do seu usuário
--
-- PASSO 2: Cole o UUID abaixo no lugar de 'SEU-USER-ID-AQUI'
-- ============================================================

do $$
declare
  v_empresa_id uuid;
  v_cliente1   uuid;
  v_cliente2   uuid;
  v_cliente3   uuid;
  v_equip1     uuid;
  v_equip2     uuid;
  v_equip3     uuid;
  v_equip4     uuid;
  v_user_id    uuid;
  v_tecnico_id uuid;
begin

  -- ✅ SUBSTITUA AQUI pelo UID do seu usuário admin:
  v_user_id := 'SEU-USER-ID-AQUI';

  -- ============================================================
  -- 1. Criar empresa de teste
  -- ============================================================
  insert into public.empresas (nome, slug)
  values ('Empresa Demo ClimaSys', 'empresa-demo')
  returning id into v_empresa_id;

  -- ============================================================
  -- 2. Criar perfil admin (vincula usuário à empresa)
  -- ============================================================
  insert into public.perfis (id, empresa_id, nome, role, telefone)
  values (v_user_id, v_empresa_id, 'Administrador', 'admin', '11 99999-0000')
  on conflict (id) do update
    set empresa_id = excluded.empresa_id,
        nome = excluded.nome,
        role = excluded.role;

  -- ============================================================
  -- 3. Criar um técnico de teste (crie o usuário p/ ele no Auth)
  -- ============================================================
  insert into public.perfis (id, empresa_id, nome, role, telefone)
  values (uuid_generate_v4(), v_empresa_id, 'Carlos Silva (Técnico)', 'tecnico', '11 98888-1111')
  returning id into v_tecnico_id;

  -- ============================================================
  -- 4. Criar clientes de teste
  -- ============================================================
  insert into public.clientes (empresa_id, nome, email, telefone, cnpj_cpf, endereco, cidade, estado, observacoes)
  values (v_empresa_id, 'Clínica Sorriso Odontologia', 'contato@clinicasorriso.com.br', '11 99999-8888', '14.222.333/0001-99', 'Av. Paulista, 1000 - Cj. 45', 'São Paulo', 'SP', 'Atendimento preferencial após as 14h. Avisar na portaria.')
  returning id into v_cliente1;

  insert into public.clientes (empresa_id, nome, email, telefone, cnpj_cpf, endereco, cidade, estado)
  values (v_empresa_id, 'Escritório Contábil MR', 'financeiro@escritoriomr.com.br', '11 3333-4444', '22.111.444/0001-55', 'Rua das Flores, 200, Sala 5', 'São Paulo', 'SP')
  returning id into v_cliente2;

  insert into public.clientes (empresa_id, nome, email, telefone, endereco, cidade, estado)
  values (v_empresa_id, 'João Pedro (Residencial)', 'joao@email.com', '11 97777-5555', 'Rua das Palmeiras, 45', 'Santo André', 'SP')
  returning id into v_cliente3;

  -- ============================================================
  -- 5. Criar equipamentos
  -- ============================================================
  insert into public.equipamentos (empresa_id, cliente_id, descricao, marca, modelo, localizacao, proxima_manutencao, status)
  values (v_empresa_id, v_cliente1, 'LG Dual Inverter 12.000 BTU', 'LG', 'Dual Inverter', 'Recepção', current_date + interval '50 days', 'ok')
  returning id into v_equip1;

  insert into public.equipamentos (empresa_id, cliente_id, descricao, marca, modelo, localizacao, proxima_manutencao, status)
  values (v_empresa_id, v_cliente1, 'Samsung WindFree 18.000 BTU', 'Samsung', 'WindFree', 'Sala de Atendimento', current_date - interval '5 days', 'alert')
  returning id into v_equip2;

  insert into public.equipamentos (empresa_id, cliente_id, descricao, marca, modelo, localizacao, proxima_manutencao, status)
  values (v_empresa_id, v_cliente2, 'Midea Inverter 24.000 BTU', 'Midea', 'Eco Inverter', 'Open Space', current_date + interval '30 days', 'ok')
  returning id into v_equip3;

  insert into public.equipamentos (empresa_id, cliente_id, descricao, marca, modelo, localizacao, proxima_manutencao, status)
  values (v_empresa_id, v_cliente3, 'Daikin 9.000 BTU Inverter', 'Daikin', 'Sense', 'Quarto Principal', current_date + interval '90 days', 'ok')
  returning id into v_equip4;

  -- ============================================================
  -- 6. Criar Ordens de Serviço de teste
  -- ============================================================

  -- OS 1: Pendente para hoje
  insert into public.ordens_servico (empresa_id, cliente_id, equipamento_id, tecnico_id, tipo_servico, status, descricao, data_agendada, valor_estimado)
  values (v_empresa_id, v_cliente1, v_equip2, v_tecnico_id, 'corretiva', 'pendente', 'Ar não está gelando, possível falta de gás ou problema no compressor.', now() + interval '2 hours', 280.00);

  -- OS 2: Em andamento
  insert into public.ordens_servico (empresa_id, cliente_id, equipamento_id, tecnico_id, tipo_servico, status, descricao, data_agendada, valor_estimado)
  values (v_empresa_id, v_cliente2, v_equip3, v_tecnico_id, 'preventiva', 'em_andamento', 'Manutenção preventiva semestral. Limpeza de filtros e serpentina.', now() - interval '1 hour', 350.00);

  -- OS 3: Concluída (para aparecer no histórico)
  insert into public.ordens_servico (empresa_id, cliente_id, equipamento_id, tecnico_id, tipo_servico, status, descricao, data_agendada, valor_estimado, valor_final, forma_pagamento)
  values (v_empresa_id, v_cliente1, v_equip1, v_tecnico_id, 'preventiva', 'concluido', 'Manutenção preventiva completa dos 3 aparelhos.', now() - interval '30 days', 600.00, 600.00, 'pix');

  -- OS 4: Concluída
  insert into public.ordens_servico (empresa_id, cliente_id, equipamento_id, tipo_servico, status, descricao, data_agendada, valor_estimado, valor_final, forma_pagamento)
  values (v_empresa_id, v_cliente3, v_equip4, 'instalação', 'concluido', 'Instalação de split inverter no quarto principal.', now() - interval '60 days', 450.00, 450.00, 'credit');

  -- OS 5: Agendada para amanhã
  insert into public.ordens_servico (empresa_id, cliente_id, tipo_servico, status, descricao, data_agendada, valor_estimado)
  values (v_empresa_id, v_cliente3, 'preventiva', 'pendente', 'Revisão semestral do aparelho do quarto.', now() + interval '1 day', 200.00);

  raise notice 'Seed concluído com sucesso para empresa_id: %', v_empresa_id;
end $$;
