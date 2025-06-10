/**
 * Custom React hook for persistent local storage with TypeScript support
 * Provides automatic serialization and error handling for data persistence
 */

import { useState, useEffect } from 'react';

/**
 * Hook for managing data in localStorage with automatic synchronization
 * @param key - Storage key for the data
 * @param initialValue - Default value if no stored data exists
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for managing conversation history in localStorage
 * Provides automatic cleanup of old conversations to prevent storage bloat
 */
export function useConversationHistory() {
  const [history, setHistory] = useLocalStorage('debt-conversation-history', []);
  
  const addConversation = (userMessage: string, aiResponse: string) => {
    const newEntry = {
      timestamp: new Date(),
      userMessage,
      aiResponse
    };
    
    // Keep only the last 20 conversations to prevent storage bloat
    const updatedHistory = [...history, newEntry].slice(-20);
    setHistory(updatedHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addConversation,
    clearHistory
  };
}