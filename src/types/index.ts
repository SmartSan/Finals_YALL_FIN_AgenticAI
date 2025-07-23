
import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';

export type HistoryItem = {
  id: string;
  receiptImageUri: string;
  extractedText: string;
  timestamp: number;
};

// Types for Authentication
export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (credentials: SignUpCredentials) => Promise<User | null>;
  signIn: (credentials: SignInCredentials) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
