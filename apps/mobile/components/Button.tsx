import { ActivityIndicator, Pressable, Text, View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '@/lib/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label, onPress, variant = 'primary', loading, disabled,
  icon, fullWidth, style,
}: ButtonProps) {
  const isPrimary   = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost     = variant === 'ghost';
  const isDanger    = variant === 'danger';

  const content = (
    <View style={[styles.inner, fullWidth && { width: '100%' }]}>
      {loading
        ? <ActivityIndicator color={isPrimary ? colors.navy : colors.white} />
        : <>
            {icon}
            <Text style={[
              typography.button,
              { color: isPrimary ? colors.navy : isGhost ? colors.text : colors.white }
            ]}>{label}</Text>
          </>}
    </View>
  );

  if (isPrimary) {
    return (
      <Pressable onPress={onPress} disabled={loading || disabled} style={[
        styles.base, fullWidth && { width: '100%' }, style,
        (loading || disabled) && { opacity: 0.6 }
      ]}>
        <LinearGradient
          colors={[colors.gold, '#E8960A']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.gradient, fullWidth && { width: '100%' }]}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={loading || disabled} style={[
      styles.base, styles.solid, fullWidth && { width: '100%' },
      isSecondary && { backgroundColor: colors.blue },
      isGhost     && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
      isDanger    && { backgroundColor: colors.danger },
      (loading || disabled) && { opacity: 0.6 },
      style,
    ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
  },
  solid: {
    paddingVertical: 14,
    paddingHorizontal: spacing['2xl'],
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
