import { useAuth } from "../auth/AuthProvider"

export default function Navbar() {

    const { logout } = useAuth();

    return(
        <div className="sticky top-0 z-10 w-full px-6 py-4 flex items-center justify-between bg-[#1a1a1a]/90 backdrop-blur border-b border-gold-500/10">
            <div className="font-semibold tracking-tight text-lg flex flex-row items-center gap-2">
                <img src="favicon.svg" className="w-9"></img>
                <h1>Habit Tracker</h1>
            </div>
            <div>
                <button
                    onClick={logout} className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 hover:border-gold-500/30 hover:text-gold-300 transition-colors ">
                    Log out
                </button>
            </div>
        </div>
    )
}