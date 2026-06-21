import { View, Text, Pressable, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

type Props = {
  title?: string;
  hint?: string;
};

export function AccessDeniedState({
  title = "Tính năng bị khóa",
  hint = "Nâng cấp gói của bạn để truy cập tính năng này.",
}: Props) {
  const c = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${c.brand}18` }]}>
        <Lock size={22} color={c.brand} strokeWidth={2} />
      </View>
      <Text
        style={[styles.title, { color: c.textPrimary, fontFamily: typography.familySemiBold }]}
      >
        {title}
      </Text>
      <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text>
      <Pressable style={[styles.button, { backgroundColor: c.brand }]}>
        <Text style={styles.buttonText}>Nâng cấp ngay</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 260,
  },
  button: {
    height: 40,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
