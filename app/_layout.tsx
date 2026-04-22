import { AuthProvider, useAuth } from "@/Contexts/AuthContexts";
import * as Linking from "expo-linking";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
import { AddressProvider } from "../Contexts/AddressContext";
import { CartProvider } from "../Contexts/CartContext";
import {
  ExperienceProvider,
  useExperience,
} from "../Contexts/ExperienceContext";
import { SearchProvider } from "../Contexts/SearchContext";
import { UserProvider } from "../Contexts/UserContext";

function AppNavigator() {
  const { experience } = useExperience();
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathaname = usePathname();

  console.log(
    "AppNavigator - experience:",
    experience,
    "isLoggedIn:",
    isLoggedIn,
    "loading:",
    loading
  );

  // Handle deep linking for invitation URLs
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log("Deep link received:", url);

      // Check if it's an invitation URL
      if (url.includes("accept-invitation")) {
        const tokenMatch = url.match(/[?&]token=([^&]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          console.log("Invitation token found:", token);

          // Navigate to accept-invitation screen with token
          router.push(`/accept-invitation?token=${token}`);
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming links when app is already running
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, [router]);

  useEffect(() => {
    console.log("pathname", pathaname);
  }, [pathaname]);

  if (loading) return <SplashScreen />;

  if (experience === "finsangmart") {
    console.log("Rendering Finsang Pro experience");
    return (
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2f2f2f",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShown: false,
        }}
      >
        <Stack.Screen name="finsangMartTabs" options={{ headerShown: false }} />
        <Stack.Screen
          name="finsangMartPages"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="accept-invitation"
          options={{ headerShown: false }}
        />
      </Stack>
    );
  }

  console.log("Rendering main experience");
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2f2f2f",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      {!isLoggedIn
        ? [
            <Stack.Screen
              key="index"
              name="index"
              options={{ headerShown: false }}
            />,
            <Stack.Screen
              key="login"
              name="Login/login"
              options={{ title: "Login", headerTitleAlign: "center" }}
            />,
            <Stack.Screen
              key="accept-invitation"
              name="accept-invitation"
              options={{ headerShown: false }}
            />,
          ]
        : [
            <Stack.Screen
              key="tabs"
              name="(tabs)"
              options={{ headerShown: false }}
            />,
            <Stack.Screen
              key="profile"
              name="(tabs)/profile"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                headerShown: false,
              }}
            />,
            <Stack.Screen
              key="accept-invitation"
              name="accept-invitation"
              options={{ headerShown: false }}
            />,
          ]}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ExperienceProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <AddressProvider>
              <SearchProvider>
                <AppNavigator />
              </SearchProvider>
            </AddressProvider>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </ExperienceProvider>
  );
}
