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
        <div className="status-screen">
            <div className="panel auth-card" style={{ width: "100%", maxWidth: "400px", padding: "1.75rem" }}>
                <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.35rem", color: "#2b2d42" }}>
                        {isSignUp ? txt.titleUp : txt.titleIn}
                    </h2>
                    <p style={{ color: "#6c757d", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {isSignUp ? txt.subUp : txt.subIn}
                    </p>
                </div>

                {message && (
                    <div style={{ padding: "10px", background: "#f8f9fa", border: "1px solid #f1d6e2", color: "#d63384", borderRadius: "6px", marginBottom: "15px", fontSize: "0.85rem", textAlign: "center" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {isSignUp && (
                        <>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{txt.name}</label>
                                <input
                                    type="text"
                                    placeholder={txt.namePlaceholder}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{txt.roleLabel}</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", fontSize: "0.9rem" }}
                                >
                                    <option value="patient">{txt.patient}</option>
                                    <option value="doctor">{txt.doctor}</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{txt.email}</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>{txt.password}</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cta-button"
                        style={{ marginTop: "8px", width: "100%" }}
                    >
                        {loading ? txt.processing : isSignUp ? txt.signUpBtn : txt.signInBtn}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{ background: "none", border: "none", color: "#d63384", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500" }}
                    >
                        {isSignUp ? txt.toggleToIn : txt.toggleToUp}
                    </button>
                </div>
            </div>
        </div>
    );
}