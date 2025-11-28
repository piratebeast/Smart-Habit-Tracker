import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import Streak from '@/models/Streak';

import Checkin from '@/models/Checkin';

export async function GET(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const habits = await Habit.find({ userId, archived: false }).lean();
        const streaks = await Streak.find({ userId }).lean();

        // Fetch check-ins for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCheckins = await Checkin.find({
            userId,
            date: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
        }).lean();

        const habitsWithStreaks = habits.map(habit => {
            const streak = streaks.find(s => s.habitId.toString() === habit._id.toString());
            const habitCheckins = recentCheckins.filter(c => c.habitId.toString() === habit._id.toString());

            return {
                ...habit,
                streak: streak ? streak.currentStreak : 0,
                longestStreak: streak ? streak.longestStreak : 0,
                lastCheckinDate: streak ? streak.lastCheckinDate : null,
                recentCheckins: habitCheckins.map(c => ({
                    date: c.date,
                    value: c.value
                }))
            };
        });

        return NextResponse.json({ success: true, data: habitsWithStreaks });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = session.user.id;

    try {
        const habit = await Habit.create({ ...body, userId });
        return NextResponse.json({ success: true, data: habit }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
