import React, { useState, useEffect, useRef } from 'react';
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
import { USER_ROLES } from '../../constants';
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
  const { isAuthenticated, user, logout, login, register, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Get navbar configuration based on current route
  const navbarConfig = useNavbarConfig();
  const breadcrumbItems = useBreadcrumbs(user?.role);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement | null>(null);
  
  // Use the notification hook
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    unreadCount 
  } = useNotifications();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setRoleMenuOpen(false);
  }, [pathname]);

  // Close role menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleMenuOpen && roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && roleMenuOpen) setRoleMenuOpen(false);
    }

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [roleMenuOpen]);

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
    <nav className={`${getNavbarClasses(navbarConfig)} bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-green-100 dark:border-slate-800 shadow-lg shadow-green-100/50 dark:shadow-slate-900/50`}>
      <div className="w-full px-0">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-1 group">
              <div className="relative">
                <Image
                  src="/logo_1.png"
                  alt="CircularSync Logo"
                  width={64}
                  height={64}
                  className="h-16 w-auto transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                CircularSync
              </span>
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-green-100/30 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
              {filteredNavItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105
                      ${isActiveLink(item.href)
                        ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 dark:shadow-green-400/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/80 dark:hover:bg-slate-700/50'
                      }
                    `}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.label}
                    {item.children && <ChevronDownIcon className="w-4 h-4 ml-1" />}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-green-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 rounded-lg mx-2"
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
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full p-1 shadow-lg shadow-green-100/30 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
              <NavDarkModeToggle />
            </div>

            {/* Notifications */}
            {navbarConfig.showNotifications && isAuthenticated && (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full p-1 shadow-lg shadow-green-100/30 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClearAll={clearAll}
                />
              </div>
            )}

            {/* User Menu */}
            {navbarConfig.showUserMenu && (
              isAuthenticated ? (
                // Hide profile menu for Supplier role
                user?.role === USER_ROLES.SUPPLIER ? null : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-3 rounded-full hover:bg-green-50/80 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg shadow-green-100/30 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50"
                  >
                    <UserAvatar user={user || undefined} size="sm" />
                    <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-green-100 dark:border-slate-700 z-50"
                      >
                        <div className="px-6 py-4 border-b border-green-100 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-t-xl">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user?.email}
                          </p>
                          <p className="text-xs font-medium text-green-600 dark:text-green-400 capitalize mt-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full inline-block">
                            {user?.role} Account
                          </p>
                        </div>
                        <div className="py-3">
                          <Link
                            href={getUserDashboardLink()}
                            className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200"
                          >
                            <ChartBarIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200"
                          >
                            <UserCircleIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                            Profile
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200"
                          >
                            <Cog6ToothIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                            Settings
                          </Link>
                        </div>
                        <div className="border-t border-green-100 dark:border-slate-700 py-3">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-200"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )
              ) : (
                <div className="hidden md:flex items-center space-x-0 relative">
                  {/* Split Sign In + Role dropdown: primary signs in, chevron toggles role list */}
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        login();
                        setRoleMenuOpen(false);
                      }}
                      disabled={loading}
                      className="rounded-l-md border-green-200 dark:border-slate-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <button
                      onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                      aria-label="Open role menu"
                      className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-green-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-green-50 dark:hover:bg-slate-700"
                    >
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {roleMenuOpen && (
                      <motion.div
                        ref={roleMenuRef}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 mt-12 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-green-100 dark:border-slate-700 z-50"
                      >
                        <div className="py-1">
                          {['Agent', 'Buyer', 'Supplier'].map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                // Keep Asgardeo sign-in behavior (no role attached)
                                login();
                                setRoleMenuOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded-full hover:bg-green-50/80 dark:hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg shadow-green-100/30 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
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
              className="lg:hidden border-t border-green-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="py-6 space-y-3 px-4">
                {/* Mobile Search */}
                {navbarConfig.showSearch && (
                  <div className="mb-6">
                    <NavbarSearch />
                  </div>
                )}

                {/* Mobile Navigation Items */}
                {filteredNavItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl
                        ${isActiveLink(item.href)
                          ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-green-50/80 dark:hover:bg-slate-700/50 hover:text-green-600 dark:hover:text-green-400'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-8 space-y-2 mt-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-slate-700/30 rounded-lg transition-all duration-200"
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
                  <div className="px-0 pt-6 border-t border-green-100 dark:border-slate-800 mt-6">
                    {isAuthenticated ? (
                      // If supplier, show minimal mobile auth view (no Profile/Settings links)
                      user?.role === USER_ROLES.SUPPLIER ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
                            <UserAvatar 
                              user={user || undefined} 
                              size="md" 
                              showName 
                              showEmail 
                              className="py-2" 
                            />
                          </div>
                          <button
                            onClick={() => {
                              logout();
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
                          <UserAvatar 
                            user={user || undefined} 
                            size="md" 
                            showName 
                            showEmail 
                            className="py-2" 
                          />
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50/80 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <UserCircleIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50/80 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                          Sign Out
                        </button>
                      </div>
                      )
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {['Agent', 'Buyer', 'Supplier'].map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                login();
                                setMobileMenuOpen(false);
                              }}
                              className="px-3 py-2 text-sm rounded-md bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-slate-700"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            login();
                            setMobileMenuOpen(false);
                          }}
                          disabled={loading}
                          className="w-full border-green-200 dark:border-slate-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
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
