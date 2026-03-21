import type { Session, User } from "@supabase/supabase-js";
import * as React from "react";

import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = React.createContext<AuthState & { signOut: () => Promise<void> }>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, user: session?.user ?? null, loading: false });

      // If the token refresh failed or the user was signed out remotely, clear state
      if (event === "TOKEN_REFRESHED" && !session) {
        setState({ session: null, user: null, loading: false });
      }

      if (event === "SIGNED_OUT") {
        setState({ session: null, user: null, loading: false });
      }
    });

    // Periodically verify session is still valid (every 10 minutes)
    const refreshInterval = setInterval(
      async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setState({ session: null, user: null, loading: false });
        }
      },
      10 * 60 * 1000,
    );

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
