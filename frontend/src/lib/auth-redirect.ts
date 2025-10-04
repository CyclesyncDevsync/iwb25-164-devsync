/**
 * Redirects unauthenticated users directly to Asgardeo login
 * @param currentPath - The path to redirect to after login
 */
export function redirectToAsgardeoLogin(currentPath: string) {
  // Use the direct-login API route which handles PKCE and redirects to Asgardeo
  window.location.href = `/api/auth/direct-login?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * Check if user is authenticated and redirect if not
 * To be used in useEffect hooks of protected pages
 */
export function requireAuth(
  isAuthenticated: boolean,
  isLoading: boolean,
  currentPath: string
) {
  if (!isLoading && !isAuthenticated) {
    redirectToAsgardeoLogin(currentPath);
    return false;
  }
  return true;
}