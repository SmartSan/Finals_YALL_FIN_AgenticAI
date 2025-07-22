
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, writeBatch, doc } from 'firebase/firestore';
import type { HistoryItem } from '@/types';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
  isClearingHistory: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

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
      setHistory([]); // Clear history on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory(user.uid);
    } else {
      setHistory([]);
      setIsLoading(false);
    }
  }, [user, fetchHistory]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) {
      throw new Error("Cannot save history. No user is authenticated.");
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
    } catch (error) {
      console.error("Error clearing history: ", error);
    } finally {
      setIsClearingHistory(false);
    }
  }, [user, history]);

  const value = {
    history,
    addHistoryItem,
    clearHistory,
    isLoading,
    isClearingHistory,
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
