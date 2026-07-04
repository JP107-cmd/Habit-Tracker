import { useState } from "react"

type newHabitType = {
    name : string,
    description: string,
    icon: string,
}

export default function NewHabit({ onCreated, onClose } : { onCreated : () => void, onClose : () => void }) {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [icon, setIcon] = useState<string>("");
    const [error, setError] = useState<string | null>();
    const formStyling : string = "w-full mt-1.5 px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        let missingFields : Array<string> = [];

        if (name.length === 0) {
            missingFields.push("name ");
        }

        if (description.length === 0) {
            missingFields.push("description ");
        }

        if (icon.length === 0) {
            missingFields.push("icon")
        }

        if (missingFields.length !== 0) {
            return setError("Missing fields " + missingFields)
        }

        const newHabit : newHabitType = {
            name : name,
            description : description,
            icon : icon
        }

        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/new-habit",
                    {
                        credentials: "include",
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newHabit)
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    setName("");
                    setDescription("");
                    setIcon("");
                    onCreated();
                    onClose();
                }

            } catch (e) {
                return setError("Error: "+ e);
            }
        }
        sendReq();
    }

    return (
        <div className="fixed inset-0 z-50 m-auto h-fit w-full max-w-2xl p-6 rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)]">
            <div className="flex flex-row items-center justify-between">
                <h1 className="text-lg font-semibold tracking-tight">Create a new Habit</h1>
                <div className="w-5 shrink-0 cursor-pointer hover:opacity-70 transition-opacity" onClick={onClose}>
                    <img src="x.svg"></img>
                </div>
            </div>
            <div>
                <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col w-full mt-5 space-y-5">
                    <div>
                        <h1 className="text-sm font-medium text-neutral-400">Name</h1>
                        <input
                        type="text" className={formStyling} value={name} id="name"
                        onChange={(e) => setName(e.target.value)} placeholder="Name of your habit">
                        </input>
                    </div>
                    <div>
                        <h1 className="text-sm font-medium text-neutral-400">Description</h1>
                        <input
                        type="text" className={formStyling} value={description} id="description"
                        onChange={(e) => setDescription(e.target.value)} placeholder="Description of your habit">
                        </input>
                    </div>
                    <div>
                        <h1 className="text-sm font-medium text-neutral-400">Icon</h1>
                        <input
                        type="text" className={formStyling} value={icon} id="icon"
                        onChange={(e) => setIcon(e.target.value)} placeholder="Icon to represent your habit (please put an emoji I have no type-checking 🥺)">
                        </input>
                    </div>
                    <button
                    type="submit" className="w-fit px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >Create</button>
                </form>
            </div>
        </div>
    )
}