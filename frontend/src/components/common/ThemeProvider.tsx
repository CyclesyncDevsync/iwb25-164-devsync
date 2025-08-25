import { ReactNode, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../types/store';
import { setActiveRole, toggleDarkMode } from '../../store/slices/themeSlice';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useDispatch();
  const { darkMode, activeRole } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const isInitialized = useRef(false);

  // Initialize theme from localStorage on mount (run only once)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      const savedTheme = localStorage.getItem('circularSync-theme');
      if (savedTheme) {
        try {
          const { darkMode: savedDarkMode } = JSON.parse(savedTheme);
          if (savedDarkMode !== darkMode) {
            dispatch(toggleDarkMode());
          }
        } catch (error) {
          console.warn('Failed to parse saved theme:', error);
        }
      }
      isInitialized.current = true;
    }
  }, [dispatch]); // Remove darkMode from dependencies to prevent infinite loop

  // Update active role when user changes
  useEffect(() => {
    if (user?.role && user.role !== activeRole) {
      dispatch(setActiveRole(user.role));
    }
  }, [user?.role, activeRole, dispatch]);

  // Apply dark mode class and persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Persist theme to localStorage
      localStorage.setItem('circularSync-theme', JSON.stringify({ darkMode }));
    }
  }, [darkMode]);

  return <>{children}</>;
}
