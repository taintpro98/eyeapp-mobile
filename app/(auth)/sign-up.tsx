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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "@/api/auth";
import { AuthLogo } from "@/components/AuthLogo";

const BG = "#18181B";
const CARD = "#27272A";
const BORDER = "#3F3F46";
const TEXT = "#FAFAFA";
const MUTED = "#A1A1AA";
const FAINT = "#71717A";
const BRAND = "#8B5FBF";

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !name.trim() || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      await register({
        display_name: name.trim(),
        email: email.trim(),
        password,
      });
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: email.trim() },
      });
    } catch (e: any) {
      Alert.alert("Đăng ký thất bại", e.message ?? "Vui lòng thử lại");
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
            <AuthLogo subtitle="Tạo tài khoản" />

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

            {/* Display name */}
            <Text style={[styles.label, { marginTop: 18 }]}>Tên hiển thị</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={FAINT}
              value={name}
              onChangeText={setName}
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

            {/* Confirm password */}
            <Text style={[styles.label, { marginTop: 18 }]}>
              Xác nhận mật khẩu
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={FAINT}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Register button */}
            <Pressable
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
              )}
            </Pressable>
          </ScrollView>

          {/* Bottom link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Đã có tài khoản? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.bottomLink}>Đăng nhập</Text>
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
