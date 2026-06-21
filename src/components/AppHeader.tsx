import { View, Text, StyleSheet, Pressable } from "react-native";
import { Bell } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const c = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const initial = user?.display_name?.charAt(0).toUpperCase() ?? "U";

  return (
    <View style={styles.bar}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>A</Text>
      </View>
      <Text
        style={[
          styles.logoText,
          { color: c.textPrimary, fontFamily: typography.familySemiBold },
        ]}
      >
        ALumiEye
      </Text>
      <View style={{ flex: 1 }} />
      <Pressable style={styles.bellBtn}>
        <Bell size={20} color={c.textMuted} />
      </Pressable>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{initial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6F2C91",
  },
  logoLetter: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "600",
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#6F2C91",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
