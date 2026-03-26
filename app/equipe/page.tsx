'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, UserPlus, MoreVertical, ShieldCheck, User as UserIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function EquipeList() {
  const supabase = createClient();
  const [equipe, setEquipe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipe() {
      const { data } = await supabase.from('perfis').select('*');
      if (data) setEquipe(data);
      setLoading(false);
    }
    fetchEquipe();
  }, [supabase]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Equipe</h2>
           <p className="text-sm text-muted-foreground">Gerencie seus técnicos, gerentes e convites pendentes.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <UserPlus size={18} /> Convidar Membro
        </Button>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input type="text" placeholder="Buscar por nome ou papel..." className="pl-10 h-11" />
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {loading ? (
           <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">Carregando equipe...</div>
         ) : equipe.length === 0 ? (
           <div className="col-span-full py-20 text-center text-muted-foreground">Nenhum membro da equipe encontrado.</div>
         ) : (
           equipe.map(membro => (
             <div key={membro.id} className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-all font-sans">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
                        <span className="font-bold text-lg text-primary">{membro.nome?.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-tight">
                          {membro.nome}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          {membro.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">
                              <ShieldCheck size={12} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded font-medium">
                              <UserIcon size={12} /> Técnico
                            </span>
                          )}
                        </div>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2 -mt-2">
                     <MoreVertical size={16} />
                   </Button>
                </div>
  
                <div className="space-y-3 mb-5">
                   <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">ID Interno</span>
                      <span className="font-medium">{membro.id.slice(0, 8)}</span>
                   </div>
                </div>
  
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                   <div className="text-center">
                      <p className="text-sm font-bold text-foreground">Disponível</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">Status</p>
                   </div>
                   <div className="text-center border-l border-border pl-2">
                      <p className="text-sm font-bold text-foreground">Conectado</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">Sessão</p>
                   </div>
                </div>
             </div>
           ))
         )}
      </div>

    </div>
  );
}
