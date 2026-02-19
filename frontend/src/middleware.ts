import { defineMiddleware } from 'astro:middleware';
import {
  getAccessTokenFromCookie,
  verifyAccessToken,
  decodeAccessToken,
} from '@lib/session';

const PROTECTED_PATHS = ['/cart', '/checkout', '/orders'];
const ADMIN_PATHS = ['/admin'];
const PUBLIC_PATHS = ['/', '/auth', '/products', '/api'];

function isProtectedRoute(pathname: string): boolean {
  return (
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    isAdminRoute(pathname)
  );
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PATHS.some(
    (p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/')),
  );
}

const BACKEND_URL = import.meta.env.BACKEND_URL ?? 'http://localhost:4000';

async function tryRefreshOnServer(
  cookieHeader: string,
): Promise<{ accessToken: string } | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    if (!response.ok) return null;
    const body = await response.json();
    return { accessToken: body.data?.accessToken ?? body.accessToken };
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // API routes pass through without auth checks
  if (pathname.startsWith('/api/')) {
    return next();
  }

  const cookieHeader = context.request.headers.get('cookie');
  const token = getAccessTokenFromCookie(cookieHeader);

  let user = token ? await verifyAccessToken(token) : null;

  // Token exists but verification failed (possibly expired) -- try refresh
  if (!user && token) {
    user = decodeAccessToken(token);
    if (user && cookieHeader) {
      const refreshed = await tryRefreshOnServer(cookieHeader);
      if (refreshed) {
        const newUser = await verifyAccessToken(refreshed.accessToken);
        if (newUser) {
          user = newUser;
          // Set new access_token cookie on the response
          const response = await next();
          response.headers.append(
            'Set-Cookie',
            `access_token=${refreshed.accessToken}; Path=/; Max-Age=900; SameSite=Strict`,
          );
          context.locals.user = user;
          return response;
        }
      }
    }
  }

  // No token at all -- try refresh with httpOnly cookie
  if (!user && !token && cookieHeader?.includes('refresh_token')) {
    const refreshed = await tryRefreshOnServer(cookieHeader);
    if (refreshed) {
      user = await verifyAccessToken(refreshed.accessToken);
      if (user) {
        const response = await next();
        response.headers.append(
          'Set-Cookie',
          `access_token=${refreshed.accessToken}; Path=/; Max-Age=900; SameSite=Strict`,
        );
        context.locals.user = user;
        return response;
      }
    }
  }

  context.locals.user = user ?? undefined;

  // Enforce protected routes
  if (isProtectedRoute(pathname) && !user) {
    return context.redirect('/auth/login');
  }

  // Enforce admin routes
  if (isAdminRoute(pathname) && user?.role !== 'ADMIN') {
    return context.redirect('/');
  }

  return next();
});
