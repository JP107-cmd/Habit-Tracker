import { useState, useEffect } from "react";
import HabitCard from "./HabitCard";

type Habit = {
    id : number,
    name : string,
    description: string,
    icon: string,
    createdAt: string
}

export default function Habits() {
    const [error, setError] = useState<string |null>();
    const [habits, setHabits] = useState<Habit[]>([]);

    useEffect( () => {
        const fetchInfo = async () => {
            try {
            const res = await fetch("http://localhost:3000/api/habits/all-habits", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            const data = await res.json();
            setHabits(data.habits);

            } catch(e) {
                setError("error: " + e);
            }
        }
    fetchInfo();
    }, [])

    if (!habits) {
        return (
            <div>
                Loading
            </div>
    )}

    return(
        <div className="m-4 p-4 bg-[#373737] rounded-md h-100% flex flex-col gap-5">
            <p className="font-bold text-4xl ml-6">Habits</p>
            {habits.map((habit) => 
                    <HabitCard 
                        habit={habit}
                    />
                )}
        </div>
    )
}