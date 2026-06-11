import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import Loading from "../components/Loading";

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
        setTimeout(() => {setVisible(false)}, 5000)
    }, [error, errorState])

    if (loading) return <Loading></Loading>;
    if (isLoggedIn) return null;
    const handleSubmit = async (event: any) => {

        if (name.length === 0) {
            setError("Error: Please enter your name");
            return setErrorState(errorState+1);
        }

        event.preventDefault();
 
        const sendReq = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/habits/login",
                    {
                        credentials: "include",
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });
                if (!response.ok) {
                    throw new Error("Bad Request");
                } else {
                    await refreshAuth();
                    navigate("/dashboard");

                }

            } catch (e) {
                setError(""+e)
                return setErrorState(errorState+1);
            }
        }
        sendReq();
    }

    return(
        <div className="flex items-center mt-16 min-h-screen px-4 flex-col gap-5">
            <div className="w-full max-w-3xl p-8 bg-[#1e1e1e] rounded-2xl border border-white/10 flex flex-col gap-8">
                <div className="mx-auto max-w-[30%]">
                    <img src="/web-app-manifest-512x512.png"/>
                </div>
                <div className="space-y-1 mb-6 mx-auto">
                    <h1 className="text-6xl font-semibold tracking-tight">Habit Tracker</h1>
                    <h4 className="text-neutral-300">Track your habits!</h4>
                    <h6 className="text-sm text-neutral-500">Enter your name to get started or to log back in</h6>
                </div>
                    <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
                        <input
                        type="name" className="flex-1 px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors" value={name} id="name"
                        onChange={(e) => setName(e.target.value)}>
                        </input>
                        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">Log In</button>
                    </form>
                </div>
                {visible ? 
                <div className={"fixed bottom-5 right-5 p-8 bg-red-600 border-2 border-red-900 rounded-xl"}>
                    <p>{error}</p>
                </div>
                    :
                <>
                </>
                }
            </div>
    )
}