import type { Metadata } from 'next';
import { MarketingNav } from '@/components/marketing/Nav';

export const metadata: Metadata = {
  title: 'GeoAfric — Family Safety, Health & Place Discovery',
  description:
    'GeoAfric connects family safety, health monitoring, and business intelligence on one AI-powered platform — built for African realities.',
  openGraph: {
    title: 'GeoAfric — Family Safety, Health & Place Discovery',
    description:
      'GeoAfric connects family safety, health monitoring, and business intelligence on one AI-powered platform — built for African realities.',
    images: [{ url: '/brand/logo-icon.png', width: 512, height: 512, alt: 'GeoAfric' }],
    type: 'website',
  },
  twitter: {
    card:        'summary',
    title:       'GeoAfric',
    description: 'Family safety, health monitoring, and place discovery — built for Africa.',
    images:      ['/brand/logo-icon.png'],
  },
};

const FOOTER = {
  product: [
    { label: 'Family safety',     href: '#features'    },
    { label: 'Health monitoring', href: '#features'    },
    { label: 'Place discovery',   href: '#features'    },
    { label: 'Pricing',           href: '#pricing'     },
  ],
  business: [
    { label: 'Enterprise',   href: '/enterprise'  },
    { label: 'Logistics',    href: '/logistics'   },
    { label: 'Reach',        href: '/reach'       },
    { label: 'Hospitality',  href: '/hospitality' },
  ],
  company: [
    { label: 'About',            href: '/about'          },
    { label: 'Contact',          href: '/contact'        },
    { label: 'Privacy policy',   href: '/legal/privacy'  },
    { label: 'Terms of service', href: '/legal/terms'    },
  ],
};

function MarketingFooter() {
  return (
    <footer className="bg-[#080F20] px-6 pb-10 pt-16">
      <div className="mx-auto max-w-7xl">

        {/* Four columns */}
        <div className="mb-14 grid grid-cols-2 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img src="/brand/logo-icon.png" alt="" className="h-9 w-9 object-contain" />
              <img src="/brand/logo-text.png" alt="GeoAfric" className="h-5 w-auto object-contain" />
            </div>
            <p className="max-w-[200px] text-sm leading-relaxed text-white/40">
              Connecting people. Protecting what matters.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Product</p>
            <ul className="space-y-3">
              {FOOTER.product.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/50 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">For Business</p>
            <ul className="space-y-3">
              {FOOTER.business.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/50 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/30">Company</p>
            <ul className="space-y-3">
              {FOOTER.company.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/50 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} GeoAfric. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            A product of{' '}
            <a
              href="https://alphaztechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 transition-colors hover:text-white"
            >
              Alpha-Z Technologies
            </a>
            {' · '}Abuja, Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <main className="pt-[60px]">{children}</main>
      <MarketingFooter />
    </>
  );
}
