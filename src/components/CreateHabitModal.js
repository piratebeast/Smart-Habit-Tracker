"use client";

import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";

const DAYS = [
    { id: 0, label: "S", name: "Sunday" },
    { id: 1, label: "M", name: "Monday" },
    { id: 2, label: "T", name: "Tuesday" },
    { id: 3, label: "W", name: "Wednesday" },
    { id: 4, label: "T", name: "Thursday" },
    { id: 5, label: "F", name: "Friday" },
    { id: 6, label: "S", name: "Saturday" },
];

export default function CreateHabitModal({ isOpen, onClose, onSave, initialData = null }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [frequency, setFrequency] = useState("daily"); // daily, specific
    const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [targetPerDay, setTargetPerDay] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || "");
            setDescription(initialData.description || "");
            setFrequency(initialData.cadence === "daily" && initialData.activeDays.length === 7 ? "daily" : "specific");
            setSelectedDays(initialData.activeDays || [0, 1, 2, 3, 4, 5, 6]);
            setSelectedTags(initialData.tags || []);
            setTargetPerDay(initialData.targetPerDay || 1);
        } else if (isOpen && !initialData) {
            // Reset for new habit
            setName("");
            setDescription("");
            setFrequency("daily");
            setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
            setSelectedTags([]);
            setTargetPerDay(1);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const toggleDay = (dayId) => {
        if (selectedDays.includes(dayId)) {
            if (selectedDays.length > 1) {
                setSelectedDays(selectedDays.filter((d) => d !== dayId));
            }
        } else {
            setSelectedDays([...selectedDays, dayId].sort());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...initialData, // Preserve ID and other fields if editing
                name,
                description,
                cadence: "daily", // Keeping it simple for now
                activeDays: frequency === "daily" ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
                tags: selectedTags,
                targetPerDay: targetPerDay
            });
            onClose();
        } catch (error) {
            console.error("Failed to create habit", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {initialData ? "Edit Habit" : "New Habit"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Drink Water"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Description (Optional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., 8 glasses a day"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Daily Target (Optional)
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                value={targetPerDay}
                                onChange={(e) => setTargetPerDay(parseInt(e.target.value) || 1)}
                                className="w-24 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-center font-bold"
                            />
                            <span className="text-sm text-slate-500 dark:text-slate-400">times per day</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Frequency
                        </label>
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setFrequency("daily")}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${frequency === "daily"
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                Every Day
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequency("specific")}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${frequency === "specific"
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                Specific Days
                            </button>
                        </div>

                        {frequency === "specific" && (
                            <div className="flex justify-between gap-1">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${selectedDays.includes(day.id)
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105"
                                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                        title={day.name}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {["Health", "Work", "Social", "Family", "Learning", "Mindfulness"].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        if (selectedTags.includes(tag)) {
                                            setSelectedTags(selectedTags.filter(t => t !== tag));
                                        } else {
                                            setSelectedTags([...selectedTags, tag]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTags.includes(tag)
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105"
                                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{initialData ? "Save Changes" : "Create Habit"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
