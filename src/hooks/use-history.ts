
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, writeBatch } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import type { HistoryItem } from '@/types';
import { getAuthInstance, getFirestoreInstance } from '@/lib/firebase';
import { useToast } from './use-toast';

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
  isClearingHistory: boolean;
  isAuthLoading: boolean;
  user: User | null;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: "Could not start an anonymous session.",
          });
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const fetchHistory = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const db = getFirestoreInstance();
      const q = query(
        collection(db, 'history'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to load history from Firestore", error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory(user.uid);
    } else {
      setHistory([]);
      if (!isAuthLoading) {
        setIsLoading(false);
      }
    }
  }, [user, fetchHistory, isAuthLoading]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) {
      throw new Error("Cannot save history. User not authenticated.");
    }
    const db = getFirestoreInstance();
    const newItem: Omit<HistoryItem, 'id'> = {
      ...item,
      userId: user.uid,
      timestamp: Date.now(),
    };
    try {
      const docRef = await addDoc(collection(db, 'history'), newItem);
      setHistory(prev => [{ ...newItem, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error("Failed to save history to Firestore", error);
      throw new Error("Failed to save history item.");
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user || history.length === 0) return;

    setIsClearingHistory(true);
    try {
      const db = getFirestoreInstance();
      const batch = writeBatch(db);
      const q = query(collection(db, 'history'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      setHistory([]);
      toast({
        title: "History Cleared",
        description: "Your scan history has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing history: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear history.",
      });
    } finally {
      setIsClearingHistory(false);
    }
  }, [user, history.length, toast]);

  const value = {
    history,
    addHistoryItem,
    clearHistory,
    isLoading,
    isClearingHistory,
    isAuthLoading,
    user,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
