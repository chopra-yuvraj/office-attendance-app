import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS = ['/api/admin'];
const AUTH_PATHS  = ['/api/punch', '/api/leave', '/api/upload'];

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  try {
    const { payload } = await jwtVerify(token, secret);
    const isAdminPath = ADMIN_PATHS.some(p => req.nextUrl.pathname.startsWith(p));
    if (isAdminPath && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Attach userId to request headers for downstream handlers
    const headers = new Headers(req.headers);
    headers.set('x-user-id', payload.sub as string);
    headers.set('x-user-role', payload.role as string);
    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = { matcher: ['/api/admin/:path*', '/api/punch/:path*', '/api/leave/:path*', '/api/upload/:path*'] };
