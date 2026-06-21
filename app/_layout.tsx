import { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { I18nextProvider } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { initI18n } from "@/i18n";
import i18n from "@/i18n";
import { loadThemePreference } from "@/store/themeStore";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    const root = segments[0];
    if (!root) return;
    const inAuth = root === "(auth)";
    const inOnboarding = root === "onboarding";
    if (!accessToken && !inAuth) {
      router.replace("/(auth)/sign-in");
    } else if (accessToken && inAuth && !inOnboarding) {
      router.replace("/onboarding");
    }
  }, [accessToken, segments, isReady, router]);
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isReady = useAuthStore((s) => s.isReady);
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    hydrate();
    Promise.all([initI18n(), loadThemePreference()]).then(() =>
      setI18nReady(true)
    );
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && isReady && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady, i18nReady]);

  useProtectedRoute();

  if (!fontsLoaded || !isReady || !i18nReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <View style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="position/[id]"
              options={{ presentation: "card" }}
            />
            <Stack.Screen
              name="(more)"
              options={{ presentation: "card" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </View>
    </I18nextProvider>
  );
}
