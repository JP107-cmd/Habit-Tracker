import HabitCard from "./HabitCard";
import Loading from "./Loading";
import type { Habit } from "../pages/Dashboard";

type HabitsProps = {
    habits: Habit[],
    loading: boolean,
    onEdit: (habit : Habit) => void,
    error: string | null,
    onChanged: () => void,
    onNewHabit: () => void
}

export default function Habits({ habits, loading, onEdit, error, onChanged, onNewHabit }: HabitsProps) {
    if (loading) {
        return (
        <div className="m-10 mt-8 px-2 flex flex-col gap-4">
            <Loading></Loading>
        </div>
    )}

    return(
        <div className="m-10 mt-8 px-2 flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <p className="font-bold text-3xl tracking-tight mb-2">Habits</p>
                <button
                    onClick={onNewHabit}
                    className="w-fit px-5 py-2 text-sm font-semibold rounded-lg bg-gold-500 text-black hover:bg-gold-400 transition-colors"
                >Create Habit</button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {habits.map((habit) =>
                    <HabitCard key={habit.id}
                        habit={habit}
                        onEdit={onEdit}
                        onChanged={onChanged}
                    />
                )}
        </div>
    )
}
