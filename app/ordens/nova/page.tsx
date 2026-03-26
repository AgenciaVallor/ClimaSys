'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CalculatorIcon } from 'lucide-react';
import { calculateBTU } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function NovaOS() {
  const supabase = createClient();
  const [type, setType] = useState('preventive');
  const [clientes, setClientes] = useState<any[]>([]);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [clienteId, setClienteId] = useState('');
  const [equipamentoId, setEquipamentoId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [description, setDescription] = useState('');

  // BTU Calculator State
  const [area, setArea] = useState('');
  const [people, setPeople] = useState('');
  const [electronics, setElectronics] = useState('');
  const [sunExposure, setSunExposure] = useState<'low' | 'high'>('low');
  const [btuResult, setBtuResult] = useState<number | null>(null);

  useEffect(() => {
    async function loadClientes() {
      const { data } = await supabase.from('clientes').select('*');
      if (data) setClientes(data);
      setLoading(false);
    }
    loadClientes();
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
      tipo_servico: type === 'installation' ? 'instalação' : type,
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


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ordens" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={24} />
        </Link>
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
                  <option key={c.id} value={c.id}>{c.nome} ({c.telefone})</option>
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
                <option value="">{clienteId ? 'Selecione o equipamento...' : 'Selecione um cliente primeiro'}</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.descricao} ({eq.localizacao})</option>
                ))}
              </select>
            </div>
          </div>


          <div className="border-t border-border pt-6">
            <label className="text-sm font-medium mb-3 block">Tipo de Serviço</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('installation')}
                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  type === 'installation' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                }`}
              >
                Instalação
              </button>
              <button
                type="button"
                onClick={() => setType('preventive')}
                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  type === 'preventive' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                }`}
              >
                Preventiva
              </button>
              <button
                type="button"
                onClick={() => setType('corrective')}
                className={`py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  type === 'corrective' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                }`}
              >
                Corretiva
              </button>
            </div>
          </div>

          {/* Calculadora BTU condicional para Instalação */}
          {type === 'installation' && (
            <div className="bg-secondary/40 border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-primary flex items-center gap-2">
                  <CalculatorIcon size={18} /> Calculadora de capacidade (BTU)
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
                  <option value="">Selecione...</option>
                  <option value="carlos">Carlos Silva</option>
                  <option value="joao">João Mateus</option>
               </select>
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
            <Button variant="ghost" type="button" asChild>
              <Link href="/ordens">Cancelar</Link>
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
