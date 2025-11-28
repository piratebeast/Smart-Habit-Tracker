"use client";

import CreateHabitModal from "@/components/CreateHabitModal";
import HabitCard from "@/components/HabitCard";
import { Plus, Trophy, Calendar, Zap, Sun, Moon, BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

export default function Home() {
    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState({ totalHabits: 0, perfectDays: 0, currentStreak: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();

    const [editingHabit, setEditingHabit] = useState(null);

    useEffect(() => {
        fetchHabits();
        fetchStats();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await fetch("/api/habits");
            const data = await res.json();
            if (data.success) {
                setHabits(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch habits", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const handleSaveHabit = async (habitData) => {
        try {
            const method = editingHabit ? "PUT" : "POST";
            const url = editingHabit ? `/api/habits/${editingHabit._id}` : "/api/habits";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(habitData),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Failed to save habit:", data);
                alert(data.error || "Failed to save habit. Please try again.");
                return;
            }

            if (data.success) {
                if (editingHabit) {
                    setHabits(habits.map(h => h._id === editingHabit._id ? data.data : h));
                } else {
                    setHabits([...habits, data.data]);
                }
                setIsModalOpen(false);
                setEditingHabit(null);
                fetchStats(); // Refresh stats
            }
        } catch (err) {
            console.error("Save habit error:", err);
            alert("An unexpected error occurred while saving the habit.");
        }
    };

    const handleDeleteHabit = async (habitId) => {
        if (!confirm("Are you sure you want to delete this habit?")) return;

        try {
            const res = await fetch(`/api/habits/${habitId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                setHabits((prev) => prev.filter((h) => h._id !== habitId));
                fetchStats(); // Refresh stats
            } else {
                alert(data.error || "Failed to delete habit");
            }
        } catch (error) {
            console.error("Failed to delete habit", error);
        }
    };

    const handleEditHabit = (habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleCheckin = async (habitId) => {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch("/api/checkins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                habitId,
                date: today,
                value: 1,
                note: "Daily checkin"
            }),
        });
        const data = await res.json();
        if (data.success) {
            console.log("Checkin success", data);
            // Ideally refetch or update local state to reflect streak change
            fetchHabits();
            fetchStats(); // Refresh stats
        }
    };

    return (
        <main className="min-h-screen p-8 pb-20 transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-float">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Smart <span className="text-gradient">Habits</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                            Build consistency, one day at a time.
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Link
                            href="/statistics"
                            className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
                            title="View Statistics"
                        >
                            <BarChart2 size={20} />
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
                            title="Toggle Theme"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => {
                                setEditingHabit(null);
                                setIsModalOpen(true);
                            }}
                            className="group flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span>New Habit</span>
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
                        >
                            <span>Sign Out</span>
                        </button>
                    </div>
                </header>

                {/* Stats Summary (Mockup) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Habits</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalHabits}</p>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Perfect Days</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.perfectDays}</p>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Streak</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.currentStreak} days</p>
                        </div>
                    </div>
                </div>

                {/* Habits Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : habits.length === 0 ? (
                    <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">No habits yet. Start your journey today!</p>
                        <button
                            onClick={() => {
                                setEditingHabit(null);
                                setIsModalOpen(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-lg"
                        >
                            Create your first habit
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {habits.map((habit) => (
                            <HabitCard
                                key={habit._id}
                                habit={habit}
                                onCheckin={handleCheckin}
                                onEdit={handleEditHabit}
                                onDelete={handleDeleteHabit}
                            />
                        ))}
                    </div>
                )}

                <CreateHabitModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingHabit(null);
                    }}
                    onSave={handleSaveHabit}
                    initialData={editingHabit}
                />
            </div>
        </main>
    );
}
