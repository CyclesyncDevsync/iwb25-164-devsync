/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0 flows
 * Implements RFC 7636 standards for secure authorization code flows
 */

/**
 * Generate a cryptographically secure random string for PKCE code verifier
 * @param length - Length of the code verifier (min 43, max 128 characters)
 * @returns Base64URL-encoded random string
 */
export function generateCodeVerifier(length: number = 128): string {
  // Ensure length is within RFC 7636 specification
  const verifierLength = Math.max(43, Math.min(128, length));
  
  // Generate random bytes
  const array = new Uint8Array(Math.ceil(verifierLength * 3 / 4));
  crypto.getRandomValues(array);
  
  // Convert to base64url encoding
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, verifierLength);
}

/**
 * Generate code challenge from code verifier using SHA256
 * @param codeVerifier - The code verifier string
 * @returns Promise that resolves to base64url-encoded SHA256 hash
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Create SHA256 hash of the code verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url encoding
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate a random state parameter for OAuth 2.0 flows
 * Used to prevent CSRF attacks
 * @param length - Length of the state string (default 32)
 * @returns Random state string
 */
export function generateState(length: number = 32): string {
  const array = new Uint8Array(Math.ceil(length * 3 / 4));
  crypto.getRandomValues(array);
  
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, length);
}

/**
 * Generate a random nonce for OpenID Connect flows
 * @param length - Length of the nonce string (default 32)
 * @returns Random nonce string
 */
export function generateNonce(length: number = 32): string {
  return generateState(length); // Same implementation as state
}

/**
 * Validate code verifier according to RFC 7636
 * @param codeVerifier - The code verifier to validate
 * @returns True if valid, false otherwise
 */
export function validateCodeVerifier(codeVerifier: string): boolean {
  // Check length requirements (43-128 characters)
  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    return false;
  }
  
  // Check character set (A-Z, a-z, 0-9, -, ., _, ~)
  const validChars = /^[A-Za-z0-9\-._~]*$/;
  return validChars.test(codeVerifier);
}

/**
 * Generate both code verifier and code challenge in one call
 * @param verifierLength - Length of the code verifier (default 128)
 * @returns Promise with both verifier and challenge
 */
export async function generatePKCEPair(verifierLength: number = 128): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateCodeVerifier(verifierLength);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge
  };
}
