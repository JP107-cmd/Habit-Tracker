import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";

export default function Login() {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isLoggedIn, loading, refreshAuth } = useAuth()

    useEffect(() => {
        if (!loading && isLoggedIn) {
            navigate("/dashboard");
        }
    }, [loading, isLoggedIn, navigate]);

    if (loading) return <p>Loading</p>;
    if (isLoggedIn) return null;

    const handleSubmit = async (event: any) => {
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
                return setError("Error: " + e);
            }
        }
        sendReq();
    }

    if (error) {
        return(<p>{error}</p>)
    }

    return(
        <div className="flex items-center">
            <div>
                <div>
                    <h1>Habit Tracker</h1>
                    <h4>Track your habits!</h4>
                    <h6>Enter your name to get started or to log back in</h6>
                </div>
                <form className="flex flex-row gap-1" onSubmit={handleSubmit}>
                    <input 
                    type="name" className="text-black" value={name} id="name"
                    onChange={(e) => setName(e.target.value)}>
                    </input>
                    <button type="submit" className="bg-gray-500">Log In</button>
                </form>
            </div>
        </div>
    )
}