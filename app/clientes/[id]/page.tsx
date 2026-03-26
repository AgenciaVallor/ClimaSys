'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, PenSquare, Eye, User, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClienteDetalhe({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [cliente, setCliente] = useState<any>(null);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      // Buscar dados do cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (clienteData) setCliente(clienteData);

      // Buscar equipamentos do cliente
      const { data: equipsData } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('cliente_id', params.id)
        .order('created_at', { ascending: false });

      if (equipsData) setEquipamentos(equipsData);

      // Buscar histórico de OS do cliente
      const { data: osData } = await supabase
        .from('ordens_servico')
        .select('*, equipamentos(descricao), perfis(nome)')
        .eq('cliente_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (osData) setHistorico(osData);

      setLoading(false);
    }
    fetchAll();
  }, [params.id, supabase]);

  const statusColor: Record<string, string> = {
    ok: 'bg-green-500/10 text-green-500 border-green-500/20',
    alert: 'bg-red-500/10 text-red-500 border-red-500/20',
    inativo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const osStatusColor: Record<string, string> = {
    concluido: 'text-green-500',
    em_andamento: 'text-yellow-500',
    pendente: 'text-blue-500',
    cancelado: 'text-red-500',
  };

  const osStatusLabel: Record<string, string> = {
    concluido: 'Concluído',
    em_andamento: 'Em andamento',
    pendente: 'Pendente',
    cancelado: 'Cancelado',
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center text-muted-foreground animate-pulse">
        Carregando dados do cliente...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <p className="text-destructive font-medium text-lg">Cliente não encontrado.</p>
        <Link href="/clientes" className="text-primary hover:underline text-sm mt-2 inline-block">
          Voltar para lista de clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
           <div className="flex items-center gap-3">
              <Building2 className="text-primary hidden sm:block" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{cliente.nome}</h2>
           </div>
        </div>
        <div className="shrink-0 flex gap-2">
           <Button variant="outline" size="sm" className="hidden sm:inline-flex">Editar</Button>
           <Button variant="default" size="sm" asChild>
             <Link href={`/ordens/nova?cliente=${params.id}`}>Nova OS</Link>
           </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Painel lateral: Informações */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Contato</h3>
            <div className="space-y-3">
              {cliente.telefone && (
                <div className="flex items-start gap-3 text-sm">
                  <Phone size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="font-medium">{cliente.telefone}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-start gap-3 text-sm">
                  <Mail size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.endereco && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span>{cliente.endereco}{cliente.cidade ? `, ${cliente.cidade}` : ''}{cliente.estado ? ` - ${cliente.estado}` : ''}</span>
                </div>
              )}
              {cliente.cnpj_cpf && (
                <div className="flex items-start gap-3 text-sm">
                  <FileText size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">CNPJ/CPF: {cliente.cnpj_cpf}</span>
                </div>
              )}
            </div>
            {cliente.observacoes && (
              <div className="pt-4 border-t border-border">
                 <span className="text-xs text-muted-foreground block mb-2">Observações</span>
                 <p className="text-sm bg-secondary rounded p-3">{cliente.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Principal: Equipamentos e Histórico */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <Wrench size={20} className="text-primary" /> Equipamentos ({equipamentos.length})
               </h3>
               <Button variant="outline" size="sm">
                 <Plus size={14} className="mr-1" /> Adicionar
               </Button>
             </div>

             {equipamentos.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground italic text-sm">
                 Nenhum equipamento cadastrado para este cliente.
               </div>
             ) : (
               <div className="space-y-3">
                 {equipamentos.map(eq => (
                   <div key={eq.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                      <div>
                        <h4 className="font-bold text-foreground text-base mb-1">{eq.descricao}</h4>
                        {eq.localizacao && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Local: <span className="text-foreground font-medium">{eq.localizacao}</span>
                          </p>
                        )}
                        
                        {eq.proxima_manutencao && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusColor[eq.status] || statusColor.ok}`}>
                            {eq.status === 'alert' && <AlertTriangle size={14} />}
                            {eq.status === 'alert'
                              ? `Manutenção Atrasada (Prevista: ${format(new Date(eq.proxima_manutencao), 'dd/MM/yyyy')})`
                              : `Próxima manutenção: ${format(new Date(eq.proxima_manutencao), 'dd/MM/yyyy')}`
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" title="Editar"><PenSquare size={18} /></Button>
                         <Button variant="ghost" size="icon" title="Ver Histórico"><Eye size={18} /></Button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
               <h3 className="font-bold text-lg">Histórico de Ordens de Serviço</h3>
               <Link href={`/ordens?cliente=${params.id}`} className="text-sm text-primary hover:underline">Ver todas</Link>
             </div>
             
             {historico.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground italic text-sm">
                 Nenhuma OS registrada para este cliente.
               </div>
             ) : (
               <div className="space-y-0">
                 {historico.map((item) => (
                   <Link key={item.id} href={`/ordens/${item.id}/executar`} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 last:pb-0 hover:bg-secondary/20 px-1 rounded transition-colors">
                     <div>
                       <div className="font-medium text-sm text-foreground mb-0.5 capitalize">
                         {item.tipo_servico} {item.equipamentos?.descricao ? `(${item.equipamentos.descricao})` : ''}
                       </div>
                       <div className="text-xs text-muted-foreground">
                         {item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR }) : '---'}
                         {item.perfis?.nome ? ` • Técnico: ${item.perfis.nome}` : ''}
                       </div>
                     </div>
                     <div className="text-right">
                        <div className={`text-xs font-medium ${osStatusColor[item.status] || 'text-muted-foreground'}`}>
                          {osStatusLabel[item.status] || item.status}
                        </div>
                        {item.valor_final != null && (
                          <div className="text-sm font-bold">
                            R$ {parseFloat(item.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                     </div>
                   </Link>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
