import { useState } from 'react';
import { Text, TextInput, TextInputProps, View, StyleSheet, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, icon, isPassword, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [show, setShow]       = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.gold : colors.border;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label && (
        <Text style={[typography.caption, { color: colors.text, fontFamily: 'DMSans-Bold', marginBottom: 6 }]}>
          {label}
        </Text>
      )}
      <View style={[styles.row, { borderColor }]}>
        {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
        <TextInput
          {...rest}
          secureTextEntry={isPassword && !show}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e)  => { setFocused(false); rest.onBlur?.(e); }}
          placeholderTextColor={colors.textLight}
          style={[styles.input, typography.body]}
        />
        {isPassword && (
          <Pressable onPress={() => setShow(s => !s)} hitSlop={8}>
            {show
              ? <EyeOff size={18} color={colors.textMuted} />
              : <Eye    size={18} color={colors.textMuted} />}
          </Pressable>
        )}
      </View>
      {error && <Text style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.text,
  },
});
