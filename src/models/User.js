import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String },
    timezone: { type: String, default: 'UTC' },
    settings: {
        remindersEnabled: { type: Boolean, default: false },
        reminderHour: { type: Number, default: 9 },
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
