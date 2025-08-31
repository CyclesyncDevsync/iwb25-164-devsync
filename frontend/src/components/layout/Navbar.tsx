import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingCartIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, USER_ROLES } from '../../constants';
import { Button } from '../../components/ui/Button';
import { NavDarkModeToggle } from '../../components/ui/DarkModeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { NavbarSearch } from './NavbarSearch';
import { UserAvatar } from '../ui/UserAvatar';
import { Breadcrumb, useBreadcrumbs } from './Breadcrumb';
import { useNavbarConfig, getNavbarClasses } from './NavbarConfig';
import Image from 'next/image';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  roles?: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: HomeIcon,
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingCartIcon,
    children: [
      { label: 'Browse Materials', href: '/marketplace/materials' },
      { label: 'Active Auctions', href: '/marketplace/auctions' },
      { label: 'Categories', href: '/marketplace/categories' }
    ]
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: ChartBarIcon,
    requiresAuth: true,
  },
  {
    label: 'Chat',
    href: '/chat',
    icon: UserGroupIcon,
    requiresAuth: true,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: BuildingOfficeIcon,
    requiresAuth: true,
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    children: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Materials', href: '/admin/materials' },
      { label: 'Auctions', href: '/admin/auctions' },
      { label: 'Transactions', href: '/admin/transactions' },
      { label: 'Reports', href: '/admin/reports' }
    ]
  }
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get navbar configuration based on current route
  const navbarConfig = useNavbarConfig();
  const breadcrumbItems = useBreadcrumbs(user?.role);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Use the notification hook
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    addNotification,
    unreadCount 
  } = useNotifications();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Filter navigation items based on user authentication and role
  const getFilteredNavItems = () => {
    return navigationItems.filter(item => {
      if (item.requiresAuth && !isAuthenticated) return false;
      if (item.roles && (!user?.role || !item.roles.includes(user.role))) return false;
      return true;
    });
  };

  // Check if current path matches nav item
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Get user dashboard link based on role
  const getUserDashboardLink = () => {
    if (!user?.role) return '/dashboard';
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return '/admin';
      case USER_ROLES.SUPPLIER:
        return '/supplier';
      case USER_ROLES.BUYER:
        return '/buyer';
      case USER_ROLES.AGENT:
        return '/agent';
      default:
        return '/dashboard';
    }
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <nav className={getNavbarClasses(navbarConfig)}>
      <div className="w-full px-0">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <Image
                  src="/globe.svg"
                  alt="CircularSync Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                CircularSync
              </span>
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {filteredNavItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActiveLink(item.href)
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.label}
                    {item.children && <ChevronDownIcon className="w-4 h-4 ml-1" />}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Search */}
            {navbarConfig.showSearch && (
              <div className="hidden md:block">
                <NavbarSearch className="w-80" />
              </div>
            )}

            {/* Dark Mode Toggle */}
            <NavDarkModeToggle />

            {/* Notifications */}
            {navbarConfig.showNotifications && isAuthenticated && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
              />
            )}

            {/* User Menu */}
            {navbarConfig.showUserMenu && (
              isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UserAvatar user={user || undefined} size="sm" />
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 capitalize">
                            {user?.role} Account
                          </p>
                        </div>
                        <div className="py-2">
                          <Link
                            href={getUserDashboardLink()}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ChartBarIcon className="w-4 h-4 mr-3" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <UserCircleIcon className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <Button variant="default" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {navbarConfig.showBreadcrumbs && breadcrumbItems.length > 0 && (
          <div className="py-2 border-t border-gray-200 dark:border-gray-700">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-4 space-y-2">
                {/* Mobile Search */}
                {navbarConfig.showSearch && (
                  <div className="px-4 mb-4">
                    <NavbarSearch />
                  </div>
                )}

                {/* Mobile Navigation Items */}
                {filteredNavItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 text-base font-medium transition-colors
                        ${isActiveLink(item.href)
                          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-8 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile Auth Section */}
                {navbarConfig.showUserMenu && (
                  <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <UserAvatar 
                          user={user || undefined} 
                          size="md" 
                          showName 
                          showEmail 
                          className="py-2" 
                        />
                        <Link
                          href="/profile"
                          className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-2 py-2 text-sm text-red-600 dark:text-red-400"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href={ROUTES.LOGIN}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link
                          href={ROUTES.REGISTER}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button variant="default" size="sm" className="w-full">
                            Get Started
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
