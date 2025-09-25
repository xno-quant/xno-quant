"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client-app';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check for dev mode from environment variables
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE_NO_ADMIN_ENFORCE === 'true';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDevMode) {
      setIsAdmin(true);
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // You might want to verify admin status on the backend for security
        // For client-side display purposes, this can be an indicator
        const tokenResult = await user.getIdTokenResult();
        // In dev mode, always treat as admin. Otherwise, check claims.
        setIsAdmin(isDevMode || !!tokenResult.claims.admin);
      } else {
        // If not logged in, they are admin only if dev mode is on
        setIsAdmin(isDevMode);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      return result.user;
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };
  
  const value = { user, isAdmin, loading, signInWithGoogle, logout };

  if (loading) {
    return <div className="w-full bg-background min-h-screen flex flex-col items-center justify-center"><p>Đang tải...</p></div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
