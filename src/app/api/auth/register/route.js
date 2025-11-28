import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
    await dbConnect();
    const { name, email, password } = await request.json();

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            passwordHash,
            displayName: name,
        });

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
