import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PUT: Update a habit
export async function PUT(request, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const userId = session.user.id;

    try {
        // Ensure the habit belongs to the user
        const habit = await Habit.findOne({ _id: id, userId });

        if (!habit) {
            return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
        }

        // Update fields
        const updatedHabit = await Habit.findByIdAndUpdate(
            id,
            { ...body },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: updatedHabit });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// DELETE: Soft delete (archive) a habit
export async function DELETE(request, { params }) {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    try {
        // Ensure the habit belongs to the user
        const habit = await Habit.findOne({ _id: id, userId });

        if (!habit) {
            return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
        }

        // Soft delete: Set archived to true
        habit.archived = true;
        await habit.save();

        return NextResponse.json({ success: true, data: { message: "Habit archived successfully" } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
