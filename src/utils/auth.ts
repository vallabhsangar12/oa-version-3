// Cookie-based auth check for client-side components
// The actual token is httpOnly, so we check via a lightweight API call
// For immediate checks, we read from a non-httpOnly user info cookie

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  // We set a non-httpOnly "user_info" cookie from login API for client-side awareness
  return document.cookie.includes("user_info=");
}

export function getUserInfo(): { name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const match = document.cookie.match(/user_info=([^;]+)/);
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}
