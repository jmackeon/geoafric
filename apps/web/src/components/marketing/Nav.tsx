'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { DownloadAppButton } from '@/components/ui/DownloadAppButton';

const NAV_LINKS = [
  { label: 'Product',      href: '/#features'   },
  { label: 'For Business', href: '/business'    },
  { label: 'Pricing',      href: '/#pricing'    },
  { label: 'About',        href: '/about'       },
];

export function MarketingNav() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    {/* Transparent backdrop — captures outside taps to close mobile menu */}
    {mobileOpen && (
      <div
        className="fixed inset-0 z-40 md:hidden"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
    )}
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-[#080F20] transition-shadow duration-200${
        scrolled ? ' shadow-[0_4px_32px_rgba(0,0,0,0.7)]' : ''
      }`}
      style={{ height: 60 }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <img src="/brand/logo-icon.png" alt="" className="h-8 w-8 object-contain" />
          <img src="/brand/logo-text.png" alt="GeoAfric" className="h-5 w-auto object-contain" />
        </Link>

        {/* Centre links — desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href) && href !== '/#features' && href !== '/#pricing');
            return (
              <a
                key={label}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'font-bold text-green border-b-2 border-green pb-0.5'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Right CTAs — desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <DownloadAppButton variant="header" />
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
          >
            Sign up
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-2 text-white/70 transition-colors hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#080F20] px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
              <DownloadAppButton variant="mobileDrawer" />
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl border border-white/20 py-2.5 text-center text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl bg-gold/90 py-2.5 text-center text-sm font-bold text-[#080F20] hover:bg-gold"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
