"use client";

import { Check, Flame, Activity, Trophy, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function HabitCard({ habit, onCheckin, onEdit, onDelete }) {
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [currentValue, setCurrentValue] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const target = habit.targetPerDay || 1;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        // Find today's check-in from recentCheckins
        const todayCheckin = habit.recentCheckins?.find(c => c.date === today);

        if (todayCheckin) {
            setCurrentValue(todayCheckin.value || 1);
            if ((todayCheckin.value || 1) >= target) {
                setCompleted(true);
            }
        } else {
            setCurrentValue(0);
            setCompleted(false);
        }
    }, [habit.recentCheckins, target]);

    const handleCheckin = async () => {
        setLoading(true);
        try {
            // Optimistic update
            const newValue = currentValue + 1;
            setCurrentValue(newValue);

            if (newValue >= target) {
                setCompleted(true);
            }

            await onCheckin(habit._id, 1); // Send increment value of 1
        } catch (error) {
            console.error("Checkin failed", error);
            // Revert on error
            setCurrentValue(currentValue);
            setCompleted(currentValue >= target);
        } finally {
            setLoading(false);
        }
    };

    const getFrequencyLabel = () => {
        if (!habit.activeDays || habit.activeDays.length === 7) return "Daily";
        if (habit.activeDays.length === 0) return "No days set";

        const days = ["S", "M", "T", "W", "T", "F", "S"];
        return habit.activeDays.map(d => days[d]).join(", ");
    };

    return (
        <div className="group glass-panel rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-indigo-500 relative overflow-visible">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Activity size={100} className="text-indigo-500 rotate-12" />
            </div>

            {/* Menu Button */}
            <div className="absolute top-4 right-4 z-20" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <MoreVertical size={20} />
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                onEdit(habit);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                        >
                            <Edit2 size={16} />
                            Edit Habit
                        </button>
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                onDelete(habit._id);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
                        >
                            <Trash2 size={16} />
                            Delete Habit
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    {habit.tags && habit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {habit.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {habit.name}
                        </h3>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {getFrequencyLabel()}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{habit.description}</p>

                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                            <Flame size={16} className="text-orange-500" />
                            <span>{habit.streak || 0} day streak</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Trophy size={16} className="text-yellow-500" />
                            <span>Best: {habit.longestStreak || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={() => !completed && !loading && handleCheckin()}
                        disabled={completed || loading}
                        className={`
                            relative overflow-hidden flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg
                            ${completed
                                ? "bg-emerald-500 text-white scale-110 shadow-emerald-500/40"
                                : "bg-white dark:bg-slate-800 text-slate-300 hover:text-indigo-500 hover:shadow-indigo-500/20 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500"
                            }
                        `}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : completed ? (
                            <Check size={28} strokeWidth={3} className="animate-in zoom-in duration-300" />
                        ) : target > 1 ? (
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{currentValue}</span>
                        ) : (
                            <Check size={28} strokeWidth={3} />
                        )}
                    </button>
                    {target > 1 && (
                        <span className="text-xs font-bold text-slate-400">
                            {currentValue} / {target}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(((habit.streak || 0) / 21) * 100, 100)}%` }}
                />
            </div>
            {/* Weekly Progress */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last 7 Days</p>
                    <p className="text-xs text-slate-400">{habit.activeDays.length === 7 ? "Every Day" : "Specific Days"}</p>
                </div>
                <div className="flex justify-between items-center">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dateStr = date.toISOString().split('T')[0];
                        const dayIndex = date.getDay(); // 0 = Sunday

                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const isFuture = date > new Date();
                        const isActiveDay = habit.activeDays.includes(dayIndex);
                        const checkin = habit.recentCheckins?.find(c => c.date === dateStr);
                        const isCompleted = checkin && checkin.value >= (habit.targetPerDay || 1);

                        let status = "neutral";
                        if (isCompleted) status = "completed";
                        else if (!isActiveDay) status = "skipped";
                        else if (isToday && !isCompleted) status = "pending";
                        else if (!isCompleted && isActiveDay && !isFuture) status = "missed";

                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400">
                                    {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                                </span>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${status === "completed" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110" :
                                        status === "missed" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500" :
                                            status === "pending" ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700" :
                                                "bg-transparent text-slate-300 dark:text-slate-600"
                                        }`}
                                    title={`${date.toLocaleDateString()} - ${status}`}
                                >
                                    {status === "completed" && <Check size={14} strokeWidth={3} />}
                                    {status === "missed" && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                                    {status === "skipped" && <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
