"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import type { HistoryItem } from '@/types';
import { db, auth } from '@/lib/firebase';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        await signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
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
      console.error("No user authenticated");
      return;
    }
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
    if (!user) return;
    try {
      // Create a query to get all documents for the current user
      const q = query(collection(db, 'history'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      // Delete each document
      const deletePromises = querySnapshot.docs.map((document) => 
        deleteDoc(doc(db, 'history', document.id))
      );
      await Promise.all(deletePromises);
      
      setHistory([]);
    } catch (error) {
      console.error("Error clearing history: ", error);
    }
  }, [user]);

  return { history, addHistoryItem, clearHistory, isLoaded };
}
