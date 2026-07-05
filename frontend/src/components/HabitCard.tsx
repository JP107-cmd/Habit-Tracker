import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { useCallback, useState, useEffect } from 'react';
import Loading from "./Loading";
import { api } from "./api";

type Habit = {
    id : number,
    name : string,
    description: string,
    icon: string,
    createdAt: string
}

function getFormattedTime(time : string) {
    return formatDistanceToNow(new Date(time))
}

export default function HabitCard({ habit, onEdit, onDeleted } : {habit : Habit, onEdit : (habit : Habit) => void, onDeleted : () => void}) {
    const [completed, setCompleted] = useState<boolean>(false)
    const { id, name, description, icon, createdAt } = habit;
    const [loading, setLoading] = useState<boolean>(true);
    const [currentStreak, setCurrentStreak] = useState<number | null>(null);
    const [numberOfCompletions, setNumberOfCompletions] = useState<number | null>(null);

    const handleDelete = async () => {
        try {
            await api.del("/" + id);
            onDeleted();
        } catch (e) {
            return;
        }
    }

    const checkCompletion = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<{ completedToday: boolean }>("/is-completed/" + id);
            setCompleted(data.completedToday);
            setLoading(false);
        } catch (e) {
            return;
        }
    }, [id]);

    useEffect(() => {
        checkCompletion()
        getStats()
    }, [checkCompletion])


    const recordCompletion = async () => {
        try {
            await api.post("/habit-completed", { id: habit.id });
            checkCompletion();
            return getStats();
        } catch (e) {
            return;
        }
    }

    const recordUndo = async () => {
        try {
            await api.post("/undo-completion", { id: habit.id });
            checkCompletion();
            return getStats();
        } catch (e) {
            return;
        }
    }

    const getStats = async () => {
        try {
            const data = await api.get<{ stats: { currentStreak: number; numberOfCompletions: number } }>("/stats/" + id);
            setCurrentStreak(data.stats.currentStreak);
            setNumberOfCompletions(data.stats.numberOfCompletions);
        } catch (e) {
            return;
        }
    }


    if (loading) {
        return <div className="flex flex-col gap-3 p-5 bg-[#262626] rounded-2xl border border-white/10 hover:border-white/20 transition-colors"><Loading/></div>
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
                <p className="text-xs text-neutral-500">Times completed: {numberOfCompletions}</p>
                <p className="text-xs text-neutral-500">Current streak: {currentStreak}</p>
                <p className="text-xs text-neutral-500">Created: {getFormattedTime(createdAt)} ago</p>
            </div>
            <div className="mt-1 flex flex-row justify-between">
                { !completed ?
                    <button className="w-fit px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 
                    transition-colors"
                    onClick={recordCompletion}
                    >Complete Habit</button>
                    :
                    <button className="w-fit px-5 py-2 text-sm font-medium rounded-lg bg-gray-400 text-white 
                    transition-colors"
                    onClick={recordUndo}
                    >Undo</button>
                }
                <button onClick={handleDelete} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors w-fit flex flex-row items-center gap-1.5">
                    <div className="w-4 shrink-0 flex items-center">
                        <img src="delete.svg"></img>
                    </div>
                    <p>Delete Habit</p>
                </button>
            </div>
        </div>
    )
}