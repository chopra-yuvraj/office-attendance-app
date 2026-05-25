import mongoose, { Schema, Document } from 'mongoose';

export type PunchStatus = 'pending' | 'approved' | 'corrected';
export type AttendanceFlag = 'full_day' | 'half_day_alert' | 'absent' | 'leave_approved';

export interface IPunchData {
  timestamp: Date;
  coords: { lat: number; lng: number };
  driveFileId: string;      // selfie stored on Google Drive
  driveWebViewLink: string;
}

export interface ICorrection {
  correctedBy: mongoose.Types.ObjectId;
  correctedAt: Date;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
}

export interface IAttendanceRecord extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;                           // normalized to midnight UTC
  inPunch: IPunchData | null;
  outPunch: IPunchData | null;          // null until OUT is submitted
  totalWorkedMinutes: number | null;    // computed on OUT
  hoursFlag: AttendanceFlag | null;     // set during admin review
  status: PunchStatus;
  isManualEntry: boolean;              // admin-created entry
  adminNotes: string;
  corrections: ICorrection[];          // append-only audit trail
  leaveRequestId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const PunchDataSchema = new Schema({
  timestamp:       { type: Date, required: true },
  coords:          { lat: Number, lng: Number },
  driveFileId:     { type: String, required: true },
  driveWebViewLink:{ type: String, required: true },
}, { _id: false });

const CorrectionSchema = new Schema({
  correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  correctedAt: { type: Date, default: Date.now },
  field:       String,
  oldValue:    Schema.Types.Mixed,
  newValue:    Schema.Types.Mixed,
  reason:      String,
}, { _id: false });

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  userId:              { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:                { type: Date, required: true },
  inPunch:             { type: PunchDataSchema, default: null },
  outPunch:            { type: PunchDataSchema, default: null },
  totalWorkedMinutes:  { type: Number, default: null },
  hoursFlag:           { type: String, enum: ['full_day','half_day_alert','absent','leave_approved'], default: null },
  status:              { type: String, enum: ['pending','approved','corrected'], default: 'pending' },
  isManualEntry:       { type: Boolean, default: false },
  adminNotes:          { type: String, default: '' },
  corrections:         [CorrectionSchema],
  leaveRequestId:      { type: Schema.Types.ObjectId, ref: 'LeaveRequest', default: null },
}, { timestamps: true });

// Compound index: one record per user per day
AttendanceRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceRecordSchema.index({ status: 1, date: -1 });

export { CorrectionSchema };
export default mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
