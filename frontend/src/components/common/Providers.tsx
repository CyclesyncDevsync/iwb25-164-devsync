'use client';

import { store } from '../../store';
import { Provider } from 'react-redux';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
