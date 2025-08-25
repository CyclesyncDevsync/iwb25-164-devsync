'use client';

import { store } from '../../store';
import { Provider } from 'react-redux';
import { ThemeProvider } from './ThemeProvider';
import { EnhancedToaster } from '../ui/EnhancedToast';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <EnhancedToaster />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
