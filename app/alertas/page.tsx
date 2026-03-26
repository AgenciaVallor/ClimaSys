'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, CalendarClock, Wrench, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Alertas() {
  const alertas = [
    { id: 1, type: 'critical', msg: '3 Equipamentos da Escritório Alfa estão com manutenção atrasada há mais de 15 dias.', date: 'Hoje, 08:30', client_id: '3' },
    { id: 2, type: 'warning', msg: 'Ar Condicionado LG (Clínica Sorriso) precisa de manutenção preventiva na próxima semana.', date: 'Ontem, 14:20', client_id: '1' },
    { id: 3, type: 'info', msg: 'Meta mensal de instalação atingida em 68%. Mantenha o foco!', date: '22/03/2026', client_id: null },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Alertas e Notificações</h2>
           <p className="text-sm text-muted-foreground">Acompanhe as manutenções previstas e avisos do sistema.</p>
        </div>
        <Button variant="outline" size="sm">
          Marcar todos como lidos
        </Button>
      </div>

      <div className="space-y-4">
         {alertas.map(alerta => (
           <div key={alerta.id} className={`flex gap-4 p-4 rounded-xl border ${
             alerta.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
             alerta.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20' :
             'bg-blue-500/5 border-blue-500/20'
           }`}>
              <div className="shrink-0 mt-1">
                 {alerta.type === 'critical' ? <AlertCircle className="text-red-500" size={24} /> :
                  alerta.type === 'warning' ? <CalendarClock className="text-orange-500" size={24} /> :
                  <CheckCircle className="text-blue-500" size={24} />}
              </div>
              <div className="flex-1">
                 <p className="text-foreground font-medium">{alerta.msg}</p>
                 <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{alerta.date}</span>
                    <div className="space-x-2">
                       {alerta.client_id && (
                         <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                           <Link href={`/clientes/${alerta.client_id}`}>Ver Cliente / Equipamento</Link>
                         </Button>
                       )}
                       {alerta.type !== 'info' && (
                         <Button size="sm" className="h-7 text-xs px-2 gap-1.5" asChild>
                           <Link href={`/ordens/nova`}>
                             <Wrench size={12} /> Criar OS Preventiva
                           </Link>
                         </Button>
                       )}
                    </div>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
