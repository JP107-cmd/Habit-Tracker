import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { useCallback, useState, useEffect } from 'react';
import Loading from "./Loading";

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
        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/"+id,
                    {
                        credentials: "include",
                        method: "DELETE",
                        headers: { 'Content-Type': 'application/json' },
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    onDeleted();
                }

            } catch (e) {
                return;
            }
        }
        sendReq();
    }

    const checkCompletion = useCallback(async () => {
        const sendReq = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:3000/api/habits/is-completed/"+id,
                    {
                        credentials: "include",
                        method: "GET",
                        headers: { 'Content-Type': 'application/json' },
                    });
                if (!response.ok) {
                    return
                } else {
                    const data = await response.json();
                    setCompleted(data.completedToday);
                    setLoading(false);
                }
            } catch (e) {
                return;
            }
        }
        sendReq();
    }, []);

    useEffect(() => {
        checkCompletion()
        getStats()
    }, [checkCompletion])


    const recordCompletion = async () => {
        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/habit-completed",
                    {
                        credentials: "include",
                        method: "POST",
                        body: JSON.stringify({id : habit.id}),
                        headers: { 'Content-Type': 'application/json' },
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    checkCompletion();
                    return getStats();
                }

            } catch (e) {
                return;
            }
        }
        sendReq();
    }

    const recordUndo = async () => {
        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/undo-completion",
                    {
                        credentials: "include",
                        method: "POST",
                        body: JSON.stringify({id : habit.id}),
                        headers: { 'Content-Type': 'application/json' },
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    checkCompletion();
                    return getStats();
                }

            } catch (e) {
                return;
            }
        }
        sendReq();
    }

    const getStats = async () => {
        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/stats/"+id,
                    {
                        credentials: "include",
                        method: "GET",
                        headers: { 'Content-Type': 'application/json' },
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    const data = await response.json();
                    setCurrentStreak(data.stats.currentStreak);
                    setNumberOfCompletions(data.stats.numberOfCompletions);
                }

            } catch (e) {
                return;
            }
        }
        sendReq();
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