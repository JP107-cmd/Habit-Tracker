import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import { api } from "../components/api";

export default function Login() {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [errorState, setErrorState] = useState<number>(0);
    const navigate = useNavigate();
    const { isLoggedIn, loading, refreshAuth } = useAuth()

    useEffect(() => {
        if (!loading && isLoggedIn) {
            navigate("/dashboard");
        }
    }, [loading, isLoggedIn, navigate]);

    useEffect(() => {
        if (!error) return;
        setVisible(true);
        setTimeout(() => {
            setVisible(false)
            setError(null);
        }, 5000)
    }, [error, errorState])

    if (loading) return <Loading></Loading>;
    if (isLoggedIn) return null;
    const handleSubmit = async (event: any) => {

        event.preventDefault();

        if (name.length === 0) {
            setError("Error: Please enter your name");
            return setErrorState(errorState+1);
        }
 
        const sendReq = async () => {
            try {
                await api.post("/login", { name });
                await refreshAuth();
                navigate("/dashboard");
            } catch (e) {
                setError(""+e)
                return setErrorState(errorState+1);
            }
        }
        sendReq();
    }

    return(
        <div className="flex items-center justify-center min-h-screen px-4 flex-col gap-5">
            <div className="w-full max-w-sm p-8 bg-[#1e1e1e] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 flex flex-col gap-6">
                <div className="mx-auto w-20">
                    <img src="/web-app-manifest-512x512.png" className="w-full rounded-2xl"/>
                </div>
                <div className="space-y-1.5 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Habit Tracker</h1>
                    <h4 className="text-neutral-300">Track your habits!</h4>
                    <h6 className="text-sm text-neutral-500">Enter your name to get started or to log back in</h6>
                </div>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <input
                        type="text" placeholder="Your name" className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors" value={name} id="name"
                        onChange={(e) => setName(e.target.value)}>
                        </input>
                        <button type="submit" className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">Log In</button>
                    </form>
                </div>
                {visible ? 
                <div className={"fixed bottom-5 right-5 px-4 py-3 bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl backdrop-blur shadow-lg"}>
                    <p className="text-sm">{error}</p>
                </div>
                    :
                <>
                </>
                }
            </div>
    )
}