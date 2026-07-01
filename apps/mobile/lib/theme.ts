import { StyleSheet } from 'react-native';
import { BRAND } from '@geoafric/shared';

export const colors = {
  ...BRAND,
  white: '#FFFFFF',
  black: '#000000',
  text:        '#0D1B3D',
  textMuted:   '#6B7280',
  textLight:   '#9CA3AF',
  border:      '#E8EBF3',
  cardBg:      '#FFFFFF',
  surfaceAlt:  '#FAFBFD',
  danger:      '#EF4444',
  success:     '#00B67A',
  warning:     '#F5A623',
};

export const spacing = {
  xs:  4,  sm:  8,  md: 12,
  lg: 16,  xl: 20,  '2xl': 24,
  '3xl': 32, '4xl': 40,
};

export const radius = {
  sm:  8,  md: 12,  lg: 16,
  xl: 20, '2xl': 24, full: 999,
};

export const typography = StyleSheet.create({
  display: {
    fontFamily: 'Sora-Black',
    fontSize: 32,
    letterSpacing: -1,
    color: colors.text,
  },
  h1: {
    fontFamily: 'Sora-ExtraBold',
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h2: {
    fontFamily: 'Sora-Bold',
    fontSize: 18,
    color: colors.text,
  },
  h3: {
    fontFamily: 'Sora-Bold',
    fontSize: 15,
    color: colors.text,
  },
  body: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: colors.text,
  },
  bodyMuted: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  caption: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.textLight,
  },
  button: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  overline: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
});

export const shadows = {
  sm: {
    shadowColor: '#0D1B3D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  md: {
    shadowColor: '#0D1B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  lg: {
    shadowColor: '#0D1B3D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
  },
};
