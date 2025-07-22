
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, writeBatch, doc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import type { HistoryItem } from '@/types';
import { getFirestoreInstance, getAuthInstance, isFirebaseInitialized } from '@/lib/firebase';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
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
    });

    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    setIsLoaded(false);
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
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory(user.uid);
    } else {
      setHistory([]);
      setIsLoaded(true);
    }
  }, [user, fetchHistory]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) {
      console.error("No user authenticated, cannot add history item.");
      return;
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
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user || history.length === 0) return;
    try {
      const db = getFirestoreInstance();
      const batch = writeBatch(db);
      const q = query(collection(db, 'history'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, 'history', document.id));
      });
      
      await batch.commit();
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history: ", error);
    }
  }, [user, history.length]);

  return { history, addHistoryItem, clearHistory, isLoaded };
}
