import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { useAuthStore } from '@geoafric/shared';
import { colors, spacing, typography } from '@/lib/theme';

export default function Index() {
  const { isLoading } = useAuthStore();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={[typography.h1, { color: colors.white, marginTop: spacing.lg }]}>GeoAfric</Text>
      <Text style={[typography.bodyMuted, { color: colors.teal, marginTop: spacing.xs }]}>
        Connecting people, protecting what matters
      </Text>
      {isLoading && <ActivityIndicator size="small" color={colors.gold} style={{ marginTop: spacing['2xl'] }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
  },
  logo: {
    width: 96,
    height: 96,
  },
});
