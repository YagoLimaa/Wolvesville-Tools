import { useState, useCallback, useEffect } from 'react';

export interface SearchHistoryItem {
  term: string;
  timestamp: number;
}

export const useSearchHistory = (key: string, maxItems: number = 10) => {
  const storageKey = `search_history_${key}`;
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(`Erro ao carregar histórico de pesquisa de ${key}:`, e);
      }
    }
  }, [storageKey, key]);

  const addToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.term.toLowerCase() !== term.toLowerCase());
        const updated = [
          { term: term.trim(), timestamp: Date.now() },
          ...filtered,
        ].slice(0, maxItems);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey, maxItems]
  );

  const removeFromHistory = useCallback(
    (term: string) => {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.term !== term);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        return filtered;
      });
    },
    [storageKey]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
