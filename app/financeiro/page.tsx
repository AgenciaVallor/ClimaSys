'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Target, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_LABEL: Record<string, { label: string; color: string }> = {
  'instalação': { label: 'Instalação', color: 'text-blue-500' },
  'preventiva': { label: 'Preventiva', color: 'text-green-500' },
  'corretiva': { label: 'Corretiva', color: 'text-orange-500' },
};

const PAGAMENTO_LABEL: Record<string, string> = {
  pix: 'PIX',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  cash: 'Dinheiro',
  boleto: 'Boleto',
};

export default function Financeiro() {
  const supabase = createClient();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [mesAtual, setMesAtual] = useState(new Date());
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function fetchOrdens() {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (userId) {
        const { data: perfil } = await supabase.from('perfis').select('role').eq('id', userId).single();
        if (perfil?.role === 'tecnico' || perfil?.role === 'funcionário' || perfil?.role === 'funcionario') {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      const inicio = startOfMonth(mesAtual).toISOString();
      const fim = endOfMonth(mesAtual).toISOString();

      const { data } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome), perfis(nome)')
        .in('status', ['concluido', 'finalizado'])
        .gte('updated_at', inicio)
        .lte('updated_at', fim)
        .order('updated_at', { ascending: false });

      if (data) setOrdens(data);
      setLoading(false);
    }
    fetchOrdens();
  }, [mesAtual, supabase]);

  const ordensFiltradas = ordens.filter(os => {
    if (filterType === 'all') return true;
    if (filterType === 'installation') return os.tipo_servico === 'instalação';
    return os.tipo_servico === 'preventiva' || os.tipo_servico === 'corretiva';
  });

  const totalFaturado = ordens.reduce((acc, os) => acc + (parseFloat(os.valor_final) || 0), 0);
  const totalInstalacoes = ordens.filter(os => os.tipo_servico === 'instalação').reduce((acc, os) => acc + (parseFloat(os.valor_final) || 0), 0);
  const totalManutencoes = ordens.filter(os => os.tipo_servico !== 'instalação').reduce((acc, os) => acc + (parseFloat(os.valor_final) || 0), 0);

  const mesLabel = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });
  const mesCap = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  if (accessDenied) {
     return (
       <div className="flex flex-col items-center justify-center py-20 space-y-4">
         <h2 className="text-2xl font-bold text-destructive">Acesso Restrito</h2>
         <p className="text-muted-foreground">O seu perfil de Técnico/Equipe não tem permissão para visualizar dados financeiros.</p>
         <Button onClick={() => window.location.href = '/dashboard'}>Ir para Dashboard</Button>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
           <p className="text-sm text-muted-foreground">Acompanhe o faturamento e as metas da empresa.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMesAtual(subMonths(mesAtual, 1))}>‹ Anterior</Button>
          <span className="text-sm font-medium px-2">{mesCap}</span>
          <Button variant="outline" size="sm" disabled={format(mesAtual, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')} onClick={() => setMesAtual(subMonths(mesAtual, -1))}>Próximo ›</Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-6 md:grid-cols-3">
         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
               <DollarSign size={20} className="text-primary" />
               <h3 className="font-semibold text-foreground">Receita do Mês</h3>
            </div>
            {loading ? (
              <div className="h-9 w-32 bg-secondary animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-foreground">
                R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">{ordens.length} OS concluídas</p>
         </div>

         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Target size={20} className="text-blue-500" />
              <h3 className="font-semibold text-foreground">Instalações</h3>
            </div>
            {loading ? (
              <div className="h-9 w-32 bg-secondary animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                R$ {totalInstalacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">{ordens.filter(os => os.tipo_servico === 'instalação').length} instalações concluídas</p>
         </div>

         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <TrendingUp size={20} className="text-green-500" />
              <h3 className="font-semibold text-foreground">Manutenções</h3>
            </div>
            {loading ? (
              <div className="h-9 w-32 bg-secondary animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                R$ {totalManutencoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">{ordens.filter(os => os.tipo_servico !== 'instalação').length} manutenções concluídas</p>
         </div>
      </div>

      {/* Extrato */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20">
           <h3 className="font-bold text-foreground">Extrato — {mesCap}</h3>
           <div className="flex items-center gap-2">
             <select
               className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
               value={filterType}
               onChange={e => setFilterType(e.target.value)}
             >
                <option value="all">Todas as Categorias</option>
                <option value="installation">Apenas Instalações</option>
                <option value="maintenance">Apenas Manutenções</option>
             </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-secondary/10">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Data / OS</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cliente / Técnico</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Pagamento</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground animate-pulse">
                    Carregando extrato...
                  </td>
                </tr>
              ) : ordensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground italic">
                    Nenhum serviço concluído neste período.
                  </td>
                </tr>
              ) : (
                ordensFiltradas.map((os) => {
                  const tipoInfo = TIPO_LABEL[os.tipo_servico] || { label: os.tipo_servico, color: 'text-muted-foreground' };
                  return (
                    <tr key={os.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4 text-sm">
                         <span className="font-bold text-foreground block">
                           {os.updated_at ? format(new Date(os.updated_at), 'dd/MM/yyyy') : '---'}
                         </span>
                         <span className="text-muted-foreground text-xs">OS #{os.id.slice(0,4).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                         <span className="font-medium text-foreground block">{os.clientes?.nome || '---'}</span>
                         <span className="text-muted-foreground text-xs">{os.perfis?.nome || 'Técnico não definido'}</span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`font-medium ${tipoInfo.color}`}>{tipoInfo.label}</span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                         <span className="block">{PAGAMENTO_LABEL[os.forma_pagamento] || os.forma_pagamento || '---'}</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-right text-foreground">
                         R$ {parseFloat(os.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="p-4 border-t border-border text-right text-sm font-medium text-foreground bg-secondary/10">
            Total no período: <span className="text-primary text-base font-bold ml-2">
              R$ {ordensFiltradas.reduce((acc, os) => acc + (parseFloat(os.valor_final) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
