/**
 * API client with JWT injection — wraps fetch for authenticated requests.
 * Runs in browser only.
 */

function getToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    // localStorage may be unavailable in private browsing or some iOS contexts
    try {
      return sessionStorage.getItem('token');
    } catch {
      return null;
    }
  }
}

async function handleResponse(res: Response) {
  if (res.ok) return res.json();
  const err = await res.json().catch(() => ({ error: 'Unknown error' }));
  const error: any = new Error(err.error ?? 'Request failed');
  error.status = res.status;
  error.distanceMeters = err.distanceMeters;  // for geofence 422 errors

  // Handle expired JWT — clear token and redirect to login
  if (res.status === 401) {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    try { sessionStorage.removeItem('token'); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  throw error;
}

export const apiGet = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } }).then(handleResponse);

export const apiPost = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  }).then(handleResponse);

export const apiPut = (url: string, body: object) =>
  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  }).then(handleResponse);
