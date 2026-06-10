type Habit = {
    id : number,
    name : string,
    description: string,
    icon: string,
    createdAt: string
}

export default function HabitCard({ habit } : {habit : Habit}) {
    const { id, name, description, icon, createdAt } = habit;

    const handleClick = async () => {
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
                }

            } catch (e) {
                console.log(e)
            }
        }
        sendReq();
    }
    
    return (
        <div className="ml-4 p-4 bg-[#4b4b4b] rounded-2xl">
            <div>
            <h1 className="font-bold text-xl border-b-white border-b-2 ">{icon} {name}</h1>
            </div>
            <div>
                <p>{description}</p>
                <p>Created At: {createdAt}</p>
            </div>

            <div className="bg-red-400 rounded-lg w-fit p-1">
                <button onClick={handleClick}>Delete Habit</button>
            </div>
        </div>
    )
}