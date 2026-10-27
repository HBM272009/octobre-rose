import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import "./App.css";

export default function App() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [recipientId, setRecipientId] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [medications, setMedications] = useState([]);
    const [newMedName, setNewMedName] = useState("");
    const [newDosage, setNewDosage] = useState("");
    const [newTime, setNewTime] = useState("");
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Navigation & UI States
    const [showAuthScreen, setShowAuthScreen] = useState(false);
    const [activeView, setActiveView] = useState("dashboard");
    const [lang, setLang] = useState("en");

    // Modal & Form States
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [donationAmount, setDonationAmount] = useState("25");
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [contactSubmitted, setContactSubmitted] = useState(false);

    const t = {
        en: {
            appName: "Rosetta",
            tagline: "Breast Health Companion",
            heroTitle: "Rosetta, your companion through treatment",
            heroSub: "Connecting patients and healthcare teams with structured daily care plans, medication tracking, and direct secure messaging.",
            getStarted: "Get Started",
            learnMore: "Learn More ↓",
            navHome: "← Home",
            navDashboard: "Go to Dashboard →",
            signInReg: "Sign In / Register",
            logout: "Log out",
            donateBtn: "Donate",
            navAbout: "About Us",
            navContact: "Contact",
            awarenessEyebrow: "AWARENESS & PREVENTION",
            awarenessTitle: "Understanding Early Detection",
            card1Title: "Early Screening",
            card1Body: "Regular medical checkups and screenings increase treatment efficacy significantly. Awareness remains key.",
            card2Title: "Structured Care",
            card2Body: "Managing daily medications, appointments, and symptoms requires an intuitive, clear care dashboard.",
            card3Title: "Continuous Support",
            card3Body: "Direct communication channels between patients and care teams improve outcomes and comfort.",
            whyEyebrow: "PLATFORM FEATURES",
            whyTitle: "Designed for Patients & Care Teams",
            feat1Title: "Medication Reminders",
            feat1Body: "Track daily schedules, dosages, and completed treatments easily.",
            feat2Title: "Direct Messaging",
            feat2Body: "Real-time communication with your doctor for remote support and reassurance.",
            feat3Title: "Secure Platform",
            feat3Body: "Built with standard Row-Level Security ensuring user privacy and role isolation.",
            aboutEyebrow: "ABOUT ROSETTA",
            aboutTitle: "Our Focus & Mission",
            aboutBody: "Rosetta bridges the gap between healthcare providers and patients. We provide tools to make daily care management simple, accessible, and accurate.",
            contactEyebrow: "GET IN TOUCH",
            contactTitle: "Contact Our Care Team",
            contactSub: "Have questions or need assistance? Send us a message.",
            contactName: "Your Name",
            contactEmail: "Email Address",
            contactMsg: "Message",
            contactSend: "Send Message",
            contactSuccess: "Thank you! Your message has been received.",
            donateTitle: "Support Patient Care",
            donateSub: "Your mock donation helps provide care kits and support tools for patients.",
            donateSuccess: "Thank you for your generous donation!",
            donateClose: "Close",
            footerDesc: "Rosetta Healthcare Companion · Empowering patient journeys worldwide.",
            footerPrivacy: "Privacy Policy",
            footerTerms: "Terms of Service",
            patientSpace: "PATIENT DASHBOARD",
            doctorSpace: "DOCTOR WORKSPACE",
            welcomePatient: "Hello, ",
            welcomeDoctor: "Welcome, Dr. ",
            patientSub: "Track your treatment plan and stay connected with your healthcare provider.",
            doctorSub: "Monitor patient updates and respond to direct consultations.",
            selectPatient: "Select Patient:",
            selectDoctor: "Select Doctor:",
            noPatients: "No patients registered in the workspace yet.",
            noDoctors: "No doctors available in the workspace right now.",
            noMessages: "No messages yet.",
            typeMsg: "Type a message...",
            send: "Send",
            todayMed: "Today's Medication",
            scheduled: "scheduled",
            dailyPlan: "Daily treatment list",
            dosesDone: "Completed Doses",
            completedOf: "completed of",
            progressToday: "Today's progress",
            carePlan: "CARE PLAN",
            medSchedule: "Medication Schedule",
            medNamePlace: "Medication name",
            dosagePlace: "Dosage (e.g. 20mg)",
            addReminder: "Add Reminder",
            noMeds: "No medications scheduled yet.",
            undo: "Undo",
            markTaken: "Mark as Taken",
            messagesTitle: "Messages",
            messagesEyebrow: "COMMUNICATION",
            backHome: "← Back to Home"
        },
        fr: {
            appName: "Rosetta",
            tagline: "Accompagnement Santé",
            heroTitle: "Rosetta, votre plateforme d'accompagnement",
            heroSub: "Faciliter le suivi quotidien des traitements et la communication directe entre les patients et l'équipe médicale.",
            getStarted: "Commencer",
            learnMore: "En savoir plus ↓",
            navHome: "← Accueil",
            navDashboard: "Accéder à l'espace →",
            signInReg: "Connexion / Inscription",
            logout: "Déconnexion",
            donateBtn: "Faire un don",
            navAbout: "À propos",
            navContact: "Contact",
            awarenessEyebrow: "SENSIBILISATION & PRÉVENTION",
            awarenessTitle: "L'importance du dépistage précoce",
            card1Title: "Dépistage Précoce",
            card1Body: "Des examens réguliers permettent d'améliorer considérablement l'efficacité des traitements.",
            card2Title: "Suivi Structuré",
            card2Body: "Organiser les prises de médicaments et rendez-vous grâce à un tableau de bord clair.",
            card3Title: "Support Continu",
            card3Body: "La communication directe avec l'équipe soignante apporte sécurité et tranquillité d'esprit.",
            whyEyebrow: "FONCTIONNALITÉS",
            whyTitle: "Conçu pour les patients et soignants",
            feat1Title: "Rappels de traitements",
            feat1Body: "Suivez les horaires quotidiens, dosages et validez les prises en un clic.",
            feat2Title: "Messagerie directe",
            feat2Body: "Échanges en temps réel avec votre médecin pour un accompagnement à distance.",
            feat3Title: "Espace Sécurisé",
            feat3Body: "Plateforme sécurisée garantissant la confidentialité stricte des données médicales.",
            aboutEyebrow: "À PROPOS DE ROSETTA",
            aboutTitle: "Notre Mission",
            aboutBody: "Rosetta vise à simplifier la prise en charge quotidienne des traitements tout en maintenant un lien direct avec l'équipe médicale.",
            contactEyebrow: "CONTACT",
            contactTitle: "Contacter l'équipe soignante",
            contactSub: "Une question ou besoin d'assistance ? Envoyez-nous un message.",
            contactName: "Votre nom",
            contactEmail: "Adresse e-mail",
            contactMsg: "Message",
            contactSend: "Envoyer le message",
            contactSuccess: "Merci ! Votre message a bien été envoyé.",
            donateTitle: "Soutenir les soins aux patients",
            donateSub: "Votre don simulé aide à financer le matériel d'accompagnement.",
            donateSuccess: "Merci infiniment pour votre don !",
            donateClose: "Fermer",
            footerDesc: "Rosetta · Plateforme d'accompagnement médical et suivi personnalisé.",
            footerPrivacy: "Politique de confidentialité",
            footerTerms: "Conditions d'utilisation",
            patientSpace: "ESPACE PATIENT",
            doctorSpace: "ESPACE MÉDECIN",
            welcomePatient: "Bonjour, ",
            welcomeDoctor: "Bienvenue, Dr. ",
            patientSub: "Suivez votre traitement quotidien et restez en contact avec votre médecin.",
            doctorSub: "Suivez le parcours de vos patients et répondez aux messages.",
            selectPatient: "Sélectionner un patient :",
            selectDoctor: "Sélectionner un médecin :",
            noPatients: "Aucun patient inscrit pour le moment.",
            noDoctors: "Aucun médecin disponible pour le moment.",
            noMessages: "Aucun message pour l'instant.",
            typeMsg: "Écrire un message...",
            send: "Envoyer",
            todayMed: "Médicaments du jour",
            scheduled: "programmé(s)",
            dailyPlan: "Programme quotidien",
            dosesDone: "Doses prises",
            completedOf: "sur",
            progressToday: "Progression aujourd'hui",
            carePlan: "PLAN DE SOINS",
            medSchedule: "Programme des traitements",
            medNamePlace: "Nom du médicament",
            dosagePlace: "Dosage (ex. 20mg)",
            addReminder: "Ajouter",
            noMeds: "Aucun médicament programmé.",
            undo: "Annuler",
            markTaken: "Marquer comme pris",
            messagesTitle: "Messagerie",
            messagesEyebrow: "COMMUNICATION",
            backHome: "← Retour"
        }
    }[lang];

    const toggleLang = () => setLang(l => l === "en" ? "fr" : "en");

    // Fetch medications
    useEffect(() => {
        if (!profile || profile.role !== "patient") return;

        async function fetchMedications() {
            const { data, error } = await supabase
                .from("medication_reminders")
                .select("*")
                .eq("patient_id", profile.id)
                .order("scheduled_time", { ascending: true });

            if (!error && data) {
                setMedications(data);
            }
        }

        fetchMedications();
    }, [profile]);

    async function handleAddMedication(e) {
        e.preventDefault();
        if (!newMedName || !newTime) return;

        const today = new Date().toISOString().split("T")[0];
        const fullDateTime = `${today}T${newTime}:00`;

        const { data, error } = await supabase
            .from("medication_reminders")
            .insert([
                {
                    patient_id: profile.id,
                    medication_name: newMedName,
                    dosage: newDosage || "1 dose",
                    scheduled_time: fullDateTime,
                    is_taken: false,
                },
            ])
            .select();

        if (error) {
            alert(error.message);
        } else if (data) {
            setMedications([...medications, data[0]]);
            setNewMedName("");
            setNewDosage("");
            setNewTime("");
        }
    }

    async function toggleMedication(id, currentStatus) {
        const { error } = await supabase
            .from("medication_reminders")
            .update({ is_taken: !currentStatus })
            .eq("id", id);

        if (!error) {
            setMedications(
                medications.map((med) =>
                    med.id === id ? { ...med, is_taken: !currentStatus } : med
                )
            );
        }
    }

    useEffect(() => {
        let mounted = true;

        async function initializeSession() {
            const { data, error } = await supabase.auth.getSession();
            if (!mounted) return;
            if (error) setProfileError(error.message);
            setSession(data?.session ?? null);
            setLoading(false);
        }

        initializeSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setProfile(null);
            setProfileError("");

            if (!session?.user) {
                setProfileLoading(false);
                return;
            }

            setProfileLoading(true);

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, full_name, role")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (cancelled) return;

                if (error) {
                    setProfileError(error.message);
                } else if (!data) {
                    setProfileError("Profile not found.");
                } else {
                    setProfile(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setProfileError(error.message || "Unable to load profile.");
                }
            } finally {
                if (!cancelled) setProfileLoading(false);
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.id]);

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        setActiveView("dashboard");
        if (error) setProfileError(error.message);
    }

    useEffect(() => {
        if (!profile) return;

        async function fetchUsers() {
            const targetRole = profile.role === "patient" ? "doctor" : "patient";
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, role")
                .eq("role", targetRole);

            if (!error && data && data.length > 0) {
                setAvailableUsers(data);
                setRecipientId(data[0].id);
            }
        }

        fetchUsers();
    }, [profile]);

    useEffect(() => {
        if (!profile || !recipientId) return;

        async function fetchMessages() {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(
                    `and(sender_id.eq.${profile.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${profile.id})`
                )
                .order("created_at", { ascending: true });

            if (!error && data) setMessages(data);
        }

        fetchMessages();

        const channel = supabase
            .channel("realtime-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMsg = payload.new;
                    if (
                        (newMsg.sender_id === profile.id && newMsg.receiver_id === recipientId) ||
                        (newMsg.sender_id === recipientId && newMsg.receiver_id === profile.id)
                    ) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id, recipientId]);

    async function handleSendMessage(e) {
        e.preventDefault();
        if (!newMessage.trim() || !recipientId) return;

        const { error } = await supabase.from("messages").insert([
            {
                sender_id: profile.id,
                receiver_id: recipientId,
                content: newMessage,
            },
        ]);

        if (error) {
            alert(error.message);
        } else {
            setNewMessage("");
        }
    }

    function handleDonateSubmit(e) {
        e.preventDefault();
        setDonationSuccess(true);
        setTimeout(() => {
            setDonationSuccess(false);
            setShowDonateModal(false);
        }, 2000);
    }

    function handleContactSubmit(e) {
        e.preventDefault();
        setContactSubmitted(true);
        setTimeout(() => setContactSubmitted(false), 3000);
    }

    if (loading) {
        return <main className="status-screen">Loading...</main>;
    }

    // Modal Component for Mock Donations
    const DonationModal = () => (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: 100, padding: "1rem"
        }}>
            <div className="panel" style={{ maxWidth: "420px", width: "100%", background: "#fff", position: "relative" }}>
                <button
                    onClick={() => setShowDonateModal(false)}
                    style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}
                >
                    ✕
                </button>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>{t.donateTitle}</h2>
                <p style={{ color: "#6c757d", fontSize: "0.85rem", marginBottom: "1.25rem" }}>{t.donateSub}</p>

                {donationSuccess ? (
                    <div style={{ padding: "1.5rem", background: "#e6f4ea", color: "#137333", borderRadius: "8px", textAlign: "center", fontWeight: "600" }}>
                        {t.donateSuccess}
                    </div>
                ) : (
                    <form onSubmit={handleDonateSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["10", "25", "50", "100"].map((amt) => (
                                <button
                                    type="button"
                                    key={amt}
                                    onClick={() => setDonationAmount(amt)}
                                    style={{
                                        flex: 1, padding: "8px", borderRadius: "6px",
                                        border: donationAmount === amt ? "2px solid var(--primary)" : "1px solid #ccc",
                                        background: donationAmount === amt ? "var(--bg-color)" : "#fff",
                                        fontWeight: "600", cursor: "pointer", fontSize: "0.9rem"
                                    }}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Card Number (Mock)"
                            defaultValue="4242 •••• •••• 4242"
                            required
                            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                        />
                        <button type="submit" className="cta-button" style={{ marginTop: "6px" }}>
                            Complete Donation (${donationAmount})
                        </button>
                    </form>
                )}
            </div>
        </div>
    );

    const LandingView = ({ isLoggedIn }) => (
        <div className="landing-page">
            <header className="topbar">
                <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setActiveView("dashboard"); }}>
                    {t.appName}
                </a>
                
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <a href="#about" style={{ textDecoration: "none", color: "var(--text-main)", fontSize: "0.85rem", fontWeight: "500" }}>{t.navAbout}</a>
                    <a href="#contact" style={{ textDecoration: "none", color: "var(--text-main)", fontSize: "0.85rem", fontWeight: "500" }}>{t.navContact}</a>
                </div>

                <div className="account-area">
                    <button className="lang-switch" onClick={toggleLang}>
                        {lang === "en" ? "FR" : "EN"}
                    </button>
                    <button 
                        className="logout-button"
                        onClick={() => setShowDonateModal(true)}
                        style={{ borderColor: "var(--primary)", color: "var(--primary)", fontWeight: "600" }}
                    >
                        {t.donateBtn}
                    </button>
                    {isLoggedIn ? (
                        <button className="nav-btn primary-btn" onClick={() => setActiveView("dashboard")}>
                            {t.navDashboard}
                        </button>
                    ) : (
                        <button className="nav-btn primary-btn" onClick={() => setShowAuthScreen(true)}>
                            {t.signInReg}
                        </button>
                    )}
                </div>
            </header>

            <section className="landing-hero">
                <div className="hero-content">
                    <p className="eyebrow">{t.tagline}</p>
                    <h1>{t.heroTitle}</h1>
                    <p className="hero-subtitle">{t.heroSub}</p>
                    <div className="hero-actions">
                        <button className="cta-button" onClick={() => isLoggedIn ? setActiveView("dashboard") : setShowAuthScreen(true)}>
                            {isLoggedIn ? t.navDashboard : t.getStarted}
                        </button>
                        <a href="#about" className="secondary-button">
                            {t.learnMore}
                        </a>
                    </div>
                </div>
            </section>

            <section className="landing-section" id="dangers">
                <div className="section-header">
                    <p className="eyebrow">{t.awarenessEyebrow}</p>
                    <h2>{t.awarenessTitle}</h2>
                </div>
                <div className="cards-grid">
                    <article className="info-card">
                        <h3>{t.card1Title}</h3>
                        <p>{t.card1Body}</p>
                    </article>
                    <article className="info-card">
                        <h3>{t.card2Title}</h3>
                        <p>{t.card2Body}</p>
                    </article>
                    <article className="info-card">
                        <h3>{t.card3Title}</h3>
                        <p>{t.card3Body}</p>
                    </article>
                </div>
            </section>

            <section className="landing-section highlight-bg" id="why-us">
                <div className="section-header">
                    <p className="eyebrow">{t.whyEyebrow}</p>
                    <h2>{t.whyTitle}</h2>
                </div>
                <div className="cards-grid">
                    <article className="info-card">
                        <h3>{t.feat1Title}</h3>
                        <p>{t.feat1Body}</p>
                    </article>
                    <article className="info-card">
                        <h3>{t.feat2Title}</h3>
                        <p>{t.feat2Body}</p>
                    </article>
                    <article className="info-card">
                        <h3>{t.feat3Title}</h3>
                        <p>{t.feat3Body}</p>
                    </article>
                </div>
            </section>

            <section className="landing-section" id="about">
                <div className="section-header">
                    <p className="eyebrow">{t.aboutEyebrow}</p>
                    <h2>{t.aboutTitle}</h2>
                </div>
                <div style={{ maxWidth: "750px", margin: "0 auto", textAlign: "center", color: "#6c757d", lineHeight: "1.7", fontSize: "0.95rem" }}>
                    <p>{t.aboutBody}</p>
                </div>
            </section>

            {/* Contact Us Section */}
            <section className="landing-section highlight-bg" id="contact">
                <div className="section-header">
                    <p className="eyebrow">{t.contactEyebrow}</p>
                    <h2>{t.contactTitle}</h2>
                    <p style={{ color: "#6c757d", fontSize: "0.9rem", marginTop: "0.3rem" }}>{t.contactSub}</p>
                </div>
                <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                    {contactSubmitted ? (
                        <div style={{ padding: "1rem", background: "#e6f4ea", color: "#137333", borderRadius: "6px", textAlign: "center", fontSize: "0.9rem" }}>
                            {t.contactSuccess}
                        </div>
                    ) : (
                        <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input type="text" placeholder={t.contactName} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }} />
                            <input type="email" placeholder={t.contactEmail} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }} />
                            <textarea placeholder={t.contactMsg} rows="4" required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}></textarea>
                            <button type="submit" className="cta-button">{t.contactSend}</button>
                        </form>
                    )}
                </div>
            </section>

            {/* Complete Professional Footer */}
            <footer className="dashboard-footer" style={{ background: "#fff", borderTop: "1px solid var(--border-color)", padding: "2.5rem 1.5rem" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", textAlign: "left" }}>
                    <div>
                        <strong style={{ fontSize: "1.1rem", color: "var(--primary)" }}>{t.appName}</strong>
                        <p style={{ color: "#6c757d", fontSize: "0.85rem", marginTop: "0.4rem", maxWidth: "300px" }}>{t.footerDesc}</p>
                    </div>
                    <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <strong style={{ color: "var(--text-main)" }}>Navigation</strong>
                            <a href="#about" style={{ textDecoration: "none", color: "#6c757d" }}>{t.navAbout}</a>
                            <a href="#why-us" style={{ textDecoration: "none", color: "#6c757d" }}>Features</a>
                            <a href="#contact" style={{ textDecoration: "none", color: "#6c757d" }}>{t.navContact}</a>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <strong style={{ color: "var(--text-main)" }}>Legal</strong>
                            <a href="#" style={{ textDecoration: "none", color: "#6c757d" }}>{t.footerPrivacy}</a>
                            <a href="#" style={{ textDecoration: "none", color: "#6c757d" }}>{t.footerTerms}</a>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid #eee", marginTop: "2rem", paddingTop: "1rem", textAlign: "center", fontSize: "0.8rem", color: "#999" }}>
                    © {new Date().getFullYear()} Rosetta. All rights reserved.
                </div>
            </footer>

            {showDonateModal && <DonationModal />}
        </div>
    );

    if (!session) {
        if (showAuthScreen) {
            return (
                <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "15px", left: "15px", zIndex: 10, display: "flex", gap: "10px" }}>
                        <button className="nav-btn" onClick={() => setShowAuthScreen(false)}>
                            {t.backHome}
                        </button>
                        <button className="lang-switch" onClick={toggleLang}>
                            {lang === "en" ? "FR" : "EN"}
                        </button>
                    </div>
                    <Auth lang={lang} />
                </div>
            );
        }

        return <LandingView isLoggedIn={false} />;
    }

    if (profileError) {
        return (
            <main className="status-screen">
                <h2>{profileError}</h2>
                <button className="nav-btn" onClick={handleLogout}>{t.logout}</button>
            </main>
        );
    }

    if (profileLoading || !profile) {
        return <main className="status-screen">Loading...</main>;
    }

    if (activeView === "home") {
        return <LandingView isLoggedIn={true} />;
    }

    const isDoctor = profile.role === "doctor";
    const completedCount = medications.filter((m) => m.is_taken).length;

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setActiveView("home"); }}>
                    {t.appName}
                </a>

                <div className="account-area">
                    <button className="lang-switch" onClick={toggleLang}>
                        {lang === "en" ? "FR" : "EN"}
                    </button>

                    <button 
                        className="logout-button"
                        onClick={() => setShowDonateModal(true)}
                        style={{ borderColor: "var(--primary)", color: "var(--primary)", fontWeight: "600" }}
                    >
                        {t.donateBtn}
                    </button>

                    <button className="nav-btn" onClick={() => setActiveView("home")}>
                        {t.navHome}
                    </button>

                    <div className="account-info">
                        <strong>{profile.full_name}</strong>
                        <span>{isDoctor ? (lang === "en" ? "Doctor" : "Médecin") : (lang === "en" ? "Patient" : "Patient")}</span>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        {t.logout}
                    </button>
                </div>
            </header>

            <main className="dashboard">
                <section className="welcome-section">
                    <div>
                        <p className="eyebrow">
                            {isDoctor ? t.doctorSpace : t.patientSpace}
                        </p>

                        <h1>
                            {isDoctor
                                ? `${t.welcomeDoctor}${profile.full_name}`
                                : `${t.welcomePatient}${profile.full_name}`}
                        </h1>

                        <p className="welcome-description">
                            {isDoctor ? t.doctorSub : t.patientSub}
                        </p>
                    </div>
                </section>

                {isDoctor ? (
                    <>
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">{t.messagesEyebrow}</p>
                                    <h2>{t.messagesTitle}</h2>
                                </div>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>{t.noPatients}</p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "600" }}>
                                            {t.selectPatient}
                                        </label>
                                        <select
                                            value={recipientId}
                                            onChange={(e) => setRecipientId(e.target.value)}
                                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                        >
                                            {availableUsers.map((pat) => (
                                                <option key={pat.id} value={pat.id}>
                                                    {pat.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ height: "240px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", background: "#fafafa", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {messages.length === 0 ? (
                                            <p style={{ color: "#888", textAlign: "center", margin: "auto", fontSize: "0.85rem" }}>
                                                {t.noMessages}
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe = msg.sender_id === profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe ? "flex-end" : "flex-start",
                                                            background: isMe ? "var(--primary)" : "#e9ecef",
                                                            color: isMe ? "white" : "#2b2d42",
                                                            padding: "8px 12px",
                                                            borderRadius: "8px",
                                                            maxWidth: "75%",
                                                            fontSize: "0.9rem"
                                                        }}
                                                    >
                                                        <p style={{ margin: 0, wordBreak: "break-word" }}>{msg.content}</p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            placeholder={t.typeMsg}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                        />
                                        <button type="submit" className="cta-button" style={{ padding: "0 18px" }}>
                                            {t.send}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <>
                        <section className="summary-grid">
                            <article className="summary-card">
                                <p>{t.todayMed}</p>
                                <strong>{medications.length} {t.scheduled}</strong>
                                <span className="muted">{t.dailyPlan}</span>
                            </article>

                            <article className="summary-card">
                                <p>{t.dosesDone}</p>
                                <strong>{completedCount} {t.completedOf} {medications.length}</strong>
                                <span className="muted">{t.progressToday}</span>
                            </article>
                        </section>

                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">{t.carePlan}</p>
                                    <h2>{t.medSchedule}</h2>
                                </div>

                                <span className="date-label">
                                    {new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>

                            <form onSubmit={handleAddMedication} className="med-form" style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap" }}>
                                <input
                                    type="text"
                                    placeholder={t.medNamePlace}
                                    value={newMedName}
                                    onChange={(e) => setNewMedName(e.target.value)}
                                    required
                                    style={{ flex: 2, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                />
                                <input
                                    type="text"
                                    placeholder={t.dosagePlace}
                                    value={newDosage}
                                    onChange={(e) => setNewDosage(e.target.value)}
                                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                />
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    required
                                    style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                />
                                <button type="submit" className="cta-button">
                                    {t.addReminder}
                                </button>
                            </form>

                            {medications.length === 0 ? (
                                <div className="empty-state">
                                    <h3>{t.noMeds}</h3>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {medications.map((med) => (
                                        <div
                                            key={med.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 15px",
                                                background: med.is_taken ? "#f8f9fa" : "#fff",
                                                border: "1px solid #eee",
                                                borderRadius: "6px",
                                                textDecoration: med.is_taken ? "line-through" : "none",
                                                color: med.is_taken ? "#888" : "#2b2d42",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            <div>
                                                <strong>{med.medication_name}</strong> ({med.dosage})
                                            </div>
                                            <button
                                                onClick={() => toggleMedication(med.id, med.is_taken)}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: med.is_taken ? "#6c757d" : "#198754",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    fontSize: "0.8rem"
                                                }}
                                            >
                                                {med.is_taken ? t.undo : t.markTaken}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">{t.messagesEyebrow}</p>
                                    <h2>{t.messagesTitle}</h2>
                                </div>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p style={{ color: "#6c757d", fontSize: "0.9rem" }}>{t.noDoctors}</p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "600" }}>
                                            {t.selectDoctor}
                                        </label>
                                        <select
                                            value={recipientId}
                                            onChange={(e) => setRecipientId(e.target.value)}
                                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                        >
                                            {availableUsers.map((doc) => (
                                                <option key={doc.id} value={doc.id}>
                                                    Dr. {doc.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ height: "240px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px", padding: "12px", marginBottom: "12px", background: "#fafafa", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {messages.length === 0 ? (
                                            <p style={{ color: "#888", textAlign: "center", margin: "auto", fontSize: "0.85rem" }}>
                                                {t.noMessages}
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe = msg.sender_id === profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe ? "flex-end" : "flex-start",
                                                            background: isMe ? "var(--primary)" : "#e9ecef",
                                                            color: isMe ? "white" : "#2b2d42",
                                                            padding: "8px 12px",
                                                            borderRadius: "8px",
                                                            maxWidth: "75%",
                                                            fontSize: "0.9rem"
                                                        }}
                                                    >
                                                        <p style={{ margin: 0, wordBreak: "break-word" }}>{msg.content}</p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            placeholder={t.typeMsg}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.9rem" }}
                                        />
                                        <button type="submit" className="cta-button" style={{ padding: "0 18px" }}>
                                            {t.send}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </>
                )}

                <footer className="dashboard-footer">
                    {t.footer}
                </footer>
            </main>

            {showDonateModal && <DonationModal />}
        </div>
    );
}