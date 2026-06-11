import { useState, useEffect } from "react";
import HabitCard from "./HabitCard";
import Loading from "./Loading";

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
        <div className="m-10 mt-8 px-2 flex flex-col gap-4">
            <Loading></Loading>
        </div>
    )}

    return(
        <div className="m-10 mt-8 px-2 flex flex-col gap-4">
            <p className="font-bold text-3xl tracking-tight mb-2">Habits</p>
            {habits.map((habit) =>
                    <HabitCard key={habit.id}
                        habit={habit}
                    />
                )}
        </div>
    )
}