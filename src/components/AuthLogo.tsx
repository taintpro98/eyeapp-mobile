import { View, Text, Image, StyleSheet } from "react-native";
import { typography } from "@/theme/tokens";

export function AuthLogo({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 100, height: 100 }}
          resizeMode="cover"
        />
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
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
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
