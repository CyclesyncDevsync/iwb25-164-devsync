import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from './authSlice';

interface ThemeState {
  darkMode: boolean;
  activeRole: UserRole;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
}

const initialState: ThemeState = {
  darkMode: false,
  activeRole: 'guest',
  colorScheme: {
    primary: '#00684A', // MongoDB Green
    secondary: '#001E2B', // Dark Navy
    accent: '#00684A', // Default to admin color (Green)
    background: '#FFFFFF',
    surface: '#F9FAFB',
  },
};

// Role-based color schemes
const roleColorSchemes = {
  admin: {
    light: { accent: '#00684A' }, // Green for system control
    dark: { accent: '#47A16B' },
  },
  agent: {
    light: { accent: '#0066CC' }, // Professional Blue
    dark: { accent: '#60A5FA' },
  },
  supplier: {
    light: { accent: '#10B981' }, // Emerald Green
    dark: { accent: '#34D399' },
  },
  buyer: {
    light: { accent: '#8B5CF6' }, // Purple
    dark: { accent: '#A78BFA' },
  },
  guest: {
    light: { accent: '#6B7280' }, // Gray
    dark: { accent: '#9CA3AF' },
  },
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      
      // Update color scheme based on dark mode
      if (state.darkMode) {
        state.colorScheme = {
          primary: '#47A16B', // Light MongoDB Green
          secondary: '#F9FAFB', // Light Gray
          accent: roleColorSchemes[state.activeRole].dark.accent,
          background: '#1F2937', // Dark Gray
          surface: '#374151', // Medium Gray
        };
      } else {
        state.colorScheme = {
          primary: '#00684A', // MongoDB Green
          secondary: '#001E2B', // Dark Navy
          accent: roleColorSchemes[state.activeRole].light.accent,
          background: '#FFFFFF',
          surface: '#F9FAFB',
        };
      }
    },
    setActiveRole: (state, action: PayloadAction<UserRole>) => {
      state.activeRole = action.payload;
      
      // Update accent color based on role and theme mode
      if (state.darkMode) {
        state.colorScheme.accent = roleColorSchemes[action.payload].dark.accent;
      } else {
        state.colorScheme.accent = roleColorSchemes[action.payload].light.accent;
      }
    },
    setCustomTheme: (state, action: PayloadAction<Partial<ThemeState['colorScheme']>>) => {
      state.colorScheme = { ...state.colorScheme, ...action.payload };
    },
  },
});

export const { toggleDarkMode, setActiveRole, setCustomTheme } = themeSlice.actions;

export default themeSlice.reducer;
