import { useState, useEffect } from 'react';
import type { SavedInvoice } from '../types/invoice';

const HISTORY_KEY = 'invoice_history';

export const useInvoiceHistory = () => {
  const [history, setHistory] = useState<SavedInvoice[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse invoice history', e);
      }
    }
  }, []);

  const saveToHistory = (invoice: SavedInvoice) => {
    const updatedHistory = [invoice, ...history.filter(i => i.id !== invoice.id)];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter(i => i.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return {
    history,
    saveToHistory,
    deleteFromHistory,
  };
};
