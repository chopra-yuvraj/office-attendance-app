import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  mobile: string;
}

export interface IUser extends Document {
  fullName: string;
  mobile: string;
  username: string;             // admin-assigned, unique
  passwordHash: string;         // bcrypt hash
  role: 'office' | 'factory' | 'admin';
  salaryPerDay: number;
  minDailyWorkHours: number;   // e.g. 8 (hours)
  bankAccountNumber: string;   // encrypted at rest (AES-256)
  aadhaarNumber: string;       // encrypted at rest (AES-256)
  emergencyContacts: IEmergencyContact[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;  // Admin userId
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  fullName:           { type: String, required: true, trim: true },
  mobile:             { type: String, required: true, unique: true },
  username:           { type: String, required: true, unique: true, lowercase: true },
  passwordHash:       { type: String, required: true },
  role:               { type: String, enum: ['office', 'factory', 'admin'], required: true },
  salaryPerDay:       { type: Number, required: true, min: 0 },
  minDailyWorkHours:  { type: Number, required: true, min: 1, max: 24 },
  bankAccountNumber:  { type: String, required: true },  // store encrypted
  aadhaarNumber:      { type: String, required: true },  // store encrypted
  emergencyContacts:  [{
    name:   { type: String, required: true },
    mobile: { type: String, required: true }
  }],
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// S6: PII encryption is handled explicitly in API routes (admin/users POST and PUT)
// rather than via pre-save hooks due to Mongoose 9.x typing constraints.
// The routes call encrypt() before passing values to create/save.

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
