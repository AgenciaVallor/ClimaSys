'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CalculatorIcon } from 'lucide-react';

export default function NovoOrcamento() {
  const router = useRouter();
  
  // Form State
  const [cliente, setCliente] = useState('');
  const [descricao, setDescricao] = useState('');
  const [metragem, setMetragem] = useState('');
  
  // Result
  const [btuRecomendado, setBtuRecomendado] = useState<number | null>(null);

  const handleCalculateBtu = () => {
    const area = parseFloat(metragem);
    if (!area || area <= 0) {
      alert("Informe uma metragem válida em m²");
      return;
    }
    // Fórmula solicitada: BTU = metragem * 600
    const btu = area * 600;
    setBtuRecomendado(btu);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !descricao || !metragem) {
      alert("Preencha todos os campos do orçamento.");
      return;
    }
    
    // Como é um mock/MVP simples para esta entrega, apenas simula o sucesso
    alert(`Orçamento gerado para ${cliente}!\n\nCapacidade Recomendada: ${btuRecomendado || 'Não calculada'} BTUs`);
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <ArrowLeft size={24} /> Voltar
        </button>
        <div>
           <h2 className="text-2xl font-bold text-foreground">Novo Orçamento Rápido</h2>
           <p className="text-sm text-muted-foreground">Calcule a necessidade térmica e gere orçamento.</p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Cliente</label>
            <Input 
              placeholder="Ex: João Silva ou Condomínio Alfa" 
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição do Serviço (Escopo)</label>
            <textarea 
              className="w-full flex min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="Insira detalhes como localização do condensador, infraestrutura necessária, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium border-b border-primary/10 pb-2">
            <CalculatorIcon size={20} />
            <span>Cálculo de Capacidade (BTU)</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Metragem do Ambiente (m²)</label>
              <Input 
                type="number" 
                step="0.1"
                placeholder="Ex: 25" 
                value={metragem}
                onChange={(e) => setMetragem(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="secondary" className="w-full" onClick={handleCalculateBtu}>
                 Calcular BTU
              </Button>
            </div>
          </div>

          {btuRecomendado !== null && (
            <div className="mt-4 p-4 bg-background border border-border rounded-md text-center">
              <p className="text-sm text-muted-foreground mb-1">Capacidade Sugerida (600 BTU/m²)</p>
              <p className="text-2xl font-bold text-primary">{btuRecomendado.toLocaleString()} BTUs</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
             Salvar Orçamento
          </Button>
        </div>

      </form>
    </div>
  );
}
