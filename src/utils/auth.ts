// Client-side auth check via cookie presence
// Note: The actual JWT token is httpOnly so JS can't read it,
// but we check via a lightweight API call to /api/auth/me

export function isLoggedIn(): boolean {
  // On server-side, cannot check
  if (typeof window === "undefined") return false;

  // Check if we have a cached auth state in sessionStorage
  return sessionStorage.getItem("isLoggedIn") === "true";
}

export function setLoggedIn(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    sessionStorage.setItem("isLoggedIn", "true");
  } else {
    sessionStorage.removeItem("isLoggedIn");
  }
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      setLoggedIn(true);
      return true;
    }
    setLoggedIn(false);
    return false;
  } catch {
    setLoggedIn(false);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } finally {
    setLoggedIn(false);
  }
}
