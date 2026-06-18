import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

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
    const { id, name, description, icon, createdAt } = habit;

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
                console.log(e)
            }
        }
        sendReq();
    }
    
    return (
        <div className="flex flex-col gap-3 p-5 bg-[#262626] rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
            <div className="pb-3 border-b border-white/10">
            <h1 className="font-semibold text-lg tracking-tight">{icon} {name}</h1>
            </div>
            <div className="space-y-1">
                <p className="text-neutral-300">{description}</p>
                <p className="text-xs text-neutral-500">Created: {getFormattedTime(createdAt)} ago</p>
            </div>
            <div className="mt-1 flex flex-row justify-between">
                <button onClick={() => onEdit(habit)} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 hover:text-white transition-colors w-fit flex flex-row items-center gap-1.5">
                    <div className="w-4 shrink-0 flex items-center">
                        <img src="edit.svg"></img>
                    </div>
                    <p>Edit Habit</p>
                </button>
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