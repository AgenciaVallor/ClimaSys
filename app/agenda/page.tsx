'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 24)); // Fixado em Março 2026 para mockup

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start, end });

  // Pega o dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda)
  const firstDayOfWeek = start.getDay();
  
  // Array de dias vazios pra preencher o calendário antes do dia 1
  const emptyDays = Array.from({ length: firstDayOfWeek }).map((_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Mock dados de OS
  const agendamentos = {
    '24': [
      { id: 1024, type: 'preventive', client: 'Dra. Camila', tech: 'Carlos' },
      { id: 1025, type: 'installation', client: 'Escritório Alfa', tech: 'Pedro' },
    ],
    '25': [
      { id: 1026, type: 'corrective', client: 'Restaurante Central', tech: 'João' },
    ],
    '28': [
      { id: 1027, type: 'installation', client: 'Residencial Lótus', tech: 'Carlos' },
      { id: 1028, type: 'preventive', client: 'Escola Pequeno', tech: 'João' },
      { id: 1029, type: 'preventive', client: 'Loja Moda', tech: 'Pedro' },
    ],
  };

  const getStatusColor = (type: string) => {
    switch(type) {
      case 'installation': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'preventive': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'corrective': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
           <p className="text-sm text-muted-foreground">Visão geral dos atendimentos programados.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2">
             <Filter size={16} />
             <span>Filtros</span>
           </Button>
           <Button>Nova OS Rápida</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[600px]">
        {/* Header do Calendário */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
           <h3 className="text-lg font-bold text-foreground capitalize">
             {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
           </h3>
           <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={prevMonth}>
               <ChevronLeft size={18} />
             </Button>
             <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
               Hoje
             </Button>
             <Button variant="outline" size="icon" onClick={nextMonth}>
               <ChevronRight size={18} />
             </Button>
           </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-xs font-medium text-muted-foreground text-center py-2 shrink-0">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        {/* Body do Calendário */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-border gap-px">
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="bg-card/50 min-h-[100px] p-1"></div>
          ))}

          {daysInMonth.map((day, idx) => {
            const dateStr = format(day, 'd');
            const today = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            // @ts-ignore
            const tasks = agendamentos[dateStr] || [];

            return (
              <div 
                key={`day-${idx}`} 
                className={`bg-card min-h-[100px] p-1.5 transition-colors hover:bg-secondary/20 cursor-pointer overflow-y-auto ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div className={`text-right mb-1`}>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${today ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    {dateStr}
                  </span>
                </div>
                <div className="space-y-1">
                  {tasks.map((task: any, i: number) => (
                    <div 
                      key={i} 
                      className={`text-[10px] sm:text-xs px-1.5 py-1 rounded border truncate flex justify-between ${getStatusColor(task.type)}`}
                      title={`${task.client} - Técnico: ${task.tech}`}
                    >
                      <span className="truncate">{task.client}</span>
                    </div>
                  ))}
                  {tasks.length > 0 && tasks.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center w-full font-medium mt-0.5">
                      + {tasks.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
