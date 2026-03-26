import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, FileImage } from 'lucide-react';
import Link from 'next/link';
import { SignaturePad } from '@/components/signature/canvas';
import { createClient } from '@/lib/supabase/client';

export default function ExecucaoOS({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [os, setOs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 = Review, 2 = Executing, 3 = Closure
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOS() {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(*), equipamentos(*)')
        .eq('id', params.id)
        .single();
      
      if (data) {
        setOs(data);
        setAmount(data.valor_estimado?.toString() || '0.00');
        if (data.status === 'em_andamento') setStep(2);
        if (data.status === 'concluido') setStep(3);
      }
      setLoading(false);
    }
    fetchOS();
  }, [params.id, supabase]);


  // Form final closure state
  const [amount, setAmount] = useState('350.00');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [photosCount, setPhotosCount] = useState(0);

  const startService = async () => {
    const { error } = await supabase
      .from('ordens_servico')
      .update({ status: 'em_andamento', updated_at: new Date().toISOString() })
      .eq('id', params.id);
    
    if (error) {
      alert("Erro ao iniciar serviço: " + error.message);
    } else {
      setStep(2);
    }
  };

  const initiateClosure = () => {
    setStep(3);
  };

  const finalizeService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      alert("A assinatura do cliente é obrigatória.");
      return;
    }
    
    setLoading(true);

    // Simplificado: Salvando base64 direto para teste
    // Em produção, isso iria para o Storage.
    const { error } = await supabase
      .from('ordens_servico')
      .update({ 
        status: 'concluido', 
        valor_final: parseFloat(amount),
        forma_pagamento: paymentMethod,
        assinatura_url: signature, // Base64 for now
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (error) {
      alert("Erro ao finalizar OS: " + error.message);
    } else {
      alert("OS Finalizada com sucesso!");
      window.location.href = '/ordens';
    }
    setLoading(false);
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ordens" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
           <h2 className="text-2xl font-bold text-foreground">OS #{os?.id?.slice(0,4).toUpperCase()} - Execução</h2>
           <p className="text-sm text-muted-foreground">{os?.tipo_servico?.toUpperCase()} - {os?.clientes?.nome}</p>
        </div>
      </div>

      {loading && <div className="text-center py-20 font-medium">Carregando detalhes da OS...</div>}

      {!loading && !os && <div className="text-center py-20 font-medium text-destructive">Ordem de Serviço não encontrada.</div>}

      {!loading && os && step === 1 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <p className="text-muted-foreground">Cliente</p>
               <p className="font-medium text-foreground">{os.clientes?.nome}</p>
               <p className="text-muted-foreground">{os.clientes?.telefone}</p>
             </div>
             <div>
               <p className="text-muted-foreground">Equipamento</p>
               <p className="font-medium text-foreground">{os.equipamentos?.descricao || 'Não informado'}</p>
               <p className="text-muted-foreground">Local: {os.equipamentos?.localizacao || '---'}</p>
             </div>
           </div>
           
           <div className="bg-secondary/30 p-4 rounded-md text-sm border border-border">
             <p className="font-semibold mb-1">Descrição do Chamado</p>
             <p className="text-muted-foreground">{os.descricao || 'Sem descrição detalhada.'}</p>
           </div>


           <Button size="lg" className="w-full text-lg h-14" onClick={startService}>
             Iniciar Atendimento
           </Button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 text-center py-12">
           <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-4">
             <div className="h-10 w-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
           </div>
           
           <h3 className="text-xl font-bold">Serviço em Andamento</h3>
           <p className="text-muted-foreground">O tempo de execução está sendo contabilizado (iniciado às 14:15).</p>

           <div className="pt-8 max-w-sm mx-auto">
             <Button variant="default" size="lg" className="w-full" onClick={initiateClosure}>
               Ir para Encerramento da OS
             </Button>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
           <div className="mb-6 flex space-x-2 text-sm items-center font-medium">
             <div className="flex items-center text-primary">
               <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">1</span>
               Execução
             </div>
             <div className="h-px bg-border flex-1 mx-2"></div>
             <div className="flex items-center text-foreground">
               <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">2</span>
               Finalização
             </div>
           </div>

           <form onSubmit={finalizeService} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Final do Serviço (R$)</label>
                <Input 
                   type="number" 
                   step="0.01" 
                   value={amount} 
                   onChange={(e) => setAmount(e.target.value)} 
                   required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <select 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                   <option value="">Selecione...</option>
                   <option value="pix">PIX</option>
                   <option value="credit">Cartão de Crédito</option>
                   <option value="debit">Cartão de Débito</option>
                   <option value="cash">Dinheiro</option>
                   <option value="boleto">Boleto a Faturar</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações do Técnico (Opcional)</label>
                <textarea 
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="Relatório do que foi feito, peças trocadas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium">Fotos do Serviço (Opcional)</label>
                 <div className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:bg-secondary/50">
                   <FileImage className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                   <p className="text-sm text-muted-foreground">Clique para adicionar fotos ou tire com a câmera.</p>
                 </div>
              </div>

              <div className="border border-border p-4 rounded-lg bg-secondary/20">
                 <h4 className="font-semibold text-foreground mb-4">Assinatura do Cliente (Obrigatório)</h4>
                 {signature ? (
                   <div className="space-y-4 text-center border bg-white rounded-md p-4">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={signature} alt="Assinatura" className="h-24 mx-auto" />
                     <div className="flex gap-2 justify-center">
                       <span className="text-green-600 flex items-center text-sm font-medium">
                         <CheckCircle2 size={16} className="mr-1" /> Assinatura coletada
                       </span>
                       <button type="button" onClick={() => setSignature(null)} className="text-sm text-red-500 hover:underline">
                         Refazer
                       </button>
                     </div>
                   </div>
                 ) : (
                   <SignaturePad onSave={(base64) => setSignature(base64)} />
                 )}
              </div>

              <div className="pt-4 border-t border-border">
                <Button type="submit" size="lg" className="w-full">
                   Finalizar Ordem de Serviço
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                   A próxima manutenção será agendada automaticamente.
                </p>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}
