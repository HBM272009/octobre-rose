import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(true);
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("patient"); // Default to patient
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: role, // ✅ Pass selected role to auth user metadata
                        },
                    },
                });

                if (error) throw error;

                setMessage(
                    "Account created. You can now log in if email confirmation is disabled, or check your email."
                );
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Octobre Rose</h1>
            <h2>{isSignUp ? "Create an account" : "Welcome back"}</h2>

            <form onSubmit={handleSubmit}>
                {isSignUp && (
                    <>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            required
                        />

                        <div style={{ marginBottom: "15px", textAlign: "left" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                I am registering as a:
                            </label>
                            <select
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                }}
                            >
                                <option value="patient">Patient 💗</option>
                                <option value="doctor">Doctor / Healthcare Professional 🩺</option>
                            </select>
                        </div>
                    </>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password (at least 8 characters)"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                />

                {error && <p role="alert">{error}</p>}
                {message && <p role="status">{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading
                        ? "Please wait..."
                        : isSignUp
                          ? "Sign up"
                          : "Log in"}
                </button>
            </form>

            <button
                type="button"
                onClick={() => {
                    setIsSignUp((previous) => !previous);
                    setError("");
                    setMessage("");
                }}
            >
                {isSignUp
                    ? "Already have an account? Log in"
                    : "Need an account? Sign up"}
            </button>
        </main>
    );
}