'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, User, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientesList() {
  const supabase = createClient();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientes() {
      const { data } = await supabase
        .from('clientes')
        .select('*, equipamentos(id)');
      if (data) setClientes(data);
      setLoading(false);
    }
    fetchClientes();
  }, [supabase]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
           <p className="text-sm text-muted-foreground">Cadastre clientes e acompanhe seus históricos.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus size={18} /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input type="text" placeholder="Nome, telefone, endereço..." className="pl-10 h-11" />
         </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {loading ? (
           <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">Carregando clientes...</div>
         ) : clientes.length === 0 ? (
           <div className="col-span-full py-20 text-center text-muted-foreground">Nenhum cliente cadastrado.</div>
         ) : (
           clientes.map(cliente => (
             <Link key={cliente.id} href={`/clientes/${cliente.id}`} className="group block">
               <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                     <div className={`p-2 rounded-lg mt-1 shrink-0 ${cliente.email?.includes('@') ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                        {cliente.email?.includes('@') ? <Building2 size={24} /> : <User size={24} />}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{cliente.nome}</h3>
                       <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                         <Phone size={14} className="mr-1" /> {cliente.telefone || 'Sem telefone'}
                       </div>
                     </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center mb-4">
                    <MapPin size={14} className="mr-1" /> {cliente.endereco || 'Endereço não cadastrado'}
                  </div>
  
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-medium bg-secondary text-foreground px-2 py-1 rounded-md">
                      {cliente.equipamentos?.length || 0} {cliente.equipamentos?.length === 1 ? 'Equipamento' : 'Equipamentos'}
                    </span>
                    <span className="text-muted-foreground">
                      ID: {cliente.id.slice(0,8)}
                    </span>
                  </div>
               </div>
             </Link>
           ))
         )}
      </div>

    </div>
  );
}
