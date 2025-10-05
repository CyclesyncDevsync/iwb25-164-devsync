"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: number;
  asgardeoId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "AGENT" | "SUPPLIER" | "BUYER";
  status: "APPROVED";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  redirectUrl?: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log("=== CHECKING AUTH STATUS ===");

      // Check localStorage first for quick load
      const storedUser = localStorage.getItem("user");
      console.log("Stored user in localStorage:", storedUser);

      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          console.log("Parsed user data from localStorage:", userData);
          setAuthState({
            user: userData,
            loading: false,
            error: null,
          });
        } catch (parseError) {
          console.error("Error parsing stored user data:", parseError);
          localStorage.removeItem("user");
        }
      } else {
        console.log("No user data found in localStorage");
      }

      // Validate with backend
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Auth check successful, user data:", data);
        if (data.user) {
          // Normalize role to uppercase
          const normalizedUser = {
            ...data.user,
            role: data.user.role.toUpperCase(),
          };
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          setAuthState({
            user: normalizedUser,
            loading: false,
            error: null,
          });
        } else {
          localStorage.removeItem("user");
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } else {
        console.log("Auth check failed, response status:", response.status);
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        // Redirect to login if not on public pages
        if (
          response.status === 401 &&
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/") &&
          !window.location.pathname.includes("/register") &&
          window.location.pathname !== "/"
        ) {
          // Store the current path for redirect after login
          sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname
          );
          window.location.href = "/auth/login?error=session_expired";
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("user");
      setAuthState({
        user: null,
        loading: false,
        error: "Failed to check authentication status",
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // OAuth Login - redirects to Asgardeo
  const login = useCallback(async (): Promise<AuthResponse> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to Asgardeo for authentication
        console.log("Redirecting to Asgardeo for login...");
        window.location.href = data.redirectUrl;
        return { success: true, message: "Redirecting to authentication..." };
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: data.message || "Login failed",
        }));
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // OAuth Registration - redirects to Asgardeo
  const register = useCallback(async (): Promise<AuthResponse> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to Asgardeo for registration
        console.log("Redirecting to Asgardeo for registration...");
        window.location.href = data.redirectUrl;
        return { success: true, message: "Redirecting to registration..." };
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: data.message || "Registration failed",
        }));
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Complete registration with role selection
  const completeRegistration = useCallback(
    async (role: "buyer" | "supplier"): Promise<AuthResponse> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/role-selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role }),
        });

        const data = await response.json();
        console.log("=== COMPLETE REGISTRATION RESPONSE ===");
        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(data, null, 2));

        if (data.success && data.user) {
          console.log("Success! Storing user data in localStorage...");
          console.log(
            "User data to store:",
            JSON.stringify(data.user, null, 2)
          );
          // Normalize role to uppercase
          const normalizedUser = {
            ...data.user,
            role: data.user.role.toUpperCase(),
          };
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          setAuthState({
            user: normalizedUser,
            loading: false,
            error: null,
          });
          console.log("Auth state updated with user:", data.user);
          return {
            success: true,
            message: data.message,
            user: data.user,
            redirectUrl: data.redirectUrl,
          };
        } else {
          console.log(
            "Registration failed - data.success:",
            data.success,
            "data.user:",
            !!data.user
          );
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: data.message || "Registration completion failed",
          }));
          return {
            success: false,
            message: data.message || "Registration completion failed",
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Registration completion failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  // Logout - clears cookies and local storage
  const logout = useCallback(async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Call logout API to clear HTTP-only cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local state
      localStorage.removeItem("user");
      setAuthState({ user: null, loading: false, error: null });
      router.push("/auth/login");
    }
  }, [router]);

  const clearAuthError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const getUserDashboardRoute = useCallback((): string => {
    if (!authState.user || !authState.user.role) return "/dashboard";

    switch (authState.user.role) {
      case "SUPER_ADMIN":
        return "/admin";
      case "ADMIN":
        return "/admin";
      case "AGENT":
        return "/agent";
      case "SUPPLIER":
        return "/supplier";
      case "BUYER":
        return "/buyer";
      default:
        return "/dashboard";
    }
  }, [authState.user]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    completeRegistration,
    logout,
    clearAuthError,
    getUserDashboardRoute,
    isAuthenticated: !!authState.user,
  };
}
