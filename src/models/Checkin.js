import mongoose from 'mongoose';

const CheckinSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    habitId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD format
    value: { type: Number, default: 1 },
    note: { type: String },
}, { timestamps: true });

// Compound index for efficient querying of checkins for a habit on a specific date
CheckinSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.Checkin || mongoose.model('Checkin', CheckinSchema);
