import { jwtVerify, decodeJwt, type JWTPayload } from 'jose';

const JWT_SECRET = import.meta.env.JWT_SECRET ?? process.env.JWT_SECRET ?? '';
const ACCESS_TOKEN_COOKIE = 'access_token';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface JwtClaims extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

export function getAccessTokenFromCookie(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export async function verifyAccessToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const claims = payload as JwtClaims;
    return {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
    };
  } catch {
    return null;
  }
}

export function decodeAccessToken(token: string): SessionUser | null {
  try {
    const claims = decodeJwt(token) as JwtClaims;
    if (!claims.sub || !claims.email || !claims.role) return null;
    return {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
    };
  } catch {
    return null;
  }
}
