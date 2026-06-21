import { useEffect, useRef, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, XCircle, Mail } from "lucide-react-native";
import { verifyEmail, resendVerificationEmail } from "@/api/auth";
import { AuthLogo } from "@/components/AuthLogo";

const BG = "#18181B";
const CARD = "#27272A";
const BORDER = "#3F3F46";
const TEXT = "#FAFAFA";
const MUTED = "#A1A1AA";
const FAINT = "#71717A";
const BRAND = "#8B5FBF";

type VerifyStatus = "idle" | "loading" | "success" | "error";
type ResendStatus = "idle" | "loading" | "sent" | "error";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token, email: emailParam } = useLocalSearchParams<{
    token?: string;
    email?: string;
  }>();

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>(
    token ? "loading" : "idle"
  );
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(emailParam ?? "");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    setVerifyStatus("loading");
    verifyEmail(token)
      .then(() => {
        if (mountedRef.current) setVerifyStatus("success");
      })
      .catch((err: Error & { code?: string }) => {
        if (!mountedRef.current) return;
        setVerifyStatus("error");
        if (err.code === "verification_token_expired") {
          setVerifyError("Link xác minh đã hết hạn. Vui lòng yêu cầu gửi lại.");
        } else {
          setVerifyError(err.message || "Xác minh thất bại. Vui lòng thử lại.");
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend() {
    if (!resendEmail.trim()) return;
    setResendStatus("loading");
    try {
      await resendVerificationEmail(resendEmail.trim());
      if (mountedRef.current) setResendStatus("sent");
    } catch {
      if (mountedRef.current) setResendStatus("error");
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
            <AuthLogo subtitle="Xác minh email" />

            <View style={styles.card}>
              {/* Loading — verifying token */}
              {verifyStatus === "loading" && (
                <>
                  <ActivityIndicator color={BRAND} size="large" style={styles.icon} />
                  <Text style={styles.cardTitle}>Đang xác minh…</Text>
                  <Text style={styles.cardSub}>Vui lòng chờ trong giây lát.</Text>
                </>
              )}

              {/* Success */}
              {verifyStatus === "success" && (
                <>
                  <CheckCircle2 size={52} color="#22c55e" style={styles.icon} />
                  <Text style={styles.cardTitle}>Email đã được xác minh!</Text>
                  <Text style={styles.cardSub}>
                    Tài khoản của bạn đã sẵn sàng. Hãy đăng nhập để tiếp tục.
                  </Text>
                  <Pressable
                    style={[styles.button, { marginTop: 20 }]}
                    onPress={() => router.replace("/(auth)/sign-in")}
                  >
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                  </Pressable>
                </>
              )}

              {/* Error — token invalid/expired */}
              {verifyStatus === "error" && (
                <>
                  <XCircle size={52} color="#ef4444" style={styles.icon} />
                  <Text style={[styles.cardTitle, { color: "#ef4444" }]}>
                    Xác minh thất bại
                  </Text>
                  <Text style={styles.cardSub}>{verifyError}</Text>
                  <ResendForm
                    email={resendEmail}
                    onEmailChange={setResendEmail}
                    status={resendStatus}
                    onResend={handleResend}
                  />
                  <View style={styles.linkRow}>
                    <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
                      <Text style={styles.link}>Về đăng nhập</Text>
                    </Pressable>
                    <Text style={[styles.cardSub, { marginHorizontal: 8 }]}>·</Text>
                    <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
                      <Text style={styles.link}>Tạo tài khoản mới</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {/* Idle — no token, post sign-up state */}
              {verifyStatus === "idle" && (
                <>
                  <Mail size={52} color={BRAND} style={styles.icon} />
                  <Text style={styles.cardTitle}>Kiểm tra email của bạn</Text>
                  <Text style={styles.cardSub}>
                    Chúng tôi đã gửi link xác minh đến email của bạn. Nhấp vào
                    link trong email để kích hoạt tài khoản.
                  </Text>
                  <Text style={[styles.cardSub, { marginTop: 20 }]}>
                    Không nhận được email? Gửi lại bên dưới.
                  </Text>
                  <ResendForm
                    email={resendEmail}
                    onEmailChange={setResendEmail}
                    status={resendStatus}
                    onResend={handleResend}
                  />
                  <Pressable
                    style={styles.outlineButton}
                    onPress={() => router.replace("/(auth)/sign-in")}
                  >
                    <Text style={styles.outlineButtonText}>Về đăng nhập</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ResendForm({
  email,
  onEmailChange,
  status,
  onResend,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  status: ResendStatus;
  onResend: () => void;
}) {
  const disabled = status === "loading" || status === "sent";
  return (
    <View style={{ width: "100%", marginTop: 16, gap: 10 }}>
      <TextInput
        style={[styles.input, disabled && { opacity: 0.6 }]}
        placeholder="Email của bạn"
        placeholderTextColor={FAINT}
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        editable={!disabled}
      />
      {status === "sent" && (
        <Text style={{ color: "#22c55e", fontSize: 13, textAlign: "center" }}>
          Email đã được gửi! Kiểm tra hộp thư của bạn.
        </Text>
      )}
      {status === "error" && (
        <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>
          Gửi thất bại. Vui lòng thử lại.
        </Text>
      )}
      <Pressable
        style={[styles.button, disabled && { opacity: 0.6 }]}
        onPress={onResend}
        disabled={disabled}
      >
        {status === "loading" ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {status === "sent" ? "Đã gửi" : "Gửi lại email xác minh"}
          </Text>
        )}
      </Pressable>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginTop: 24,
  },
  icon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    height: 52,
    backgroundColor: BG,
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
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  outlineButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  outlineButtonText: {
    color: MUTED,
    fontSize: 15,
    fontWeight: "500",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  link: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
