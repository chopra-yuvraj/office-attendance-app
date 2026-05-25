import mongoose, { Schema, Document } from 'mongoose';
import { CorrectionSchema } from './AttendanceRecord';

export type GarmentCategory = 'Suit' | 'Saree' | 'All Over' | 'Others';
export type PunchStatus = 'pending' | 'approved' | 'corrected';

export interface IMachineLog {
  machineNumber: number;         // sequence: 1, 2, 3 …
  driveFileId: string;           // geo-tagged machine photo
  driveWebViewLink: string;
  productionCount: number;
  designNo: string;
  category: GarmentCategory;
  coords: { lat: number; lng: number };
  capturedAt: Date;
}

export interface IProductionLog extends Document {
  attendanceRecordId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalMachinesOperated: number;
  machineLogs: IMachineLog[];
  isComplete: boolean;           // true when machineLogs.length === totalMachinesOperated
  status: PunchStatus;
  corrections: any[];
  createdAt: Date;
  updatedAt: Date;
}

const MachineLogSchema = new Schema({
  machineNumber:   { type: Number, required: true },
  driveFileId:     { type: String, required: true },
  driveWebViewLink:{ type: String, required: true },
  productionCount: { type: Number, required: true, min: 0 },
  designNo:        { type: String, required: true, trim: true },
  category:        { type: String, enum: ['Suit','Saree','All Over','Others'], required: true },
  coords:          { lat: Number, lng: Number },
  capturedAt:      { type: Date, required: true },
}, { _id: false });

const ProductionLogSchema = new Schema<IProductionLog>({
  attendanceRecordId: { type: Schema.Types.ObjectId, ref: 'AttendanceRecord', required: true },
  userId:             { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date:               { type: Date, required: true },
  totalMachinesOperated: { type: Number, required: true, min: 1 },
  machineLogs:        [MachineLogSchema],
  isComplete:         { type: Boolean, default: false },
  status:             { type: String, enum: ['pending','approved','corrected'], default: 'pending' },
  corrections:        [CorrectionSchema],
}, { timestamps: true });

ProductionLogSchema.index({ attendanceRecordId: 1 }, { unique: true });
ProductionLogSchema.index({ userId: 1, date: -1 });

export default mongoose.models.ProductionLog || mongoose.model<IProductionLog>('ProductionLog', ProductionLogSchema);
