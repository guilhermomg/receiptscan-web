import React, { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../services/auth.service';
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  signOutUser,
  resetPassword,
  updateUserProfile,
  onAuthStateChange,
  getCurrentUserToken,
} from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogleProvider: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  getToken: () => Promise<string | null>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const user = await signUpWithEmail(email, password, displayName);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleProvider = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await resetPassword(email);
  };

  const updateProfile = async (displayName?: string, photoURL?: string) => {
    await updateUserProfile(displayName, photoURL);
    // Refresh user data after profile update
    if (user) {
      setUser({
        ...user,
        displayName: displayName ?? user.displayName,
        photoURL: photoURL ?? user.photoURL,
      });
    }
  };

  const getToken = async () => {
    return await getCurrentUserToken();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogleProvider,
    logout,
    sendPasswordReset,
    updateProfile,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
