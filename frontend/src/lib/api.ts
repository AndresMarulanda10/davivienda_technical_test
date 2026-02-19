import { $accessToken, clearAuth } from '@stores/auth.store';

const BACKEND_URL =
  typeof window !== 'undefined'
    ? (import.meta.env.PUBLIC_BACKEND_URL ?? 'http://localhost:4000')
    : (import.meta.env.BACKEND_URL ?? 'http://localhost:4000');

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export class ApiRequestError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = $accessToken.get();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${BACKEND_URL}/api${path}`;

  const response = await fetch(url, {
    ...rest,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retryToken = $accessToken.get();
      if (retryToken) {
        headers['Authorization'] = `Bearer ${retryToken}`;
      }
      const retryResponse = await fetch(url, {
        ...rest,
        headers,
        credentials: 'include',
      });
      if (!retryResponse.ok) {
        const errorBody = (await retryResponse.json()) as ApiError;
        throw new ApiRequestError(
          retryResponse.status,
          errorBody.error,
          errorBody.message,
        );
      }
      const retryResult = (await retryResponse.json()) as ApiResponse<T>;
      return retryResult.data;
    }
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw new ApiRequestError(401, 'Unauthorized', 'Session expired');
  }

  if (!response.ok) {
    const errorBody = (await response.json()) as ApiError;
    throw new ApiRequestError(
      response.status,
      errorBody.error,
      errorBody.message,
    );
  }

  const result = (await response.json()) as ApiResponse<T>;
  return result.data;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) return false;
    const result = (await response.json()) as ApiResponse<{
      accessToken: string;
    }>;
    $accessToken.set(result.data.accessToken);
    return true;
  } catch {
    return false;
  }
}
