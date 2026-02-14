/**
 * Client-side auth check using cookies.
 * Checks for the presence of a "token" cookie (httpOnly cookies
 * are not accessible from JS, so we also rely on the /api/auth/me
 * endpoint for verified auth state).
 */
export const isLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;
  // Check if the token cookie exists (non-httpOnly fallback)
  // For httpOnly cookies, use /api/auth/me instead
  return document.cookie.includes("token=");
};
