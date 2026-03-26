'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, PenSquare, Eye } from 'lucide-react';

export default function ClienteDetalhe({ params }: { params: { id: string } }) {
  // Mock Data
  const equipamentos = [
    { id: 1, marca: 'LG', modelo: 'Dual Inverter 12.000 BTU', local: 'Recepção', proxManu: '15/05/2026', status: 'ok' },
    { id: 2, marca: 'Samsung', modelo: 'WindFree 18.000 BTU', local: 'Sala 01', proxManu: '02/04/2026', status: 'alert' },
    { id: 3, marca: 'LG', modelo: 'Dual Inverter 9.000 BTU', local: 'Sala 02', proxManu: '20/06/2026', status: 'ok' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link href="/clientes" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
           <div className="flex items-center gap-3">
              <Building2 className="text-primary hidden sm:block" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Clínica Sorriso Odontologia</h2>
           </div>
        </div>
        <div className="shrink-0 flex gap-2">
           <Button variant="outline" size="sm" className="hidden sm:inline-flex">Editar</Button>
           <Button variant="default" size="sm">Nova OS</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Painel lateral: Informações */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-2">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Phone size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="font-medium">11 99999-8888<br/><span className="text-muted-foreground font-normal">Dra. Camila</span></span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Mail size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="truncate">contato@clinicasorriso.com.br</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span>Av. Paulista, 1000 - Cj. 45<br/>Bela Vista, São Paulo - SP</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FileText size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">CNPJ: 14.222.333/0001-99</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
               <span className="text-xs text-muted-foreground block mb-2">Observações</span>
               <p className="text-sm bg-secondary rounded p-3">Atendimento preferencial após as 14h. Avisar na portaria a equipe de manutenção.</p>
            </div>
          </div>
        </div>

        {/* Principal: Equipamentos e Histórico */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-lg flex items-center gap-2">
                 <Wrench size={20} className="text-primary" /> Equipamentos no Local
               </h3>
               <Button variant="outline" size="sm">Adicionar</Button>
             </div>

             <div className="space-y-3">
               {equipamentos.map(eq => (
                 <div key={eq.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                    <div>
                      <h4 className="font-bold text-foreground text-base mb-1">{eq.marca} - {eq.modelo}</h4>
                      <p className="text-sm text-muted-foreground mb-2">Local/Ambiente: <span className="text-foreground font-medium">{eq.local}</span></p>
                      
                      {eq.status === 'alert' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                           <AlertTriangle size={14} /> Manutenção Atrasada (Prevista: {eq.proxManu})
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                           Próxima manutenção: {eq.proxManu}
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
           </div>

           <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
               <h3 className="font-bold text-lg">Histórico de Ordens de Serviço</h3>
               <Link href="/ordens" className="text-sm text-primary hover:underline">Ver todas completas</Link>
             </div>
             
             <div className="space-y-0">
                {[
                  { tag: '12/03/2026', label: 'Manutenção Corretiva (Sala 01)', tech: 'Carlos Silva', status: 'Concluído', val: 'R$ 250,00' },
                  { tag: '10/11/2025', label: 'Manutenção Preventiva (Todos)', tech: 'João', status: 'Concluído', val: 'R$ 600,00' },
                  { tag: '15/05/2025', label: 'Instalação (Recepção)', tech: 'Carlos Silva', status: 'Concluído', val: 'R$ 800,00' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium text-sm text-foreground mb-0.5">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.tag} • Técnico: {item.tech}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-medium text-green-500">{item.status}</div>
                       <div className="text-sm font-bold">{item.val}</div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
