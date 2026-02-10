
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { authClient, setBearerToken, clearAuthTokens } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function openOAuthPopup(provider: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const popupUrl = `${window.location.origin}/auth-popup?provider=${provider}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      popupUrl,
      "oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("Failed to open popup. Please allow popups."));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth-success" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        resolve(event.data.token);
      } else if (event.data?.type === "oauth-error") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        reject(new Error(event.data.error || "OAuth failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Authentication cancelled"));
      }
    }, 500);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);
  const initializingRef = useRef(false);

  const fetchUser = async () => {
    try {
      if (!mountedRef.current) {
        console.log('[Auth] Skipping fetchUser - component not mounted yet');
        return;
      }
      
      if (mountedRef.current) {
        setLoading(true);
      }
      
      const session = await authClient.getSession();
      
      if (!mountedRef.current) {
        console.log('[Auth] Component unmounted during fetchUser, skipping state update');
        return;
      }
      
      if (session?.data?.user) {
        setUser(session.data.user as User);
        // Sync token to SecureStore for utils/api.ts
        if (session.data.session?.token) {
          await setBearerToken(session.data.session.token);
        }
      } else {
        setUser(null);
        await clearAuthTokens();
      }
    } catch (error) {
      console.error("[Auth] Failed to fetch user:", error);
      if (mountedRef.current) {
        setUser(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    console.log('[Auth] Component mounted, initializing auth');
    
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      console.log('[Auth] Already initializing, skipping duplicate init');
      return;
    }
    
    initializingRef.current = true;
    
    // Initial fetch after mount
    const initAuth = async () => {
      await fetchUser();
      initializingRef.current = false;
    };
    
    initAuth();

    // Listen for deep links (e.g. from social auth redirects)
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("[Auth] Deep link received, refreshing user session");
      // Allow time for the client to process the token if needed
      setTimeout(() => {
        if (mountedRef.current) {
          fetchUser();
        }
      }, 500);
    });

    // POLLING: Refresh session every 5 minutes to keep SecureStore token in sync
    // This prevents 401 errors when the session token rotates
    const intervalId = setInterval(() => {
      if (mountedRef.current && !initializingRef.current) {
        console.log("[Auth] Auto-refreshing user session to sync token...");
        fetchUser();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      console.log('[Auth] Component unmounting, cleaning up');
      mountedRef.current = false;
      initializingRef.current = false;
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await authClient.signIn.email({ email, password });
      await fetchUser();
    } catch (error) {
      console.error("[Auth] Email sign in failed:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      await fetchUser();
      
      // Initialize player stats for new user
      try {
        const { authenticatedPost } = await import('@/utils/api');
        await authenticatedPost('/api/player/stats/init', {});
        console.log('[Auth] Player stats initialized for new user');
      } catch (statsError) {
        console.error('[Auth] Failed to initialize player stats:', statsError);
        // Don't throw - user is created, stats can be initialized later
      }
    } catch (error) {
      console.error("[Auth] Email sign up failed:", error);
      throw error;
    }
  };

  const signInWithSocial = async (provider: "google" | "apple" | "github") => {
    try {
      if (Platform.OS === "web") {
        const token = await openOAuthPopup(provider);
        await setBearerToken(token);
        await fetchUser();
      } else {
        // Native: Use expo-linking to generate a proper deep link
        const callbackURL = Linking.createURL("/game");
        await authClient.signIn.social({
          provider,
          callbackURL,
        });
        await fetchUser();
      }
    } catch (error) {
      console.error(`[Auth] ${provider} sign in failed:`, error);
      throw error;
    }
  };

  const signInWithGoogle = () => signInWithSocial("google");
  const signInWithApple = () => signInWithSocial("apple");
  const signInWithGitHub = () => signInWithSocial("github");

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[Auth] Sign out failed (API):", error);
    } finally {
       // Always clear local state
       if (mountedRef.current) {
         setUser(null);
       }
       await clearAuthTokens();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithGitHub,
        signOut,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
