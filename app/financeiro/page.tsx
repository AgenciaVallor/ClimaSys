'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Download, Filter, Target, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

export default function Financeiro() {
  const [filterType, setFilterType] = useState('all');

  const extrato = [
    { id: 1024, data: '24/03/2026', cliente: 'Dra. Camila Torres', tech: 'Carlos', tipo: 'preventive', valor: 250.00, metodo: 'PIX', status: 'pago' },
    { id: 1023, data: '22/03/2026', cliente: 'Escritório Alfa', tech: 'Pedro', tipo: 'installation', valor: 850.00, metodo: 'Cartão de Crédito', status: 'pago' },
    { id: 1022, data: '20/03/2026', cliente: 'João Silva', tech: 'Carlos', tipo: 'corrective', valor: 450.00, metodo: 'Dinheiro', status: 'pago' },
    { id: 1021, data: '18/03/2026', cliente: 'Restaurante Sabor', tech: 'João', tipo: 'corrective', valor: 1200.00, metodo: 'Boleto', status: 'pendente' },
    { id: 1020, data: '15/03/2026', cliente: 'Clínica Sorriso', tech: 'Carlos', tipo: 'preventive', valor: 500.00, metodo: 'PIX', status: 'pago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
           <p className="text-sm text-muted-foreground">Acompanhe o faturamento e as metas da empresa.</p>
        </div>
        <Button variant="outline" className="shrink-0 gap-2">
          <Download size={18} /> Exportar CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {/* Total Faturado */}
         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
               <DollarSign size={20} className="text-primary" />
               <h3 className="font-semibold text-foreground">Receita do Mês</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">R$ 14.500</p>
            <p className="text-sm text-green-500 font-medium mt-2 flex items-center gap-1">
               <TrendingUp size={14} /> +12% em relação a Fevereiro
            </p>
         </div>

         {/* Meta de Instalação */}
         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3 text-muted-foreground">
                 <Target size={20} className="text-blue-500" />
                 <h3 className="font-semibold text-foreground">Meta de Instalação</h3>
               </div>
               <button className="text-xs font-semibold text-primary hover:underline">Configurar</button>
            </div>
            <p className="text-xl font-bold text-foreground mb-1">R$ 6.800 <span className="text-sm text-muted-foreground font-normal">de R$ 10.000</span></p>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">68% atingido</p>
         </div>

         {/* Meta de Manutenção */}
         <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3 text-muted-foreground">
                 <Target size={20} className="text-green-500" />
                 <h3 className="font-semibold text-foreground">Meta de Manutenção</h3>
               </div>
               <button className="text-xs font-semibold text-primary hover:underline">Configurar</button>
            </div>
            <p className="text-xl font-bold text-foreground mb-1">R$ 7.700 <span className="text-sm text-muted-foreground font-normal">de R$ 6.000</span></p>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mt-3">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-green-500 font-medium mt-2 text-right">Meta superada! (128%)</p>
         </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20">
           <h3 className="font-bold text-foreground">Extrato de Serviços Finalizados</h3>
           
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
             <Button variant="outline" size="sm" className="h-9 gap-2">
               <CalendarIcon size={14} /> Março 2026
             </Button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-secondary/10">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Data / OS</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cliente / Técnico</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Método</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {extrato
                .filter(item => {
                  if (filterType === 'all') return true;
                  if (filterType === 'installation') return item.tipo === 'installation';
                  return item.tipo === 'preventive' || item.tipo === 'corrective';
                })
                .map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4 text-sm">
                     <span className="font-bold text-foreground block">{item.data}</span>
                     <span className="text-muted-foreground text-xs">OS #{item.id}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                     <span className="font-medium text-foreground block">{item.cliente}</span>
                     <span className="text-muted-foreground text-xs">{item.tech}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {item.tipo === 'installation' && <span className="text-blue-500 font-medium">Instalação</span>}
                    {item.tipo === 'preventive' && <span className="text-green-500 font-medium">Preventiva</span>}
                    {item.tipo === 'corrective' && <span className="text-orange-500 font-medium">Corretiva</span>}
                  </td>
                  <td className="px-4 py-4 text-sm">
                     <span className="block">{item.metodo}</span>
                     {item.status === 'pendente' ? (
                       <span className="text-xs text-orange-500 font-medium">Aguardando Pagamento</span>
                     ) : (
                       <span className="text-xs text-green-500 font-medium">Recebido</span>
                     )}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-right text-foreground">
                     R$ {item.valor.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
