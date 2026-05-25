import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  await connectDB();

  const user = await User.findOne({ username: username.toLowerCase(), isActive: true });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({ sub: user._id.toString(), role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(secret);

  return NextResponse.json({ token, role: user.role, name: user.fullName });
}
