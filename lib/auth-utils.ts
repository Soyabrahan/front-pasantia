interface TokenPayload {
  role?: string;
  rol?: string;
  nombre?: string;
  username?: string;
  ficha?: string;
  sub?: string;
  iat?: number;
  exp?: number;
}

const ROLE_GUARD: Record<string, string[]> = {
  "/auditoria": ["admin", "administrador"],
  "/configuracion": ["admin", "administrador"],
};

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: TokenPayload): boolean {
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenRole(payload: TokenPayload): string {
  return (payload?.role || payload?.rol || "").toLowerCase();
}

export function getValidToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token || token === "null" || token === "undefined") return null;

  const payload = decodeToken(token);
  if (!payload || isTokenExpired(payload)) {
    localStorage.removeItem("auth_token");
    return null;
  }
  return token;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token || token === "null" || token === "undefined") return null;
  return token;
}

export function hasRequiredRole(
  payload: TokenPayload,
  pathname: string
): boolean {
  const requiredRoles = ROLE_GUARD[pathname];
  if (!requiredRoles) return true;
  const userRole = getTokenRole(payload);
  return requiredRoles.includes(userRole);
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  window.location.href = "/login";
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("networkerror") ||
      msg.includes("network error") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed") ||
      msg.includes("fetch") ||
      msg.includes("network")
    );
  }
  return false;
}
