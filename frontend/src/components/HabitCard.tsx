import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { useEffect, useState } from 'react';
import type { Habit } from "../pages/Dashboard";
import { api } from "./api";

function getFormattedTime(time : string) {
    return formatDistanceToNow(new Date(time))
}

export default function HabitCard({ habit, onEdit, onChanged } : {habit : Habit, onEdit : (habit : Habit) => void, onChanged : () => void}) {
    const { id, name, description, icon, createdAt, completedToday, currentStreak, numberOfCompletions } = habit;
    const [busy, setBusy] = useState<boolean>(false);

    // Optimistic view of completion state; reconciled with props after each refetch.
    const [optimistic, setOptimistic] = useState<{
        completedToday: boolean;
        currentStreak: number;
        numberOfCompletions: number;
    } | null>(null);

    useEffect(() => {
        setOptimistic(null);
    }, [completedToday, currentStreak, numberOfCompletions]);

    const view = optimistic ?? { completedToday, currentStreak, numberOfCompletions };

    const handleDelete = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await api.del("/" + id);
            onChanged();
        } catch (e) {
            setBusy(false);
        }
    }

    const toggleCompletion = async () => {
        if (busy) return;
        setBusy(true);

        const next = view.completedToday
            ? {
                completedToday: false,
                currentStreak: Math.max(0, view.currentStreak - 1),
                numberOfCompletions: Math.max(0, view.numberOfCompletions - 1),
            }
            : {
                completedToday: true,
                currentStreak: view.currentStreak + 1,
                numberOfCompletions: view.numberOfCompletions + 1,
            };
        setOptimistic(next);

        try {
            await api.post(view.completedToday ? "/undo-completion" : "/habit-completed", { id });
            onChanged();
        } catch (e) {
            setOptimistic(null); // revert on failure
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-col gap-3 p-5 bg-[#262626] rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="pb-3 border-b border-white/10 flex flex-row w-full justify-between">
                <h1 className="font-semibold text-lg tracking-tight">{icon} {name}</h1>
                <button onClick={() => onEdit(habit)} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 hover:text-white transition-colors w-fit flex flex-row items-center gap-1.5">
                    <div className="w-4 shrink-0 flex items-center">
                        <img src="edit.svg"></img>
                    </div>
                    <p>Edit Habit</p>
                </button>
            </div>
            <div className="space-y-1">
                <p className="text-neutral-300">{description}</p>
                <p className="text-xs text-neutral-500">Times completed: {view.numberOfCompletions}</p>
                <p className="text-xs text-neutral-500">Current streak: {view.currentStreak}</p>
                <p className="text-xs text-neutral-500">Created: {getFormattedTime(createdAt)} ago</p>
            </div>
            <div className="mt-1 flex flex-row justify-between">
                { !view.completedToday ?
                    <button className="w-fit px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500
                    transition-colors disabled:opacity-60"
                    onClick={toggleCompletion}
                    disabled={busy}
                    >Complete Habit</button>
                    :
                    <button className="w-fit px-5 py-2 text-sm font-medium rounded-lg bg-gray-400 text-white
                    transition-colors disabled:opacity-60"
                    onClick={toggleCompletion}
                    disabled={busy}
                    >Undo</button>
                }
                <button onClick={handleDelete} disabled={busy} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors w-fit flex flex-row items-center gap-1.5 disabled:opacity-60">
                    <div className="w-4 shrink-0 flex items-center">
                        <img src="delete.svg"></img>
                    </div>
                    <p>Delete Habit</p>
                </button>
            </div>
        </div>
    )
}
