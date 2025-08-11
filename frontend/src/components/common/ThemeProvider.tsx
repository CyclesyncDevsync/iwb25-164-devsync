import { ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../types/store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { darkMode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [darkMode]);

  return <>{children}</>;
}
