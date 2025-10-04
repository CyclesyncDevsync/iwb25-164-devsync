'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export interface NavbarConfig {
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  transparent?: boolean;
  sticky?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'dashboard';
}

const defaultConfig: NavbarConfig = {
  showBreadcrumbs: false,
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
  transparent: false,
  sticky: true,
  variant: 'default'
};

// Route-specific configurations
const routeConfigs: Record<string, Partial<NavbarConfig>> = {
  '/': {
    transparent: true,
    showBreadcrumbs: false
  },
  '/auth/*': {
    showSearch: false,
    showNotifications: false,
    showUserMenu: false,
    variant: 'minimal'
  },
  '/admin': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/admin/*': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/supplier': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/supplier/*': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/buyer': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/buyer/*': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/agent': {
    showBreadcrumbs: true,
    showNotifications: false,
    showUserMenu: false,
    variant: 'dashboard'
  },
  '/agent/*': {
    showBreadcrumbs: true,
    showNotifications: false,
    showUserMenu: false,
    variant: 'dashboard'
  },
  '/dashboard': {
    showBreadcrumbs: true,
    variant: 'dashboard'
  },
  '/profile': {
    showBreadcrumbs: true
  },
  '/chat': {
    showBreadcrumbs: true
  },
  '/auction/*/bid': {
    showSearch: false,
    showNotifications: false,
    variant: 'minimal'
  },
  '/marketplace': {
    showBreadcrumbs: true
  },
  '/marketplace/*': {
    showBreadcrumbs: true
  }
};

export function useNavbarConfig(): NavbarConfig {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  
  // Find matching route configuration
  const getRouteConfig = (): Partial<NavbarConfig> => {
    if (!pathname) return {};
    
    // Check for exact match first
    if (routeConfigs[pathname]) {
      return routeConfigs[pathname];
    }
    
    // Check for wildcard matches
    for (const route in routeConfigs) {
      if (route.endsWith('/*')) {
        const baseRoute = route.slice(0, -2);
        if (pathname.startsWith(baseRoute)) {
          return routeConfigs[route];
        }
      }
    }
    
    return {};
  };
  
  const routeConfig = getRouteConfig();
  
  // Merge default config with route-specific config
  const config: NavbarConfig = {
    ...defaultConfig,
    ...routeConfig
  };
  
  // Adjust config based on authentication status and user role
  if (!isAuthenticated) {
    config.showNotifications = false;
    if (config.showUserMenu) {
      // Keep user menu for sign in/sign up buttons
      config.showUserMenu = true;
    }
  } else if (user?.role === 'AGENT') {
    // Hide notifications and user menu for agent role
    config.showNotifications = false;
    config.showUserMenu = false;
  }
  
  return config;
}

// Helper function to get navbar classes based on configuration
export function getNavbarClasses(config: NavbarConfig): string {
  const baseClasses = 'border-b border-gray-200 dark:border-gray-800';
  
  let classes = baseClasses;
  
  // Background classes
  if (config.transparent) {
    classes += ' bg-white/80 dark:bg-gray-900/80 backdrop-blur-md';
  } else {
    classes += ' bg-white dark:bg-gray-900';
  }
  
  // Position classes
  if (config.sticky) {
    classes += ' sticky top-0';
  }
  
  // Z-index
  classes += ' z-[60]';
  
  // Variant-specific classes
  switch (config.variant) {
    case 'minimal':
      classes += ' shadow-none';
      break;
    case 'dashboard':
      classes += ' shadow-sm';
      break;
    default:
      classes += ' shadow-sm';
  }
  
  // Custom classes
  if (config.className) {
    classes += ` ${config.className}`;
  }
  
  return classes;
}

// Navbar variants for different page types
export const NAVBAR_VARIANTS = {
  DEFAULT: 'default',
  MINIMAL: 'minimal',
  DASHBOARD: 'dashboard',
  TRANSPARENT: 'transparent'
} as const;

export type NavbarVariant = typeof NAVBAR_VARIANTS[keyof typeof NAVBAR_VARIANTS];
