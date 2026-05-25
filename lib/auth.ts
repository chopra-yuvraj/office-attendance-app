/**
 * Auth helpers for extracting user identity from request headers.
 * The JWT middleware (middleware.ts) injects x-user-id and x-user-role
 * into request headers after verification.
 */

export function getAuthUserId(req: Request): string {
  const userId = req.headers.get('x-user-id');
  if (!userId) throw new Error('Missing x-user-id header — is middleware configured?');
  return userId;
}

export function getAuthUserRole(req: Request): string {
  const role = req.headers.get('x-user-role');
  if (!role) throw new Error('Missing x-user-role header — is middleware configured?');
  return role;
}

/**
 * Normalize any Date to midnight UTC for consistent daily record keying.
 */
export function normalizeToMidnightUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
