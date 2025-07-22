
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from './use-toast';
import type { HistoryItem } from '@/types';

const HISTORY_STORAGE_KEY = 'qrReceiptHistory';

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
  isClearingHistory: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load history.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Failed to save history to local storage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save history item.",
      });
    }
  }, [history, toast]);

  const clearHistory = useCallback(async () => {
    if (history.length === 0) return;

    setIsClearingHistory(true);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
      toast({
        title: "History Cleared",
        description: "Your scan history has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing history from local storage: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear history.",
      });
    } finally {
      setIsClearingHistory(false);
    }
  }, [history.length, toast]);

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
