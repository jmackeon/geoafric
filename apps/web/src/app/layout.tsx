import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TranslationProvider } from '@/i18n/TranslationProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'GeoAfric — Tracking. Health. Discovery. Security.',
  description: 'Real-time family tracking, health monitoring, and place discovery built for Africa.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'GeoAfric',
    description: 'Real-time family tracking, health monitoring, and place discovery built for Africa.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080F20',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — loaded here to avoid CSS @import hydration issues */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TranslationProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#080F20',
                  color: '#fff',
                  border: '1px solid rgba(245,166,35,0.3)',
                  borderRadius: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#00B67A', secondary: '#080F20' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#080F20' },
                },
              }}
            />
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}