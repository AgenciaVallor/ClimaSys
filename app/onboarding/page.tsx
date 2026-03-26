'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Verifica se já tem empresa
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.company_id) {
        // Já tem onboarding concluído
        router.push('/dashboard');
      }
      setChecking(false);
    };
    checkUser();
  }, [router, supabase]);

  const slugify = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // 1. Criar empresa
    const slug = slugify(companyName) || Date.now().toString();
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{ name: companyName, slug }])
      .select()
      .single();

    if (companyError) {
      setError('Erro ao criar empresa. Nome pode já estar em uso.');
      setLoading(false);
      return;
    }

    // 2. Criar perfil de admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: session.user.id,
        company_id: company.id,
        name: userName,
        role: 'admin',
        phone: phone
      }]);

    if (profileError) {
      setError('Erro ao criar perfil de usuário.');
      setLoading(false);
      return;
    }

    // Sucesso, vai pro dashboard
    router.push('/dashboard');
    router.refresh();
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-card rounded-xl border border-border shadow-lg antialiased">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao ClimaSys</h1>
          <p className="text-sm text-muted-foreground mt-2">Vamos configurar o ambiente da sua empresa.</p>
        </div>

        <form onSubmit={handleOnboarding} className="space-y-4">
          <div className="space-y-4 border-b border-border pb-4">
            <h2 className="text-lg font-semibold text-primary">Sua Empresa</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Ex: Ar Frio Climatização"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-semibold text-primary">Seu Perfil (Admin)</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Seu Nome Completo</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'Configurando...' : 'Concluir Configuração'}
          </button>
        </form>
      </div>
    </div>
  );
}
