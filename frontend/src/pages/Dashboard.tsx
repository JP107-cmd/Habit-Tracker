import Habits from "../components/Habits"
import NewHabit from "../components/NewHabit"
import Navbar from "../components/Navbar"

export default function Dashboard() {
    return (
        <div className="min-h-screen pb-16">
            <Navbar></Navbar>
            <Habits></Habits>
            <NewHabit/>
        </div>
    )
}