export const LOCALES = ['en', 'fr', 'tw', 'ha', 'yo', 'sw', 'am', 'ar'] as const;
export type Locale = typeof LOCALES[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  tw: 'Twi',
  ha: 'Hausa',
  yo: 'Yorùbá',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  ar: 'العربية',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧', fr: '🇫🇷', tw: '🇬🇭', ha: '🇳🇬',
  yo: '🇳🇬', sw: '🇰🇪', am: '🇪🇹', ar: '🇸🇦',
};

export const RTL_LOCALES: Locale[] = ['ar'];

export const I18N_STRINGS: Record<Locale, {
  downloadApp: string;
  getApp: string;
  androidApkNotice: string;
  registrationSuccess: string;
  registrationSuccessDesc: string;
  continueToDashboard: string;
}> = {
  en: {
    downloadApp: 'Download App',
    getApp: 'Get the App',
    androidApkNotice: 'Android APK · iOS coming soon',
    registrationSuccess: 'Registration successful',
    registrationSuccessDesc: 'Welcome to GeoAfric! Your account has been created.',
    continueToDashboard: 'Continue to Dashboard',
  },
  fr: {
    downloadApp: "Télécharger l'application",
    getApp: "Obtenir l'application",
    androidApkNotice: 'APK Android · iOS bientôt disponible',
    registrationSuccess: 'Inscription réussie',
    registrationSuccessDesc: 'Bienvenue sur GeoAfric ! Votre compte a été créé.',
    continueToDashboard: 'Continuer vers le tableau de bord',
  },
  tw: {
    downloadApp: 'Twe App No',
    getApp: 'Nya App No',
    androidApkNotice: 'Android APK · iOS reba anɔpa',
    registrationSuccess: 'Akaunti no ayɛ yie',
    registrationSuccessDesc: 'Akwaaba baa GeoAfric! Wo akaunti no abue.',
    continueToDashboard: 'Toa so kɔ Dashboard',
  },
  ha: {
    downloadApp: 'Sauke Manhaja',
    getApp: 'Sami Manhaja',
    androidApkNotice: 'Android APK · iOS na nan tafe',
    registrationSuccess: 'An yi rajista cikin nasara',
    registrationSuccessDesc: 'Barka da zuwa GeoAfric! An ƙirƙiri asusunka.',
    continueToDashboard: 'Ci gaba zuwa Dashboard',
  },
  yo: {
    downloadApp: 'Gba Ohun Èlò',
    getApp: 'Gba Ohun Èlò',
    androidApkNotice: 'Android APK · iOS ń bọ̀ láìpẹ́',
    registrationSuccess: 'Ìforúkọsílẹ̀ ti yọrí sí rere',
    registrationSuccessDesc: 'Ẹ káàbọ̀ sí GeoAfric! A ti ṣẹ̀dá àkọọ́lẹ̀ rẹ.',
    continueToDashboard: 'Tẹ̀síwájú sí Dashboard',
  },
  sw: {
    downloadApp: 'Pakua Programu',
    getApp: 'Pata Programu',
    androidApkNotice: 'Android APK · iOS inakuja hivi karibuni',
    registrationSuccess: 'Usajili umefaulu',
    registrationSuccessDesc: 'Karibu GeoAfric! Akaunti yako imeundwa.',
    continueToDashboard: 'Endelea kwenye Dashibodi',
  },
  am: {
    downloadApp: 'መተግበሪያውን ያውርዱ',
    getApp: 'መተግበሪያውን ያግኙ',
    androidApkNotice: 'አንድሮይድ ኤፒኬ · የiOS በቅርቡ ይመጣል',
    registrationSuccess: 'ምዝገባ በተሳካ ሁኔታ ተጠናቋል',
    registrationSuccessDesc: 'እንኳን ወደ GeoAfric በደህና መጡ! መለያዎ ተፈጥሯል።',
    continueToDashboard: 'ወደ ዳሽቦርድ ቀጥል',
  },
  ar: {
    downloadApp: 'تحميل التطبيق',
    getApp: 'احصل على التطبيق',
    androidApkNotice: 'تطبيق أندرويد APK · نسخة iOS قريباً',
    registrationSuccess: 'تم التسجيل بنجاح',
    registrationSuccessDesc: 'مرحباً بك في GeoAfric! تم إنشاء حسابك بنجاح.',
    continueToDashboard: 'المتابعة إلى لوحة التحكم',
  },
};
