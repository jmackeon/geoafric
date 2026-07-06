import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';
  const isAppSubdomain = hostname === 'app.geoafric.com';

  // ── app.geoafric.com subdomain routing ──────────────────────────────────
  // Root path → send to login; auth/* and dashboard/* fall through below
  if (isAppSubdomain && pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Skip Supabase auth overhead for non-protected routes (marketing pages, auth pages)
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
  if (!isProtected) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check onboarding for dashboard routes
  if (user && pathname.startsWith('/dashboard')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single();

      if (profile && !profile.onboarded) {
        const onboardUrl = request.nextUrl.clone();
        onboardUrl.pathname = '/onboarding';
        return NextResponse.redirect(onboardUrl);
      }
    } catch {
      // allow through if check fails
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/onboarding/:path*'],
};