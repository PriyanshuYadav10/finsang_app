import { Stack } from "expo-router";
import React from "react";

export default function FinsangMartPagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2f2f2f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="shop/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="shops" options={{ headerShown: false }} />
      <Stack.Screen name="ProductsScreen" options={{ headerShown: false }} />
    </Stack>
  );
} 