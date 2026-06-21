import { View, Text, StyleSheet } from "react-native";
import { Eye } from "lucide-react-native";
import { typography } from "@/theme/tokens";

export function AuthLogo({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Eye size={32} color="#4B1F63" strokeWidth={1.8} />
      </View>
      <Text style={[styles.brand, { fontFamily: typography.familyBold }]}>
        ALumiEye
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 32,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8DDD0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FAFAFA",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
    marginTop: 4,
  },
});
