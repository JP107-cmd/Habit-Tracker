import Habits from "../components/Habits"
import NewHabit from "../components/NewHabit"

export default function Dashboard() {
    return (
        <div className="h-max">
            <Habits></Habits>
            <NewHabit/>
        </div>
    )
}