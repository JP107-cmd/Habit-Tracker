import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import { api } from "../components/api";

const MIN_PASSWORD_LENGTH = 8;

export default function Login() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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

    const showError = (message: string) => {
        setError(message);
        setErrorState(errorState + 1);
    }

    const toggleMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setPassword("");
        setConfirmPassword("");
    }

    const handleSubmit = async (event: any) => {

        event.preventDefault();

        if (username.length === 0 || password.length === 0) {
            return showError("Error: username and password are required");
        }

        if (mode === "signup") {
            if (password.length < MIN_PASSWORD_LENGTH) {
                return showError(`Error: password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            }

            if (password !== confirmPassword) {
                return showError("Error: passwords do not match");
            }
        }

        const sendReq = async () => {
            try {
                await api.post(mode === "signup" ? "/signup" : "/login", { username, password });
                await refreshAuth();
                navigate("/dashboard");
            } catch (e) {
                showError("" + e)
            }
        }
        sendReq();
    }

    return(
        <div className="flex items-center justify-center min-h-screen px-4 flex-col gap-5">
            <div className="w-full max-w-sm p-8 bg-[#1e1e1e] rounded-2xl border border-white/10 shadow-2xl shadow-black/40 flex flex-col gap-6">
                <div className="mx-auto w-20">
                    <img src="/favicon.svg" className="w-full rounded-2xl"/>
                </div>
                <div className="space-y-1.5 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent">Habit Tracker</h1>
                    <h4 className="text-neutral-300">Track your habits!</h4>
                    <h6 className="text-sm text-neutral-500">
                        {mode === "login" ? "Log in to continue" : "Create an account to get started"}
                    </h6>
                </div>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <input
                        type="text" placeholder="Username" className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors" value={username} id="username"
                        onChange={(e) => setUsername(e.target.value)}>
                        </input>
                        <input
                        type="password" placeholder="Password" className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors" value={password} id="password"
                        onChange={(e) => setPassword(e.target.value)}>
                        </input>
                        {mode === "signup" &&
                        <input
                        type="password" placeholder="Confirm password" className="w-full px-3 py-2 rounded-lg bg-[#161616] border border-white/10 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-colors" value={confirmPassword} id="confirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}>
                        </input>
                        }
                        <button type="submit" className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gold-500 text-black hover:bg-gold-400 transition-colors">
                            {mode === "login" ? "Log In" : "Sign Up"}
                        </button>
                    </form>
                    <button type="button" onClick={toggleMode} className="text-sm text-neutral-400 hover:text-gold-300 transition-colors">
                        {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
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
