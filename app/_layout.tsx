import { useEffect } from "react";
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
import { useAuthStore } from "@/store/authStore";

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
    if (!accessToken && !inAuth) {
      router.replace("/(auth)/sign-in");
    } else if (accessToken && inAuth) {
      router.replace("/(tabs)");
    }
  }, [accessToken, segments, isReady, router]);
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isReady = useAuthStore((s) => s.isReady);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  useProtectedRoute();

  if (!fontsLoaded || !isReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
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
  );
}
