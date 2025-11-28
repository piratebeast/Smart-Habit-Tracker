import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // Assuming userId is a string from the provided data, could be ObjectId if referencing User model directly
    name: { type: String, required: true },
    description: { type: String },
    cadence: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    activeDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] }, // 0=Sunday, 6=Saturday
    targetPerDay: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
