import mongoose from 'mongoose';

const StreakSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    habitId: { type: String, required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckinDate: { type: String }, // YYYY-MM-DD
}, { timestamps: true });

export default mongoose.models.Streak || mongoose.model('Streak', StreakSchema);
