import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "@/theme/tokens";
import { login } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { AuthLogo } from "@/components/AuthLogo";

const BG = "#18181B";
const CARD = "#27272A";
const BORDER = "#3F3F46";
const TEXT = "#FAFAFA";
const MUTED = "#A1A1AA";
const FAINT = "#71717A";
const BRAND = "#8B5FBF";

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      await setAuth(res.user, res.tokens);
      router.replace("/onboarding");
    } catch (e: any) {
      Alert.alert("Đăng nhập thất bại", e.message ?? "Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <AuthLogo subtitle="Đăng nhập vào tài khoản" />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={FAINT}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            {/* Password */}
            <Text style={[styles.label, { marginTop: 18 }]}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={FAINT}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Login button */}
            <Pressable
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng nhập</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button */}
            <Pressable style={styles.googleButton}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Tiếp tục với Google</Text>
            </Pressable>
          </ScrollView>

          {/* Bottom link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Chưa có tài khoản? </Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.bottomLink}>Đăng ký</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
    marginBottom: 7,
  },
  input: {
    height: 52,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    color: FAINT,
    fontSize: 12,
    marginHorizontal: 14,
  },
  googleButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 16,
    paddingTop: 12,
  },
  bottomText: {
    color: MUTED,
    fontSize: 13,
  },
  bottomLink: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
