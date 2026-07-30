'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
          <a
            href="https://app.geoafric.com/auth/login"
            className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Sign in
          </a>
          <a
            href="https://app.geoafric.com/auth/register"
            className="rounded-xl bg-green px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Get started
          </a>
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
              <a
                href="https://app.geoafric.com/auth/login"
                className="text-sm font-semibold text-white/80 hover:text-white"
              >
                Sign in
              </a>
              <a
                href="https://app.geoafric.com/auth/register"
                className="rounded-xl bg-green px-4 py-3 text-center text-sm font-bold text-white"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
