export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getAuthUserId } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// POST - Create new worker
export async function POST(req: Request) {
  const adminId = getAuthUserId(req);
  const body = await req.json();
  await connectDB();

  // Validate required fields
  const required = ['fullName', 'mobile', 'username', 'password', 'role', 'salaryPerDay', 'minDailyWorkHours', 'bankAccountNumber', 'aadhaarNumber'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  // Check for duplicate username/mobile
  const existing = await User.findOne({ $or: [{ username: body.username.toLowerCase() }, { mobile: body.mobile }] });
  if (existing) {
    return NextResponse.json({ error: 'Username or mobile number already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await User.create({
    fullName:           body.fullName,
    mobile:             body.mobile,
    username:           body.username.toLowerCase(),
    passwordHash,
    role:               body.role,
    salaryPerDay:       body.salaryPerDay,
    minDailyWorkHours:  body.minDailyWorkHours,
    bankAccountNumber:  body.bankAccountNumber,   // pre-save hook handles encryption
    aadhaarNumber:      body.aadhaarNumber,        // pre-save hook handles encryption
    emergencyContacts:  body.emergencyContacts || [],
    createdBy:          adminId,
  });

  return NextResponse.json({ userId: user._id, username: user.username }, { status: 201 });
}

// GET - List all workers (paginated) — S7: Masked PII in list view
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ role: { $ne: 'admin' } })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ role: { $ne: 'admin' } }),
  ]);

  // S7: Mask PII — show last 4 digits only in list view
  const masked = users.map(u => {
    let maskedBank = '••••••••';
    let maskedAadhaar = '••••••••';
    try {
      const bankFull = decrypt(u.bankAccountNumber);
      maskedBank = '••••' + bankFull.slice(-4);
    } catch { /* leave masked */ }
    try {
      const aadhaarFull = decrypt(u.aadhaarNumber);
      maskedAadhaar = '••••••••' + aadhaarFull.slice(-4);
    } catch { /* leave masked */ }

    return {
      ...u,
      bankAccountNumber: maskedBank,
      aadhaarNumber: maskedAadhaar,
    };
  });

  return NextResponse.json({ users: masked, total, page, totalPages: Math.ceil(total / limit) });
}
