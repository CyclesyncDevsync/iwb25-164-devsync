"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_ROLES, ROUTES } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { useCachedUser } from "../../hooks/useCachedUser";
import { cn } from "../../utils/cn";
import type { User } from "../../types/user";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarLink({
  href,
  icon,
  label,
  isActive,
  onClick,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-2 my-1 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-surface"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth() as { user: User | null };
  const {
    user: cachedUser,
    loading: cacheLoading,
    fromCache,
  } = useCachedUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use cached user if available (from Redis), otherwise fall back to auth user
  const currentUser = cachedUser || authUser;

  // Log cache status for debugging
  useEffect(() => {
    if (fromCache) {
      console.log("📦 Using Redis-cached user data for sidebar");
    } else if (cachedUser) {
      console.log("🔄 Using fresh user data (cached for next load)");
    }
  }, [fromCache, cachedUser]);

  // Normalize role to uppercase for consistent comparison
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return USER_ROLES.GUEST;
    const upperRole = role.toUpperCase();
    // Check if the normalized role exists in USER_ROLES
    if (Object.values(USER_ROLES).includes(upperRole as any)) {
      return upperRole;
    }
    return USER_ROLES.GUEST;
  };

  const userRole = normalizeRole(currentUser?.role);

  // Debug logging for role and sidebar links
  useEffect(() => {
    console.log("🔍 User Role (normalized):", userRole);
    console.log("👤 Current User:", currentUser);
    console.log("📝 Sidebar Links Count:", sidebarLinks.length);
  }, [userRole, currentUser]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define sidebar links based on user role
  const sidebarLinks: { href: string; icon: React.ReactNode; label: string }[] =
    [];

  // Role-specific dashboard link
  const getDashboardRoute = () => {
    switch (userRole) {
      case USER_ROLES.SUPER_ADMIN:
        return "/admin"; // Super Admin uses admin dashboard with additional privileges
      case USER_ROLES.ADMIN:
        return "/admin"; // Admin dashboard
      case USER_ROLES.AGENT:
        return "/agent"; // Agent main dashboard
      case USER_ROLES.SUPPLIER:
        return "/supplier"; // Supplier main dashboard
      case USER_ROLES.BUYER:
        return "/buyer"; // Buyer main dashboard
      default:
        return ROUTES.DASHBOARD;
    }
  };

  // Dashboard link
  sidebarLinks.push({
    href: getDashboardRoute(),
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    label: "Dashboard",
  });

  // Role-specific links
  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.SUPER_ADMIN) {
    sidebarLinks.push({
      href: ROUTES.ADMIN.USERS,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      label: "Users",
    });

    sidebarLinks.push({
      href: ROUTES.ADMIN.MATERIALS,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      label: "Materials",
    });

    sidebarLinks.push({
      href: "/admin/verification",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Material Verification",
    });

    sidebarLinks.push({
      href: "/admin/agents",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      label: "Agent Management",
    });

    sidebarLinks.push(
      {
        href: ROUTES.ADMIN.AUCTIONS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        label: "Auctions",
      },
      {
        href: ROUTES.ADMIN.TRANSACTIONS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
        label: "Transactions",
      },
      {
        href: ROUTES.ADMIN.DISPUTES,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        ),
        label: "Disputes",
      },
      {
        href: ROUTES.ADMIN.REPORTS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        label: "Reports",
      },
      {
        href: "/admin/pricing",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "Pricing",
      }
    );

    // Super Admin specific section
    if (userRole === USER_ROLES.SUPER_ADMIN) {
      sidebarLinks.push({
        href: "/admin/admin-management",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        ),
        label: "Admin Management",
      });
    }
  } else if (userRole === USER_ROLES.AGENT) {
    sidebarLinks.push(
      {
        href: ROUTES.AGENT.ASSIGNMENTS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
        label: "Assignments",
      },
      {
        href: ROUTES.AGENT.VERIFICATION,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "Verification",
      }
    );
  } else if (userRole === USER_ROLES.SUPPLIER) {
    sidebarLinks.push(
      {
        href: ROUTES.SUPPLIER.MATERIALS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
        label: "My Materials",
      },
      {
        href: ROUTES.SUPPLIER.AUCTIONS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        label: "My Auctions",
      }
    );
  } else if (userRole === USER_ROLES.BUYER) {
    sidebarLinks.push(
      {
        href: ROUTES.BUYER.MARKETPLACE,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        label: "Marketplace",
      },
      {
        href: ROUTES.BUYER.AUCTIONS,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        ),
        label: "Active Auctions",
      }
    );
  }

  // Common links for all authenticated users
  sidebarLinks.push({
    href: ROUTES.CHAT,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    label: "Messages",
  });

  // Filter out any links with undefined hrefs
  const validSidebarLinks = sidebarLinks.filter((link) => link.href);

  return (
    <div className="flex h-screen w-screen overflow-hidden fixed inset-0">
      {/* Sidebar for larger screens - Made sticky and full height */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-primary dark:text-primary-light">
                  CircularSync
                </h2>
              </div>

              {/* User Profile Section */}
              <div className="mt-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {currentUser?.given_name
                          ? currentUser.given_name.charAt(0).toUpperCase()
                          : currentUser?.email
                          ? currentUser.email.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentUser?.given_name ||
                        currentUser?.email?.split("@")[0] ||
                        "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {validSidebarLinks.map((link, index) => (
                  <SidebarLink
                    key={`${link.href}-${index}`}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    isActive={pathname === link.href}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 flex z-40 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className={cn(
            "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity",
            sidebarOpen
              ? "opacity-100 ease-out duration-300"
              : "opacity-0 ease-in duration-200"
          )}
          onClick={toggleSidebar}
        />

        <div
          className={cn(
            "relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-bg transition-transform",
            sidebarOpen
              ? "translate-x-0 ease-out duration-300"
              : "-translate-x-full ease-in duration-200"
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h2 className="text-lg font-semibold text-primary dark:text-primary-light">
                CircularSync
              </h2>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {validSidebarLinks.map((link, index) => (
                <SidebarLink
                  key={`mobile-${link.href}-${index}`}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  isActive={pathname === link.href}
                  onClick={toggleSidebar}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content - Full height without navbar */}
      <div className="flex flex-col w-0 flex-1 h-screen overflow-hidden">
        {/* Mobile menu button - Only show on mobile */}
        <div className="md:hidden pl-3 pt-3 pb-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:text-gray-400 dark:hover:text-gray-50"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
