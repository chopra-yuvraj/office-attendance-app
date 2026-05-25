import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  type: 'sick' | 'casual';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true },
  type:      { type: String, enum: ['sick', 'casual'], required: true },
  reason:    { type: String, maxlength: 500 },
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy:{ type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:{ type: Date, default: null },
}, { timestamps: true });

LeaveRequestSchema.index({ userId: 1, date: 1 });

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
