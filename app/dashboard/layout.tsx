'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Wrench, 
  Users, 
  Briefcase, 
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Ordens (OS)', href: '/ordens', icon: Wrench },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Módulo Financeiro', href: '/financeiro', icon: Briefcase },
  { name: 'Equipe', href: '/equipe', icon: Users },
  { name: 'Alertas', href: '/alertas', icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-full">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">ClimaSys</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-2 text-muted-foreground hover:text-destructive transition-colors rounded-md"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border shadow-sm shrink-0">
          <div className="md:hidden">
            <h1 className="text-xl font-bold text-primary">ClimaSys</h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground relative">
              <Bell size={20} />
              {/* Fake notification dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            </button>
            <Link href="/configuracoes" className="text-muted-foreground hover:text-foreground">
              <Settings size={20} />
            </Link>
            <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center border border-border">
              <span className="text-sm font-medium">AD</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* BOTTOM NAVIGATION (Mobile) */}
        <nav className="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50">
           {menuItems.slice(0,4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              );
           })}
           {/* Mobile menu could be a drawer, keeping as OS/Menu hybrid for now */}
           <button 
              onClick={() => {/* Open Mobile Menu Drawer here later */}}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground"
            >
              <div className="w-5 h-5 flex flex-col justify-between items-center py-[2px]">
                <div className="w-4 h-[2px] bg-current rounded-full" />
                <div className="w-4 h-[2px] bg-current rounded-full" />
                <div className="w-4 h-[2px] bg-current rounded-full" />
              </div>
              <span className="text-[10px] font-medium">Mais</span>
           </button>
        </nav>
      </div>
    </div>
  );
}
