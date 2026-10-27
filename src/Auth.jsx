import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ lang = "en" }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("patient");
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState("");

    const txt = {
        en: {
            titleIn: "Welcome Back",
            titleUp: "Create an Account",
            subIn: "Sign in to access your dashboard",
            subUp: "Register to manage care plans and messages",
            name: "Full Name",
            namePlaceholder: "e.g. Jane Doe",
            roleLabel: "I am a:",
            patient: "Patient",
            doctor: "Doctor / Healthcare Provider",
            email: "Email Address",
            password: "Password",
            signInBtn: "Sign In",
            signUpBtn: "Sign Up",
            processing: "Processing...",
            toggleToUp: "Don't have an account? Register",
            toggleToIn: "Already registered? Sign in",
            successUp: "Account created successfully! You can now log in."
        },
        fr: {
            titleIn: "Connexion",
            titleUp: "Créer un compte",
            subIn: "Connectez-vous pour accéder à votre espace",
            subUp: "Inscrivez-vous pour gérer vos soins et messages",
            name: "Nom complet",
            namePlaceholder: "ex. Marie Dupont",
            roleLabel: "Je suis :",
            patient: "Patient(e)",
            doctor: "Médecin / Professionnel de santé",
            email: "Adresse e-mail",
            password: "Mot de passe",
            signInBtn: "Se connecter",
            signUpBtn: "S'inscrire",
            processing: "En cours...",
            toggleToUp: "Pas encore de compte ? S'inscrire",
            toggleToIn: "Déjà inscrit ? Se connecter",
            successUp: "Compte créé avec succès ! Vous pouvez vous connecter."
        }
    }[lang];

    async function handleAuth(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            });
            if (error) {
                setMessage(error.message);
            } else {
                setMessage(txt.successUp);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setMessage(error.message);
            }
        }
        setLoading(false);
    }

    return (
        <div className="status-screen" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem" }}>
            <div className="panel auth-card" style={{ width: "100%", maxWidth: "420px", padding: "2rem", background: "#fff", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px -1px rgba(225, 29, 72, 0.05)" }}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "#881337", marginBottom: "0.3rem" }}>
                        {isSignUp ? txt.titleUp : txt.titleIn}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        {isSignUp ? txt.subUp : txt.subIn}
                    </p>
                </div>

                {message && (
                    <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", textAlign: "center", fontWeight: "600" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {isSignUp && (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{txt.name}</label>
                                <input
                                    type="text"
                                    placeholder={txt.namePlaceholder}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{txt.roleLabel}</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.9rem" }}
                                >
                                    <option value="patient">{txt.patient}</option>
                                    <option value="doctor">{txt.doctor}</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{txt.email}</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{txt.password}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cta-button"
                        style={{ marginTop: "8px", width: "100%", padding: "10px" }}
                    >
                        {loading ? txt.processing : isSignUp ? txt.signUpBtn : txt.signInBtn}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
                    >
                        {isSignUp ? txt.toggleToIn : txt.toggleToUp}
                    </button>
                </div>
            </div>
        </div>
    );
}