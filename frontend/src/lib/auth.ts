const AUTH_STORAGE_KEY = "ems.auth.session";
const CHALLENGE_STORAGE_KEY = "ems.auth.challenge";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: "admin" | "staff" | "manager" | "installer" | "customer";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  token_expires_at?: string | null;
};

export type AuthChallenge = {
  challengeToken: string;
  email?: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getBearerToken(): string | null {
  return getAuthSession()?.token ?? null;
}

export function getAuthChallenge(): AuthChallenge | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(CHALLENGE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthChallenge;
  } catch {
    return null;
  }
}

export function setAuthChallenge(challenge: AuthChallenge) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(challenge));
}

export function clearAuthChallenge() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(CHALLENGE_STORAGE_KEY);
}
