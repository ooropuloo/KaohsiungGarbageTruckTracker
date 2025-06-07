
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  useEffect(() => {
    try {
      const valueToStore = storedValue instanceof Set ? JSON.stringify(Array.from(storedValue as any)) : JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Custom setter to handle Set conversion if needed
   const setValue = (value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      if (initialValue instanceof Set && Array.isArray(newValue)) {
        return new Set(newValue) as unknown as T;
      }
      return newValue;
    });
  };


  // Special handling for initial value being a Set
  useEffect(() => {
    if (initialValue instanceof Set) {
        const item = window.localStorage.getItem(key);
        if (item) {
            try {
                const parsedArray = JSON.parse(item);
                if (Array.isArray(parsedArray)) {
                    setStoredValue(new Set(parsedArray) as unknown as T);
                }
            } catch (error) {
                console.error(`Error parsing Set from localStorage key "${key}":`, error);
                setStoredValue(initialValue);
            }
        } else {
             setStoredValue(initialValue);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  return [storedValue, setStoredValue as React.Dispatch<React.SetStateAction<T>>];
}

export default useLocalStorage;
    