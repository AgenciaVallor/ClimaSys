import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white selection:bg-primary/30 antialiased overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-40" />
      
      {/* Navbar Container */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">ClimaSys</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hover:bg-white/5">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link href="/register">Começar Grátis</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          O futuro da gestão HVAC chegou
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Gestão inteligente para sua <br /> empresa de climatização.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Controle ordens de serviço, calcule BTUs instantaneamente e gerencie sua equipe de campo 
          em uma plataforma unificada e potente.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button size="lg" asChild className="w-full sm:w-48 h-12 text-base font-semibold transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/25">
            <Link href="/register">Criar Conta Agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-48 h-12 text-base font-semibold border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
            <Link href="/login">Ver Painel</Link>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full">
           <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Calculadora BTU</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Cálculos precisos baseados em normas técnicas em segundos.</p>
           </div>
           
           <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Dashboard Real-time</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Acompanhe faturamento, serviços e produtividade da equipe.</p>
           </div>

           <div className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">Gestão de Equipe</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Distribua serviços e monitore técnicos em campo com facilidade.</p>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 px-6 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-60">
            <ShieldCheck size={20} />
            <p className="text-sm">© 2026 ClimaSys. Todos os direitos reservados.</p>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            Powered by Agencia Vallor
          </p>
        </div>
      </footer>
    </div>
  );
}

