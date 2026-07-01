import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/lib/theme';

interface FamilyLoc { user_id: string; }

interface Props {
  position?: { latitude: number; longitude: number } | null;
  myInitials?: string;
  familyLocs: FamilyLoc[];
  geofences?: unknown[];
}

export function LocationMap({ familyLocs }: Props) {
  return (
    <View style={styles.placeholder}>
      <MapPin size={28} color={colors.textLight} />
      <Text style={[typography.body, { fontFamily: 'DMSans-Bold', marginTop: spacing.sm }]}>
        Map view available on mobile
      </Text>
      <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>
        Open the GeoAfric app on iOS or Android to see the live family map.
        {familyLocs.length > 0 ? ` ${familyLocs.length} member(s) currently sharing location.` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, backgroundColor: colors.surfaceAlt, borderRadius: radius.xl,
  },
});
