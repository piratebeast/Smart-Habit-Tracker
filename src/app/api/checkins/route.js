import dbConnect from '@/lib/db';
import Checkin from '@/models/Checkin';
import Streak from '@/models/Streak';
import Habit from '@/models/Habit';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { habitId, value, note } = body;
    const userId = session.user.id;

    try {
        // Check if check-in already exists for today
        const today = new Date().toISOString().split('T')[0];

        const checkin = await Checkin.findOneAndUpdate(
            { userId, habitId, date: today },
            { $inc: { value: value || 1 }, note }, // Increment value by the provided value, or 1 if not provided. Also update note.
            { new: true, upsert: true, setDefaultsOnInsert: true } // Create if doesn't exist, return new doc, apply defaults on insert
        );

        // Update Streak
        let streak = await Streak.findOne({ userId, habitId });

        // Fetch the habit to check target
        const habit = await Habit.findById(habitId);
        const targetMet = checkin.value >= (habit.targetPerDay || 1);

        if (targetMet) {
            if (!streak) {
                streak = await Streak.create({
                    userId,
                    habitId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastCheckinDate: today
                });
            } else {
                // Only update streak if we haven't already counted today
                if (streak.lastCheckinDate !== today) {
                    const lastCheckin = new Date(streak.lastCheckinDate);
                    const checkinDate = new Date(today);
                    const diffTime = Math.abs(checkinDate - lastCheckin);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        streak.currentStreak += 1;
                        if (streak.currentStreak > streak.longestStreak) {
                            streak.longestStreak = streak.currentStreak;
                        }
                    } else {
                        streak.currentStreak = 1;
                    }
                    streak.lastCheckinDate = today;
                    await streak.save();
                }
            }
        }

        return NextResponse.json({ success: true, data: { checkin, streak } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
