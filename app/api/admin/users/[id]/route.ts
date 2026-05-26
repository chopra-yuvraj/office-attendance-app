export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { encrypt, decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// GET - Get single worker profile with decrypted PII (admin only)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const user = await User.findById(params.id).lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...user,
    bankAccountNumber: decrypt(user.bankAccountNumber),
    aadhaarNumber:     decrypt(user.aadhaarNumber),
    passwordHash:      undefined,  // NEVER expose hash
  });
}

// PUT - Edit worker profile / reset password
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  await connectDB();

  const user = await User.findById(params.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Update allowed fields
  if (body.fullName)           user.fullName = body.fullName;
  if (body.mobile)             user.mobile = body.mobile;
  if (body.role)               user.role = body.role;
  if (body.salaryPerDay != null) user.salaryPerDay = body.salaryPerDay;
  if (body.minDailyWorkHours != null) user.minDailyWorkHours = body.minDailyWorkHours;
  if (body.bankAccountNumber)  user.bankAccountNumber = encrypt(body.bankAccountNumber);
  if (body.aadhaarNumber)      user.aadhaarNumber = encrypt(body.aadhaarNumber);
  if (body.emergencyContacts)  user.emergencyContacts = body.emergencyContacts;
  if (body.isActive !== undefined) user.isActive = body.isActive;

  // Password reset
  if (body.password) {
    user.passwordHash = await bcrypt.hash(body.password, 12);
  }

  await user.save();

  return NextResponse.json({ success: true, userId: user._id });
}
