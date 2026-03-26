import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se o usuário não está logado e tentando acessar uma rota protegida (ex: /dashboard)
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Se o usuário está logado e tenta acessar rotas de auth (login, register)
  if (session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Verificar se o usuário já completou o onboarding (se tem um perfil e uma empresa)
  if (session && req.nextUrl.pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('id', session.user.id)
      .single()

    // Se o perfil não existe ou não tem empresa_id, redirecione para onboarding
    if (!profile || !profile.empresa_id) {
       // Permite acessar a API ou assets sem redirecionar em loop
       if (!req.nextUrl.pathname.startsWith('/api') && 
           !req.nextUrl.pathname.startsWith('/_next') &&
           !req.nextUrl.pathname.includes('.')) {
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = '/onboarding'
          return NextResponse.redirect(redirectUrl)
       }
    }
  }

  return res
}

// Configurar matcher para o middleware rodar nas rotas principais
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
