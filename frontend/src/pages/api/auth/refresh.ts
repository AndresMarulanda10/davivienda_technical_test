import type { APIRoute } from 'astro';

const BACKEND_URL = import.meta.env.BACKEND_URL ?? 'http://localhost:4000';

export const POST: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') ?? '';

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });

    if (!backendResponse.ok) {
      return new Response(JSON.stringify({ error: 'Refresh failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await backendResponse.json();
    const accessToken = body.data?.accessToken ?? body.accessToken;

    // Forward Set-Cookie headers from backend (new refresh token)
    const headers = new Headers({ 'Content-Type': 'application/json' });

    const setCookies = backendResponse.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      headers.append('Set-Cookie', cookie);
    }

    // Also set the access_token as a readable cookie for the middleware
    headers.append(
      'Set-Cookie',
      `access_token=${accessToken}; Path=/; Max-Age=900; SameSite=Strict`,
    );

    return new Response(JSON.stringify({ accessToken }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
