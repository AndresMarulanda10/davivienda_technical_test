import { atom, computed } from 'nanostores';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export const $accessToken = atom<string | null>(null);
export const $currentUser = atom<User | null>(null);

export const $isAuthenticated = computed($currentUser, (user) => user !== null);
export const $isAdmin = computed(
  $currentUser,
  (user) => user?.role === 'ADMIN',
);

function syncCookie(token: string | null): void {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `access_token=${token}; path=/; max-age=900; samesite=strict`;
  } else {
    document.cookie = 'access_token=; path=/; max-age=0; samesite=strict';
  }
}

export function setAuth(token: string, user: User) {
  $accessToken.set(token);
  $currentUser.set(user);
  syncCookie(token);
}

export function clearAuth() {
  $accessToken.set(null);
  $currentUser.set(null);
  syncCookie(null);
}
