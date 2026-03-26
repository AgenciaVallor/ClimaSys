import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OrdensList() {
  const supabase = createClient();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrdens() {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome)')
        .order('created_at', { ascending: false });
      
      if (data) setOrdens(data);
      setLoading(false);
    }
    fetchOrdens();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Ordens de Serviço</h2>
           <p className="text-sm text-muted-foreground">Gerencie todas as OS da sua empresa.</p>
        </div>
        <Link 
          href="/ordens/nova" 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus size={20} />
          Nova OS
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Buscar OS, cliente ou técnico..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-card hover:bg-secondary transition-colors">
           <Filter size={20} />
           <span className="hidden sm:inline">Filtrar</span>
         </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">Cliente</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">Serviço</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">Data</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-sm">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground animate-pulse">
                    Carregando ordens de serviço...
                  </td>
                </tr>
              ) : ordens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              ) : (
                ordens.map((os) => (
                  <tr key={os.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/ordens/${os.id}/executar`}>
                    <td className="px-4 py-4 text-sm font-medium">#{os.id.slice(0, 4).toUpperCase()}</td>
                    <td className="px-4 py-4 text-sm">{os.clientes?.nome || 'Cliente não encontrado'}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground capitalize">{os.tipo_servico || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        os.status === 'concluido' ? 'bg-green-500/10 text-green-500' :
                        os.status === 'em_andamento' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {os.status === 'concluido' ? 'Concluído' : 
                         os.status === 'em_andamento' ? 'Em andamento' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {os.data_agendada ? format(new Date(os.data_agendada), 'dd/MM/yyyy', { locale: ptBR }) : '---'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      {os.valor_estimado ? `R$ ${os.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
        <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
           Exibindo {ordens.length} ordens de serviço.
        </div>

      </div>
    </div>
  );
}
