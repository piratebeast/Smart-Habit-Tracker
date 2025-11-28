"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowLeft, BarChart2, Calendar, Sun, Moon } from "lucide-react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

export default function StatisticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    // Custom Tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {payload[0].value} Check-ins
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <main className="min-h-screen p-8 pb-20 transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-float">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                <BarChart2 className="text-indigo-500" size={32} />
                                Productivity <span className="text-gradient">Stats</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium">
                                Visualize your progress and habits.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass-panel p-6 rounded-3xl">
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Habits</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalHabits || 0}</p>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl">
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Perfect Days</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.perfectDays || 0}</p>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl">
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Current Streak</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.currentStreak || 0} <span className="text-sm font-normal text-slate-500">days</span></p>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="glass-panel p-8 rounded-3xl">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Calendar size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Productivity by Day of Week</h2>
                            </div>

                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats?.productivityByDay || []}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 14 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 14 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }} />
                                        <Bar dataKey="totalCheckins" radius={[8, 8, 0, 0]}>
                                            {(stats?.productivityByDay || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={theme === 'dark' ? '#818cf8' : '#6366f1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
