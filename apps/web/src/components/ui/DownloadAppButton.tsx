'use client';

import { useTranslation } from '@/i18n/TranslationProvider';
import { Download, Smartphone } from 'lucide-react';
import React from 'react';

interface DownloadAppButtonProps {
  variant?: 'primary' | 'header' | 'footer' | 'mobileDrawer' | 'outline';
  className?: string;
  label?: string;
  showNotice?: boolean;
}

const DEFAULT_APK_URL =
  'https://expo.dev/artifacts/eas/vralxWg324YtcJoP86z299FLb7vRTqZki05Qsm6gdYE.apk';

export function DownloadAppButton({
  variant = 'primary',
  className = '',
  label,
  showNotice = true,
}: DownloadAppButtonProps) {
  const { t } = useTranslation();

  const apkUrl = process.env.NEXT_PUBLIC_APK_URL || DEFAULT_APK_URL;
  const isExternal = apkUrl.startsWith('http');
  const buttonText = label || t('common.downloadApp');
  const noticeText = t('common.androidApkNotice');

  // Dynamic styling based on variant
  let baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all';
  
  if (variant === 'primary') {
    baseStyles += ' rounded-xl bg-gold px-8 py-4 text-sm text-[#080F20] hover:opacity-90 shadow-glow-gold';
  } else if (variant === 'header') {
    baseStyles += ' rounded-xl bg-green px-5 py-2 text-sm text-white hover:opacity-90';
  } else if (variant === 'mobileDrawer') {
    baseStyles += ' w-full rounded-xl bg-green px-4 py-3 text-center text-sm text-white';
  } else if (variant === 'outline') {
    baseStyles += ' rounded-xl border border-white/20 px-8 py-4 text-sm text-white hover:border-white/40 hover:bg-white/5';
  } else if (variant === 'footer') {
    baseStyles += ' text-sm text-white/50 hover:text-white';
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <a
        href={apkUrl}
        download="geoafric.apk"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`${baseStyles} ${className}`.trim()}
        aria-label={buttonText}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{buttonText}</span>
      </a>

      {showNotice && variant !== 'header' && variant !== 'footer' && variant !== 'mobileDrawer' && (
        <span className="flex items-center gap-1.5 text-[11px] text-white/40">
          <Smartphone className="h-3 w-3 shrink-0 text-green" />
          <span>{noticeText}</span>
        </span>
      )}
    </div>
  );
}
