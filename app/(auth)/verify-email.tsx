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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          setVerifyError(t("verifyEmail.expiredError"));
        } else {
          setVerifyError(err.message || t("verifyEmail.genericError"));
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
            <AuthLogo subtitle={t("verifyEmail.subtitle")} />

            <View style={styles.card}>
              {verifyStatus === "loading" && (
                <>
                  <ActivityIndicator color={BRAND} size="large" style={styles.icon} />
                  <Text style={styles.cardTitle}>{t("verifyEmail.loadingTitle")}</Text>
                  <Text style={styles.cardSub}>{t("verifyEmail.loadingDesc")}</Text>
                </>
              )}

              {verifyStatus === "success" && (
                <>
                  <CheckCircle2 size={52} color="#22c55e" style={styles.icon} />
                  <Text style={styles.cardTitle}>{t("verifyEmail.successTitle")}</Text>
                  <Text style={styles.cardSub}>{t("verifyEmail.successDesc")}</Text>
                  <Pressable
                    style={[styles.button, { marginTop: 20 }]}
                    onPress={() => router.replace("/(auth)/sign-in")}
                  >
                    <Text style={styles.buttonText}>{t("verifyEmail.signIn")}</Text>
                  </Pressable>
                </>
              )}

              {verifyStatus === "error" && (
                <>
                  <XCircle size={52} color="#ef4444" style={styles.icon} />
                  <Text style={[styles.cardTitle, { color: "#ef4444" }]}>
                    {t("verifyEmail.failedTitle")}
                  </Text>
                  <Text style={styles.cardSub}>{verifyError}</Text>
                  <ResendForm
                    email={resendEmail}
                    onEmailChange={setResendEmail}
                    status={resendStatus}
                    onResend={handleResend}
                    t={t}
                  />
                  <View style={styles.linkRow}>
                    <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
                      <Text style={styles.link}>{t("verifyEmail.backToSignIn")}</Text>
                    </Pressable>
                    <Text style={[styles.cardSub, { marginHorizontal: 8 }]}>·</Text>
                    <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
                      <Text style={styles.link}>{t("verifyEmail.createAccount")}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {verifyStatus === "idle" && (
                <>
                  <Mail size={52} color={BRAND} style={styles.icon} />
                  <Text style={styles.cardTitle}>{t("verifyEmail.checkEmailTitle")}</Text>
                  <Text style={styles.cardSub}>{t("verifyEmail.checkEmailDesc")}</Text>
                  <Text style={[styles.cardSub, { marginTop: 20 }]}>
                    {t("verifyEmail.noEmailHint")}
                  </Text>
                  <ResendForm
                    email={resendEmail}
                    onEmailChange={setResendEmail}
                    status={resendStatus}
                    onResend={handleResend}
                    t={t}
                  />
                  <Pressable
                    style={styles.outlineButton}
                    onPress={() => router.replace("/(auth)/sign-in")}
                  >
                    <Text style={styles.outlineButtonText}>{t("verifyEmail.backToSignIn")}</Text>
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
  t,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  status: ResendStatus;
  onResend: () => void;
  t: (key: string) => string;
}) {
  const disabled = status === "loading" || status === "sent";
  return (
    <View style={{ width: "100%", marginTop: 16, gap: 10 }}>
      <TextInput
        style={[styles.input, disabled && { opacity: 0.6 }]}
        placeholder={t("verifyEmail.emailPlaceholder")}
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
          {t("verifyEmail.sentMsg")}
        </Text>
      )}
      {status === "error" && (
        <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>
          {t("verifyEmail.sendError")}
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
            {status === "sent" ? t("verifyEmail.resendSent") : t("verifyEmail.resendBtn")}
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
