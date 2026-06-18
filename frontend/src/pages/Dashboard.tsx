import Habits from "../components/Habits"
import NewHabit from "../components/NewHabit"
import Navbar from "../components/Navbar"
import { useState, useEffect, useCallback } from "react";
import EditPopup from "../components/EditPopup";

export type Habit = {
    id : number,
    name : string,
    description: string,
    icon: string,
    createdAt: string
}

export default function Dashboard() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [newHabitOpen, setNewHabitOpen] = useState<boolean>(false);

    const fetchHabits = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3000/api/habits/all-habits", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`${res.status}`);
            }
            const data = await res.json();
            setHabits(data.habits);
            setError(null);
        } catch (e) {
            setError("error: " + e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    return (
        <div className="min-h-screen pb-16">
            <Navbar></Navbar>
            <Habits habits={habits} loading={loading} error={error} onEdit={setSelectedHabit} onChanged={fetchHabits} onNewHabit={() => setNewHabitOpen(true)} />
            {newHabitOpen &&
            <NewHabit onCreated={fetchHabits} onClose={() => setNewHabitOpen(false)} />
            }
            {selectedHabit && 
            <EditPopup
                onClose={() => {setSelectedHabit(null)}}
                onUpdate={fetchHabits}
                habit={selectedHabit}
            />
            }
        </div>
    )
}
