'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useAuthStore } from '@/lib/store/auth.store';

interface RegistrationSuccessModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  continuePath?: string;
}

export function RegistrationSuccessModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  continuePath = '/onboarding',
}: RegistrationSuccessModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const storeIsOpen = useAuthStore((s) => s.registrationSuccessModal);
  const setStoreIsOpen = useAuthStore((s) => s.setRegistrationSuccessModal);

  const isVisible = propIsOpen !== undefined ? propIsOpen : storeIsOpen;

  if (!isVisible) return null;

  const handleContinue = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setStoreIsOpen(false);
    }
    router.push(continuePath);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 15, 32, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          textAlign: 'center',
          animation: 'popIn 0.25s ease-out',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(0, 182, 122, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 style={{ width: '40px', height: '40px', color: '#00B67A' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#080F20',
            margin: '0 0 10px',
            fontFamily: 'Sora, sans-serif',
          }}
        >
          {t('common.registrationSuccess')}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '14px',
            color: '#4B5563',
            lineHeight: 1.6,
            margin: '0 0 28px',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('common.registrationSuccessDesc')}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '14px',
            background: '#F5A623',
            color: '#080F20',
            border: 'none',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
            transition: 'all 0.2s',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#E0961B')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#F5A623')}
        >
          <span>{t('common.continueToDashboard')}</span>
          <ArrowRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
}
