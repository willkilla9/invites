"use client";

import { auth } from "@/lib/firebaseClient";
import { signOut, User, onIdTokenChanged } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthContextShape = {
  user: User | null;
  loading: boolean;
  token: string | null;
  refreshToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshToken = useCallback(async () => {
    if (!user) return null;
    const newToken = await user.getIdToken(true);
    setToken(newToken);
    return newToken;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      refreshToken,
      logout: () => signOut(auth),
    }),
    [user, loading, token, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
}
