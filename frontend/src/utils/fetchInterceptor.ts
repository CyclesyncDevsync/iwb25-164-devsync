// Global fetch interceptor to handle authentication errors

const originalFetch = global.fetch;

global.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // Check if the response is a 401 Unauthorized
  if (response.status === 401) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    
    // Don't redirect for auth endpoints or public pages
    if (!url.includes('/api/auth/') && 
        !url.includes('/auth/') && 
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/auth/') &&
        !window.location.pathname.includes('/register') &&
        window.location.pathname !== '/') {
      
      // Clear local storage
      localStorage.removeItem('user');
      
      // Store current location for redirect after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      
      // Redirect to login page
      window.location.href = '/auth/login?error=session_expired';
    }
  }
  
  return response;
};

export {};