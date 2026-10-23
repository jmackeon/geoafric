import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? '';
  const isAppSubdomain = hostname === 'app.geoafric.com';

  // Exclude public downloads, static files, and marketing routes immediately
  if (pathname.startsWith('/downloads')) {
    return NextResponse.next();
  }

  // ── app.geoafric.com subdomain routing ──────────────────────────────────
  if (isAppSubdomain && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/register';

  if (!isProtected && !isAuthRoute) {
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

  if (user) {
    let onboarded = false;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle();
      onboarded = !!profile?.onboarded;
    } catch {
      // If error fetching profile, allow through to avoid false lockouts
      onboarded = true;
    }

    if (isAuthRoute) {
      if (pathname === '/auth/login' && request.nextUrl.searchParams.get('error') === 'not_registered') {
        return supabaseResponse;
      }
      return NextResponse.redirect(new URL(onboarded ? '/dashboard' : '/onboarding', request.url));
    }

    if (pathname.startsWith('/dashboard') && !onboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    if (pathname === '/onboarding' && onboarded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/onboarding/:path*'],
};