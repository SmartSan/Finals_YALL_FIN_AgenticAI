
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, writeBatch, doc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import type { HistoryItem } from '@/types';
import { getFirestoreInstance, getAuthInstance } from '@/lib/firebase';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This effect handles the entire authentication flow.
    if (typeof window === "undefined") {
      return;
    }
    
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
      // Once we have a user or tried to sign in, auth is no longer loading.
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    setIsHistoryLoading(true);
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
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect fetches history only when we have a user and auth is settled.
    if (user) {
      fetchHistory(user.uid);
    } else if (!isAuthLoading) {
      // If auth is done and there's no user, clear history and stop loading.
      setHistory([]);
      setIsHistoryLoading(false);
    }
  }, [user, isAuthLoading, fetchHistory]);

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
      // Add the new item to the top of the list for immediate UI update.
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
      // We can just use the IDs from the state to delete documents.
      history.forEach((item) => {
        if(item.id) {
          batch.delete(doc(db, 'history', item.id));
        }
      });
      
      await batch.commit();
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history: ", error);
    } finally {
      setIsClearingHistory(false);
    }
  }, [user, history]);

  return { 
    history, 
    addHistoryItem, 
    clearHistory, 
    isHistoryLoading, 
    isAuthLoading,
    isClearingHistory 
  };
}
