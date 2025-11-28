import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import Checkin from '@/models/Checkin';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // 1. Fetch all habits (active and not archived) to determine expected checkins
        // We might want to include archived habits for historical accuracy if we want "Perfect Days" from the past to count even if the habit is now archived.
        // For simplicity and "current" relevance, let's stick to currently active habits for "Current Streak", but "Perfect Days" might need historical context.
        // However, the prompt implies a simple "Perfect Days" count. Let's assume "Perfect Day" means: For a given day, did I do all the habits I was SUPPOSED to do?
        // If I had 3 habits then, and I did 3, it's perfect.
        // Determining "what I was supposed to do" in the past is hard if habits changed.
        // SIMPLIFICATION: A "Perfect Day" is a day where the number of checkins equals the number of active habits *for that day*.
        // This is an approximation. If a user adds a habit today, yesterday might lose "perfect" status if we just count current active habits.
        // To do this correctly, we'd need habit history.
        // Given the schema, we don't have history.
        // BEST EFFORT: Use current active habits.

        const habits = await Habit.find({ userId, archived: false }).lean();
        const checkins = await Checkin.find({ userId }).lean();

        if (habits.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalHabits: 0,
                    perfectDays: 0,
                    currentStreak: 0
                }
            });
        }

        // Group checkins by date
        const checkinsByDate = {};
        checkins.forEach(c => {
            if (!checkinsByDate[c.date]) {
                checkinsByDate[c.date] = new Set();
            }
            checkinsByDate[c.date].add(c.habitId.toString());
        });

        // Calculate Perfect Days
        let perfectDaysCount = 0;
        const perfectDates = new Set();

        // We only care about dates where there was at least one checkin or we check past days?
        // Usually "Perfect Days" is a count of days where you hit 100%.
        // We can iterate through all dates in checkinsByDate.
        // But what if a day had 0 checkins but 0 habits were scheduled? (e.g. rest day). Is that perfect?
        // Usually "Perfect Day" implies action. Let's stick to days with checkins for now, or iterate last X days.
        // Let's iterate through dates present in checkinsByDate for "Perfect Days" count.

        // Better approach for Streak: Look backwards from today.

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper to check if a date is perfect
        const isPerfectDay = (dateStr) => {
            const dateObj = new Date(dateStr);
            const dayOfWeek = dateObj.getDay(); // 0=Sun, 6=Sat

            // Filter habits active on this day of week
            const expectedHabits = habits.filter(h => h.activeDays.includes(dayOfWeek));

            if (expectedHabits.length === 0) return false; // No habits scheduled, not a "performance" day? Or is it perfect? Let's say no.

            const completedHabitIds = checkinsByDate[dateStr] || new Set();

            // Check if all expected habits are in completed set
            const allCompleted = expectedHabits.every(h => completedHabitIds.has(h._id.toString()));
            return allCompleted;
        };

        // Calculate Total Perfect Days (based on history of checkins)
        Object.keys(checkinsByDate).forEach(dateStr => {
            if (isPerfectDay(dateStr)) {
                perfectDaysCount++;
                perfectDates.add(dateStr);
            }
        });

        // Calculate Current Streak
        // Count consecutive perfect days ending yesterday or today.
        let currentStreak = 0;
        let checkDate = new Date(today);

        // Check today first
        const todayStr = checkDate.toISOString().split('T')[0];
        if (perfectDates.has(todayStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // If today is not perfect (yet), maybe streak ended yesterday.
            // But if today is NOT perfect, the streak is technically 0 if we are strict?
            // Usually apps allow "today" to be in progress without breaking streak from yesterday.
            // So if today is incomplete, we check yesterday.
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (perfectDates.has(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Calculate Productivity by Day of Week
        const pipeline = [
            {
                "$match": { "userId": userId }
            },
            {
                "$addFields": {
                    "convertedDate": { "$toDate": "$date" }
                }
            },
            {
                "$project": {
                    "dayOfWeek": { "$dayOfWeek": "$convertedDate" }
                }
            },
            {
                "$group": {
                    "_id": "$dayOfWeek",
                    "totalCheckins": { "$sum": 1 }
                }
            },
            {
                "$sort": { "_id": 1 }
            },
            {
                "$project": {
                    "_id": 0,
                    "day": {
                        "$switch": {
                            "branches": [
                                { "case": { "$eq": ["$_id", 1] }, "then": "Sunday" },
                                { "case": { "$eq": ["$_id", 2] }, "then": "Monday" },
                                { "case": { "$eq": ["$_id", 3] }, "then": "Tuesday" },
                                { "case": { "$eq": ["$_id", 4] }, "then": "Wednesday" },
                                { "case": { "$eq": ["$_id", 5] }, "then": "Thursday" },
                                { "case": { "$eq": ["$_id", 6] }, "then": "Friday" },
                                { "case": { "$eq": ["$_id", 7] }, "then": "Saturday" }
                            ],
                            "default": "Unknown"
                        }
                    },
                    "totalCheckins": "$totalCheckins"
                }
            }
        ];

        const productivityByDay = await Checkin.aggregate(pipeline);

        return NextResponse.json({
            success: true,
            data: {
                totalHabits: habits.length,
                perfectDays: perfectDaysCount,
                currentStreak: currentStreak,
                productivityByDay: productivityByDay
            }
        });

    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
