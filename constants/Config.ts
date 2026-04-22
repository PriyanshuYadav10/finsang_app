import Constants from "expo-constants";

const extra = Constants?.expoConfig?.extra || {};

export const SUPABASE_URL = extra.SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = extra.SUPABASE_ANON_KEY as string;
export const SERVER_BASE_URL = extra.SERVER_BASE_URL as string;
