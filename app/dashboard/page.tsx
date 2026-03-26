'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardOverview() {
  const supabase = createClient();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome)')
        .order('data_agendada', { ascending: true });
      
      if (data) setOrdens(data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const ordensHoje = ordens.filter(os => os.data_agendada && isToday(new Date(os.data_agendada)));
  const concluidasHoje = ordensHoje.filter(os => os.status === 'concluido').length;
  const emAndamentoHoje = ordensHoje.filter(os => os.status === 'em_andamento').length;
  
  const faturamentoMes = ordens
    .filter(os => os.status === 'concluido')
    .reduce((acc, os) => acc + (parseFloat(os.valor_final) || 0), 0);

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">Bem-vindo(a) de volta!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Faturamento (Geral/Teste)</h3>
          <p className="text-3xl font-bold mt-2">R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 text-xs flex gap-2">
            <span className="text-primary font-medium">Baseado em OS concluídas</span>
          </div>
        </div>


        {/* Card 2 */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Serviços Hoje</h3>
          <p className="text-3xl font-bold mt-2">{ordensHoje.length}</p>
          <div className="mt-2 text-xs flex gap-2">
            <span className="text-green-500 font-medium">{concluidasHoje} Concluídos</span>
            <span className="text-yellow-500 font-medium">{emAndamentoHoje} Em andamento</span>
          </div>
        </div>


        {/* Card 3 */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Meta de Instalação</h3>
          <p className="text-3xl font-bold mt-2">75%</p>
          <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Ranking da Equipe</h3>
          <p className="text-lg font-bold mt-2 truncate">1º Carlos Silva</p>
          <p className="text-xs text-muted-foreground truncate">2º João (R$ 4k) • 3º Pedro (R$ 3.2k)</p>
        </div>
      </div>

      <div className="mt-8 bg-card border border-border rounded-xl shadow-sm p-6 overflow-hidden">
        <h3 className="text-lg font-bold mb-4 text-foreground">Agenda do Dia</h3>
        
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando agenda...</div>
          ) : ordensHoje.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">Nenhum serviço agendado para hoje.</div>
          ) : (
            ordensHoje.map((item, i) => (
               <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => window.location.href = `/ordens/${item.id}/executar`}>
                 <div className="flex items-center gap-4">
                   <div className="text-primary font-bold">
                     {item.data_agendada ? format(new Date(item.data_agendada), 'HH:mm') : '--:--'}
                   </div>
                   <div>
                     <div className="font-semibold text-foreground uppercase text-xs tracking-wider opacity-80">{item.tipo_servico}</div>
                     <div className="font-medium text-foreground">{item.clientes?.nome}</div>
                   </div>
                 </div>
                 <div className="mt-2 sm:mt-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'em_andamento' ? 'bg-yellow-500/10 text-yellow-500' :
                      item.status === 'pendente' ? 'bg-blue-500/10 text-blue-500' :
                      item.status === 'concluido' ? 'bg-green-500/10 text-green-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                 </div>
               </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
