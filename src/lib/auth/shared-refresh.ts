let refreshPromise: Promise<boolean> | null = null;

/**
 * Shared token refresh — ensures only one refresh call is in-flight at a time.
 */
export async function sharedRefreshToken(venueId?: string): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const params = new URLSearchParams();
      if (venueId) params.set("venueId", venueId);

      const res = await fetch(
        `/api/auth/refresh-token${params.size ? `?${params}` : ""}`,
        { method: "GET", credentials: "include" },
      );
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Clear auth state and redirect to the login page.
 */
export function clearAuthAndLogout() {
  document.cookie = "accessToken=; Max-Age=0; path=/; SameSite=Lax";
  document.cookie = "refreshToken=; Max-Age=0; path=/; SameSite=Lax";
  window.location.href = "/login";
}
