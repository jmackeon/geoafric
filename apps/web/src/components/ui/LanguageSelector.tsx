'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import { type Locale } from '@/i18n/config';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇬🇧', fr: '🇫🇷', tw: '🇬🇭', ha: '🇳🇬',
  yo: '🇳🇬', sw: '🇰🇪', am: '🇪🇹', ar: '🇸🇦',
};

export function LanguageSelector() {
  const { user } = useAuthStore();
  const { setLocale, locale: selected, LOCALES, LOCALE_NAMES, t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const handleSelect = async (locale: Locale) => {
    if (locale === selected) return;
    setSaving(true);

    try {
      // Save to profile in Supabase
      await usersApi.updateProfile({ language: locale });
      toast.success(`Language changed to ${LOCALE_NAMES[locale]}`);

      setLocale(locale);
      setSaving(false);
    } catch {
      toast.error('Failed to save language preference.');
      setSaving(false);
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600',
        color: '#0D1B3D', marginBottom: '10px' }}>
        {t('settings.language')}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {LOCALES.map((locale) => {
          const isSelected = locale === selected;
          return (
            <button
              key={locale}
              onClick={() => handleSelect(locale)}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? '#00B67A' : '#E5E7EB'}`,
                background: isSelected ? '#F0FDF4' : 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
                opacity: saving && !isSelected ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: '20px' }}>{LANGUAGE_FLAGS[locale]}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: '700',
                  color: isSelected ? '#065F46' : '#0D1B3D', margin: 0 }}>
                  {LOCALE_NAMES[locale]}
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0,
                  fontFamily: locale === 'am' ? 'serif' : 'inherit' }}>
                  {locale.toUpperCase()}
                </p>
              </div>
              {isSelected && (
                saving
                  ? <Loader2 style={{ width: '16px', height: '16px', color: '#00B67A',
                      animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  : <CheckCircle2 style={{ width: '16px', height: '16px',
                      color: '#00B67A', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
        background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <p style={{ fontSize: '12px', color: '#1D4ED8', margin: 0 }}>
          💡 Selecting a language will reload the app with the full UI translated.
          Arabic switches the layout to right-to-left automatically.
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
