'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CalculatorIcon } from 'lucide-react';
import { calculateBTU } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function NovaOS() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [type, setType] = useState('preventive');
  const [clientes, setClientes] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [clienteId, setClienteId] = useState(searchParams.get('cliente') || '');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [equipe, setEquipe] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [description, setDescription] = useState('');

  // BTU Calculator State
  const [area, setArea] = useState('');
  const [people, setPeople] = useState('');
  const [electronics, setElectronics] = useState('');
  const [sunExposure, setSunExposure] = useState<'low' | 'high'>('low');
  const [btuResult, setBtuResult] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [clientesRes, tecnicosRes] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('perfis').select('id, nome, role').in('role', ['tecnico', 'admin', 'gerente']).order('nome'),
      ]);
      if (clientesRes.data) setClientes(clientesRes.data);
      if (tecnicosRes.data) setTecnicos(tecnicosRes.data);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  useEffect(() => {
    async function loadEquipamentos() {
      if (!clienteId) {
        setEquipamentos([]);
        return;
      }
      const { data } = await supabase.from('equipamentos').select('*').eq('cliente_id', clienteId);
      if (data) setEquipamentos(data);
    }
    loadEquipamentos();
  }, [clienteId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('ordens_servico').insert({
      cliente_id: clienteId,
      equipamento_id: equipamentoId || null,
      tecnico_id: technicianId || null,
      equipe: equipe,
      tipo_servico: type === 'installation' ? 'instalação' : type === 'preventive' ? 'preventiva' : 'corretiva',
      data_agendada: scheduledDate || null,
      valor_estimado: parseFloat(estimatedValue) || 0,
      descricao: description,
      status: 'pendente'
    });

    if (error) {
      alert("Erro ao criar OS: " + error.message);
    } else {
      alert("OS Criada com sucesso!");
      window.location.href = '/ordens';
    }
  };

  const handleCalculateBtu = () => {
    const res = calculateBTU(
      parseFloat(area) || 0,
      parseInt(people) || 0,
      parseInt(electronics) || 0,
      sunExposure
    );
    setBtuResult(res);
  };

  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <ArrowLeft size={24} /> Voltar
        </button>
        <div>
           <h2 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h2>
           <p className="text-sm text-muted-foreground">Cadastre um novo serviço para um cliente.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Cliente e Equipamento */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <select 
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{loading ? 'Carregando...' : 'Selecione um cliente...'}</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}{c.telefone ? ` (${c.telefone})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipamento</label>
              <select 
                value={equipamentoId}
                onChange={(e) => setEquipamentoId(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{clienteId ? (equipamentos.length === 0 ? 'Nenhum equipamento cadastrado' : 'Selecione o equipamento...') : 'Selecione um cliente primeiro'}</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.descricao}{eq.localizacao ? ` — ${eq.localizacao}` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <label className="text-sm font-medium mb-3 block">Tipo de Serviço</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'installation', label: 'Instalação' },
                { value: 'preventive', label: 'Preventiva' },
                { value: 'corrective', label: 'Corretiva' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                    type === value 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculadora BTU — aparece apenas para Instalação */}
          {type === 'installation' && (
            <div className="bg-secondary/40 border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-primary flex items-center gap-2">
                  <CalculatorIcon size={18} /> Calculadora de Capacidade (BTU)
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Área (m²)</label>
                  <Input type="number" placeholder="20" value={area} onChange={e => setArea(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Pessoas (frequentes)</label>
                  <Input type="number" placeholder="2" value={people} onChange={e => setPeople(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Eletrônicos (TV, PC..)</label>
                  <Input type="number" placeholder="1" value={electronics} onChange={e => setElectronics(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Insolação</label>
                  <select 
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={sunExposure}
                    onChange={e => setSunExposure(e.target.value as 'low' | 'high')}
                  >
                    <option value="low">Baixa/Normal</option>
                    <option value="high">Alta (Batendo sol)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                 <div className="text-sm">
                   {btuResult !== null ? (
                      <span>Capacidade recomendada: <strong className="text-lg text-primary">{btuResult.toLocaleString()} BTUs</strong></span>
                   ) : (
                      <span className="text-muted-foreground">Preencha os campos para calcular</span>
                   )}
                 </div>
                  <Button type="button" variant="secondary" size="sm" onClick={handleCalculateBtu}>
                    Calcular
                  </Button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 border-t border-border pt-6">
             <div className="space-y-2">
               <label className="text-sm font-medium">Data Agendada</label>
               <Input 
                 type="datetime-local" 
                 value={scheduledDate}
                 onChange={(e) => setScheduledDate(e.target.value)}
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Técnico Responsável</label>
               <select 
                 className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 value={technicianId}
                 onChange={(e) => setTechnicianId(e.target.value)}
               >
                  <option value="">Selecione um técnico...</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome}{t.role !== 'tecnico' ? ` (${t.role})` : ''}
                    </option>
                  ))}
               </select>
             </div>
             <div className="space-y-2 md:col-span-2">
               <label className="text-sm font-medium">Equipe (Team)</label>
               <Input 
                 placeholder="Ex: Equipe Alfa, Tercerizada..." 
                 value={equipe}
                 onChange={(e) => setEquipe(e.target.value)}
                 required
               />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Estimado (R$)</label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Ex: 350,00" 
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição ou Escopo (Opcional)</label>
            <textarea 
               className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
               placeholder="Detalhes adicionais sobre o serviço..."
               value={description}
               onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit">
               Salvar e Agendar
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
