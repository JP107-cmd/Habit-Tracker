import { useState } from "react"

type newHabitType = {
    name : string,
    description: string,
    icon: string,
}

export default function NewHabit() {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [icon, setIcon] = useState<string>("");
    const [error, setError] = useState<string | null>();

    const handleSubmit = async () => {
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

        console.log(newHabit)

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
                }

            } catch (e) {
                console.log(e)
                return setError("Error: "+ e);
            }
        }
        sendReq();
    }

    return (
        <div>
            <div>
                <h1>Create a new Habit</h1>
            </div>
            <div>
                <form onSubmit={handleSubmit}>
                    <input 
                    type="name" className="text-black" value={name} id="name"
                    onChange={(e) => setName(e.target.value)}>
                    </input>
                    <input 
                    type="description" className="text-black" value={description} id="description"
                    onChange={(e) => setDescription(e.target.value)}>
                    </input>
                    <input 
                    type="icon" className="text-black" value={icon} id="icon"
                    onChange={(e) => setIcon(e.target.value)}>
                    </input>
                    <button type="submit">Create</button>
                </form>
            </div>
        </div>
    )
}