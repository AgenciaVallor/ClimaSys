'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, User, Phone, MapPin, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientesList() {
  const supabase = createClient();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchClientes() {
    setLoading(true);
    const { data } = await supabase
      .from('clientes')
      .select('*, equipamentos(id)')
      .order('nome');
    if (data) setClientes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchClientes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = clientes.filter(c =>
    busca === '' ||
    c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.endereco?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('clientes').insert({
      nome,
      email: email || null,
      telefone: telefone || null,
      endereco: endereco || null,
      cnpj_cpf: cnpjCpf || null,
      cidade: cidade || null,
      estado: estado || null,
      observacoes: observacoes || null,
    });

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message);
    } else {
      // Limpar form e fechar modal
      setNome(''); setEmail(''); setTelefone(''); setEndereco('');
      setCnpjCpf(''); setCidade(''); setEstado(''); setObservacoes('');
      setShowForm(false);
      fetchClientes(); // Recarregar lista
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
           <p className="text-sm text-muted-foreground">Cadastre clientes e acompanhe seus históricos.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Nome, telefone, endereço..."
              className="pl-10 h-11"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
         </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {loading ? (
           <div className="col-span-full py-20 text-center text-muted-foreground animate-pulse">Carregando clientes...</div>
         ) : clientesFiltrados.length === 0 ? (
           <div className="col-span-full py-20 text-center text-muted-foreground">
             {busca ? 'Nenhum cliente encontrado com esse filtro.' : 'Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.'}
           </div>
         ) : (
           clientesFiltrados.map(cliente => (
             <Link key={cliente.id} href={`/clientes/${cliente.id}`} className="group block">
               <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                     <div className={`p-2 rounded-lg mt-1 shrink-0 ${cliente.email?.includes('@') ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                        {cliente.cnpj_cpf?.includes('/') ? <Building2 size={24} /> : <User size={24} />}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{cliente.nome}</h3>
                       <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                         <Phone size={14} className="mr-1" /> {cliente.telefone || 'Sem telefone'}
                       </div>
                     </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground flex items-center mb-4">
                    <MapPin size={14} className="mr-1 shrink-0" />
                    <span className="line-clamp-1">{cliente.endereco || 'Endereço não cadastrado'}{cliente.cidade ? `, ${cliente.cidade}` : ''}</span>
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

      {/* Modal: Novo Cliente */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold">Novo Cliente</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome completo ou razão social" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefone</label>
                  <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-0000" type="tel" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CPF / CNPJ</label>
                  <Input value={cnpjCpf} onChange={e => setCnpjCpf(e.target.value)} placeholder="000.000.000-00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">E-mail</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="contato@empresa.com.br" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Endereço</label>
                <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, complemento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Cidade</label>
                  <Input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="São Paulo" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <select
                    value={estado}
                    onChange={e => setEstado(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">UF</option>
                    {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Observações</label>
                <textarea
                  className="w-full flex min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o cliente..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
