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
  mapFirebaseUser,
} from '../services/auth.service';
import { auth } from '../lib/firebase';

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
      await signInWithEmail(email, password);
      // User state will be updated by onAuthStateChange observer
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
      // User state will be updated by onAuthStateChange observer
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogleProvider = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // User state will be updated by onAuthStateChange observer
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      // User state will be updated by onAuthStateChange observer
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await resetPassword(email);
  };

  const updateProfile = async (displayName?: string, photoURL?: string) => {
    await updateUserProfile(displayName, photoURL);
    // Force refresh the user state by triggering the auth state observer
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updatedUser = mapFirebaseUser(auth.currentUser);
      setUser(updatedUser);
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
