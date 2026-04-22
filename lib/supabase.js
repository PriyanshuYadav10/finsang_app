import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { AppState } from "react-native";

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const SUPABASE_URL = extra.SUPABASE_URL;
const SUPABASE_ANON_KEY = extra.SUPABASE_ANON_KEY;

const supabaseDebug = {
  SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 40)}...` : null,
  hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  fetchPresent: typeof globalThis.fetch === "function",
  URLPresent: typeof URL !== "undefined",
  expoConfigExtra: Boolean(Constants.expoConfig?.extra),
  manifestExtra: Boolean(Constants.manifest?.extra),
};
console.log("Supabase runtime debug:", supabaseDebug);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase config missing. Check app.json extra values.", {
    SUPABASE_URL,
    SUPABASE_ANON_KEY: Boolean(SUPABASE_ANON_KEY),
  });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
