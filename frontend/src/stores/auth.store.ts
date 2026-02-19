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

export function setAuth(token: string, user: User) {
  $accessToken.set(token);
  $currentUser.set(user);
}

export function clearAuth() {
  $accessToken.set(null);
  $currentUser.set(null);
}
