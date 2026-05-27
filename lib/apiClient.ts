/**
 * API client with JWT injection — wraps fetch for authenticated requests.
 * Runs in browser only.
 */

function getToken(): string | null {
  try {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (t) return t;
  } catch { /* localStorage may be unavailable */ }
  try {
    return sessionStorage.getItem('token') ?? null;
  } catch {
    return null;
  }
}

/** Build headers — only attach Authorization when a real token exists */
function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

let isRedirecting = false;

async function handleResponse(res: Response) {
  if (res.ok) return res.json();
  const err = await res.json().catch(() => ({ error: 'Unknown error' }));
  const error: any = new Error(err.error ?? 'Request failed');
  error.status = res.status;
  error.distanceMeters = err.distanceMeters;  // for geofence 422 errors

  // Handle expired JWT — clear token and redirect to login
  // But don't redirect if we're already on /login or if this was the login request itself
  if (res.status === 401 && typeof window !== 'undefined') {
    const isLoginPage = window.location.pathname === '/login';
    const isLoginRequest = res.url?.includes('/api/auth/login');

    if (!isLoginPage && !isLoginRequest && !isRedirecting) {
      isRedirecting = true;
      try { localStorage.removeItem('token'); } catch { /* ignore */ }
      try { sessionStorage.removeItem('token'); } catch { /* ignore */ }
      window.location.href = '/login';
    }
  }

  throw error;
}

export const apiGet = (url: string) =>
  fetch(url, { headers: buildHeaders() }).then(handleResponse);

export const apiPost = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const apiPut = (url: string, body: object) =>
  fetch(url, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const apiDelete = (url: string) =>
  fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(),
  }).then(handleResponse);

