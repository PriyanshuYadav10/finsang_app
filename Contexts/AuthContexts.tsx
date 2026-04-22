import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

// Types for context
interface AuthContextType {
  user: any;
  session: any;
  isLoggedIn: boolean;
  loading: boolean;
  login: (phone: string) => Promise<{ error: any } | undefined>;
  verifyOtp: (
    phone: string,
    otp: string
  ) => Promise<{ error: any; user?: any } | undefined>;
  logout: () => Promise<void>;
  setIsLoggedIn: (value: boolean) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoggedIn: false,
  loading: true,
  login: async () => undefined,
  verifyOtp: async () => undefined,
  logout: async () => {},
  setIsLoggedIn: () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // console.log(session)
        setSession(session);
        setIsLoggedIn(!!session?.user);
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });

    console.log("error", error);
    return { error };
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    if (!error && data?.user) {
      setUser(data.user);
      setSession(data.session);
    }
    return { error, user: data?.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoggedIn(false);
  };

  const refreshSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoggedIn,
        loading,
        login,
        verifyOtp,
        logout,
        setIsLoggedIn,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
