'use client';

import { store } from '../../store';
import { Provider } from 'react-redux';
import { ThemeProvider } from './ThemeProvider';
import { EnhancedToaster } from '../ui/EnhancedToast';
import { ReactNode, useState, useEffect } from 'react';
import Loading from '../../app/loading';
import { useAuth } from '../../hooks/useAuth';

interface ProvidersProps {
  children: ReactNode;
}

function LoadingWrapper({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      // Start progress animation when auth is loaded
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoaded(true);
            return 100;
          }
          // Faster progress towards the end
          const increment = prev < 80 ? Math.random() * 10 + 5 : Math.random() * 5 + 10;
          return Math.min(prev + increment, 100);
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [authLoading]);

  if (!isLoaded) {
    return <Loading progress={progress} />;
  }

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LoadingWrapper>
          <EnhancedToaster />
          {children}
        </LoadingWrapper>
      </ThemeProvider>
    </Provider>
  );
}
