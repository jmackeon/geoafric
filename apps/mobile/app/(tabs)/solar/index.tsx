import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function Screen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: '#F5A62320' }]}>
          <Zap size={32} color="#F5A623" />
        </View>
        <Text style={[typography.h1, { marginTop: spacing.lg, textAlign: 'center' }]}>SolarTrack</Text>
        <Text style={[typography.bodyMuted, { textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl }]}>
          Smart solar monitoring — connect your SolarTrack hardware to get started
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: {
    width: 72, height: 72, borderRadius: radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
});
