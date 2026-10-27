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
            tagline: "Advanced Healthcare Companion",
            heroTitle: "Empowering Patients Through Structured Care",
            heroSub:
                "Connecting patients and healthcare professionals with seamless treatment tracking, remote consultation, and comprehensive medical guidance.",
            getStarted: "Get Started",
            learnMore: "Explore Platform ↓",
            navDashboard: "Dashboard →",
            signInReg: "Sign In / Register",
            logout: "Log out",
            donateBtn: "Donate Support",
            navAbout: "About",
            navContact: "Contact",
            awarenessEyebrow: "CLINICAL INSIGHTS & EDUCATION",
            awarenessTitle: "Proactive Health & Treatment Adherence",
            card1Title: "Early Screening Protocols",
            card1Body:
                "Regular clinical screenings and self-assessments significantly improve therapeutic outcomes. Early intervention remains the cornerstone of modern preventive healthcare.",
            card2Title: "Structured Medication Management",
            card2Body:
                "Navigating complex pharmaceutical schedules can be challenging. Rosetta provides clear, day-by-day reminders and verification tools to ensure accurate dosing.",
            card3Title: "Secure Patient-Doctor Communication",
            card3Body:
                "Bridging the gap between clinic visits with real-time encrypted messaging ensures clinicians can offer timely guidance and peace of mind.",
            whyEyebrow: "PLATFORM ARCHITECTURE",
            whyTitle: "Engineered for Reliability and Privacy",
            feat1Title: "Real-Time Care Sync",
            feat1Body:
                "Instant updates across patient and doctor portals powered by robust PostgreSQL database triggers.",
            feat2Title: "Role-Based Security",
            feat2Body:
                "Strict data isolation ensures that patient records and communications remain strictly confidential and secure.",
            feat3Title: "Bilingual Accessibility",
            feat3Body:
                "Fully localized in English and French to accommodate diverse clinical environments and user preferences.",
            aboutEyebrow: "ABOUT ROSETTA HEALTH",
            aboutTitle: "Our Mission in Digital Health",
            aboutP1:
                "Rosetta was built to solve a critical challenge in modern medicine: maintaining continuous, empathetic, and organized communication between patients undergoing intensive treatment and their medical care teams.",
            aboutP2:
                "By combining intuitive daily care tracking with secure messaging, our platform reduces administrative friction, minimizes missed medication doses, and fosters a collaborative healing environment.",
            contactEyebrow: "GET IN TOUCH",
            contactTitle: "Connect With Our Team",
            contactSub:
                "Have questions about our platform, clinical partnerships, or deployment? Send us a message below.",
            contactName: "Full Name",
            contactEmail: "Professional Email",
            contactMsg: "Your Message or Inquiry",
            contactSend: "Send Message",
            contactSuccess:
                "Thank you! Your message has been successfully transmitted.",
            donateTitle: "Contribute to Patient Care Kits",
            donateSub:
                "Your mock contribution helps fund patient educational brochures and comfort support tools.",
            donateSuccess: "Thank you for your generous support!",
            footerDesc:
                "Rosetta Healthcare Companion · Advancing patient-centric care through secure technology.",
            patientSpace: "PATIENT DASHBOARD",
            doctorSpace: "DOCTOR CLINICAL WORKSPACE",
            welcomePatient: "Welcome back, ",
            welcomeDoctor: "Clinical Portal, Dr. ",
            patientSub:
                "Manage your daily treatment schedule and communicate securely with your care provider.",
            doctorSub:
                "Review patient adherence metrics and respond to active consultations.",
            selectPatient: "Select Patient Profile:",
            selectDoctor: "Select Attending Physician:",
            noPatients:
                "No patients currently registered in your clinical roster.",
            noDoctors: "No physicians currently available.",
            noMessages: "No messages exchanged in this thread yet.",
            typeMsg: "Type a secure message...",
            send: "Send",
            todayMed: "Today's Prescriptions",
            scheduled: "scheduled doses",
            dailyPlan: "Active treatment regimen",
            dosesDone: "Completed Doses",
            completedOf: "completed out of",
            progressToday: "Daily adherence progress",
            carePlan: "TREATMENT TIMELINE",
            medSchedule: "Medication Reminders",
            medNamePlace: "Medication name (e.g. Tamoxifen)",
            dosagePlace: "Dosage (e.g. 20mg)",
            addReminder: "Add Prescription",
            noMeds: "No medications scheduled for today.",
            undo: "Undo",
            markTaken: "Mark as Taken",
            messagesTitle: "Secure Consultations",
            messagesEyebrow: "ENCRYPTED CHAT",
            backHome: "← Return to Home",
        },
        fr: {
            appName: "Rosetta",
            tagline: "Plateforme de Santé Avancée",
            heroTitle: "Accompagner les patients grâce à des soins structurés",
            heroSub:
                "Connecter les patients et les professionnels de santé avec un suivi rigoureux des traitements, des consultations à distance et un accompagnement sur mesure.",
            getStarted: "Commencer",
            learnMore: "Explorer la plateforme ↓",
            navDashboard: "Espace Patient →",
            signInReg: "Connexion / Inscription",
            logout: "Déconnexion",
            donateBtn: "Soutenir le projet",
            navAbout: "À propos",
            navContact: "Contact",
            awarenessEyebrow: "ÉDUCATION & PRÉVENTION CLINIQUE",
            awarenessTitle: "Santé proactive et observance des traitements",
            card1Title: "Protocoles de Dépistage Précoce",
            card1Body:
                "Les examens cliniques réguliers et l'auto-surveillance améliorent considérablement les résultats thérapeutiques. L'intervention précoce reste la pierre angulaire de la santé préventive.",
            card2Title: "Gestion Structurée des Traitements",
            card2Body:
                "Le suivi de protocoles pharmaceutiques complexes nécessite de la rigueur. Rosetta propose des rappels clairs et des outils de validation quotidiens.",
            card3Title: "Communication Sécurisée Patient-Médecin",
            card3Body:
                "Maintenir un lien direct entre les consultations cliniques grâce à une messagerie chiffrée garantit un accompagnement rassurant et réactif.",
            whyEyebrow: "ARCHITECTURE DE LA PLATEFORME",
            whyTitle: "Conçue pour la fiablité et la confidentialité",
            feat1Title: "Synchronisation en Temps Réel",
            feat1Body:
                "Mises à instantanées entre les espaces patients et médecins grâce à des bases de données robustes.",
            feat2Title: "Sécurité par Rôle",
            feat2Body:
                "L'isolation stricte des données garantit que les dossiers médicaux et échanges restent strictement confidentiels.",
            feat3Title: "Accessibilité Bilingue",
            feat3Body:
                "Entièrement localisée en français et en anglais pour s'adapter à divers environnements cliniques.",
            aboutEyebrow: "À PROPOS DE ROSETTA",
            aboutTitle: "Notre mission en santé numérique",
            aboutP1:
                "Rosetta a été conçue pour répondre à un défi majeur de la médecine moderne : maintenir un lien continu, empathique et structuré entre les patients en cours de traitement lourd et leurs équipes médicales.",
            aboutP2:
                "En associant un suivi quotidien intuitif et une messagerie sécurisée, notre plateforme réduit la charge mentale des patients, prévient les oublis de médicaments et favorise un environnement de guérison collaboratif.",
            contactEyebrow: "NOUS CONTACTER",
            contactTitle: "Entrez en contact avec notre équipe",
            contactSub:
                "Vous avez des questions sur notre plateforme, nos partenariats ou notre déploiement ? Envoyez-nous un message.",
            contactName: "Nom complet",
            contactEmail: "E-mail professionnel",
            contactMsg: "Votre message ou question",
            contactSend: "Envoyer le message",
            contactSuccess: "Merci ! Votre message a bien été transmis.",
            donateTitle: "Contribuer aux kits de soutien",
            donateSub:
                "Votre contribution simulée aide à financer des outils d'accompagnement pour les patients.",
            donateSuccess: "Merci infiniment pour votre généreux soutien !",
            footerDesc:
                "Rosetta · Améliorer la prise en charge des patients grâce à une technologie sécurisée.",
            patientSpace: "ESPACE PATIENT",
            doctorSpace: "ESPACE CLINIQUE MÉDECIN",
            welcomePatient: "Bonjour, ",
            welcomeDoctor: "Portail Clinique, Dr. ",
            patientSub:
                "Gérez votre planning thérapeutique quotidien et communiquez en toute sécurité avec votre équipe soignante.",
            doctorSub:
                "Suivez l'observance de vos patients et répondez aux consultations en cours.",
            selectPatient: "Sélectionner le profil patient :",
            selectDoctor: "Sélectionner le médecin référent :",
            noPatients:
                "Aucun patient enregistré dans votre liste pour le moment.",
            noDoctors: "Aucun médecin disponible.",
            noMessages: "Aucun message dans cette conversation.",
            typeMsg: "Écrire un message sécurisé...",
            send: "Envoyer",
            todayMed: "Traitements du jour",
            scheduled: "doses prévues",
            dailyPlan: "Programme thérapeutique",
            dosesDone: "Doses Validées",
            completedOf: "réalisées sur",
            progressToday: "Progression journalière",
            carePlan: "CALENDRIER THÉRAPEUTIQUE",
            medSchedule: "Rappels de Médicaments",
            medNamePlace: "Nom du médicament (ex. Tamoxifène)",
            dosagePlace: "Dosage (ex. 20mg)",
            addReminder: "Ajouter une prescription",
            noMeds: "Aucun médicament planifié pour aujourd'hui.",
            undo: "Annuler",
            markTaken: "Marquer comme pris",
            messagesTitle: "Consultations Sécurisées",
            messagesEyebrow: "MESSAGERIE CHIFFRÉE",
            backHome: "← Retour à l'accueil",
        },
    }[lang];

    const toggleLang = () => setLang((l) => (l === "en" ? "fr" : "en"));

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
                    med.id === id ? { ...med, is_taken: !currentStatus } : med,
                ),
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
                return;
            }

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
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.id]);

    async function handleLogout() {
        await supabase.auth.signOut();
        setActiveView("dashboard");
    }

    useEffect(() => {
        if (!profile) return;

        async function fetchUsers() {
            const targetRole =
                profile.role === "patient" ? "doctor" : "patient";
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
                    `and(sender_id.eq.${profile.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${profile.id})`,
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
                        (newMsg.sender_id === profile.id &&
                            newMsg.receiver_id === recipientId) ||
                        (newMsg.sender_id === recipientId &&
                            newMsg.receiver_id === profile.id)
                    ) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                },
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
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100,
                padding: "1rem",
            }}
        >
            <div
                className="panel"
                style={{
                    maxWidth: "400px",
                    width: "100%",
                    background: "#fff",
                    position: "relative",
                    borderRadius: "12px",
                    padding: "2rem",
                }}
            >
                <button
                    onClick={() => setShowDonateModal(false)}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        border: "none",
                        background: "none",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                    }}
                >
                    ✕
                </button>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>
                    {t.donateTitle}
                </h2>
                <p
                    style={{
                        color: "#64748b",
                        fontSize: "0.85rem",
                        marginBottom: "1.25rem",
                    }}
                >
                    {t.donateSub}
                </p>

                {donationSuccess ? (
                    <div
                        style={{
                            padding: "1.5rem",
                            background: "#f0fdf4",
                            color: "#166534",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontWeight: "600",
                        }}
                    >
                        {t.donateSuccess}
                    </div>
                ) : (
                    <form
                        onSubmit={handleDonateSubmit}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <div style={{ display: "flex", gap: "8px" }}>
                            {["10", "25", "50", "100"].map((amt) => (
                                <button
                                    type="button"
                                    key={amt}
                                    onClick={() => setDonationAmount(amt)}
                                    style={{
                                        flex: 1,
                                        padding: "8px",
                                        borderRadius: "6px",
                                        border:
                                            donationAmount === amt
                                                ? "2px solid var(--primary)"
                                                : "1px solid #cbd5e1",
                                        background:
                                            donationAmount === amt
                                                ? "#f0fdf4"
                                                : "#fff",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
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
                            style={{
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        />
                        <button
                            type="submit"
                            className="cta-button"
                            style={{ marginTop: "6px" }}
                        >
                            Complete Contribution (${donationAmount})
                        </button>
                    </form>
                )}
            </div>
        </div>
    );

    const LandingView = ({ isLoggedIn }) => {
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

        return (
            <div className="landing-page">
                <header className="topbar">
                    <div
                        className="brand-row"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <a
                            className="brand"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActiveView("dashboard");
                            }}
                            style={{
                                fontWeight: "700",
                                fontSize: "1.2rem",
                                color: "var(--primary)",
                                textDecoration: "none",
                            }}
                        >
                            {t.appName}
                        </a>
                        <button
                            className="hamburger-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>

                    <div className={`nav-links-container ${mobileMenuOpen ? "mobile-open" : ""}`}>
                        <div
                            style={{
                                display: "flex",
                                gap: "1.2rem",
                                alignItems: "center",
                                flexWrap: "wrap",
                                justifyContent: "center",
                            }}
                        >
                            <a
                                href="#about"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    textDecoration: "none",
                                    color: "var(--text-main)",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                {t.navAbout}
                            </a>
                            <a
                                href="#why-us"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    textDecoration: "none",
                                    color: "var(--text-main)",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                Features
                            </a>
                            <a
                                href="#contact"
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    textDecoration: "none",
                                    color: "var(--text-main)",
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}
                            >
                                {t.navContact}
                            </a>
                        </div>

                        <div
                            className="account-area"
                            style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                            }}
                        >
                            <button
                                className="lang-switch"
                                onClick={toggleLang}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #cbd5e1",
                                    background: "#fff",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {lang === "en" ? "FR" : "EN"}
                            </button>
                            <button
                                onClick={() => { setShowDonateModal(true); setMobileMenuOpen(false); }}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--primary)",
                                    background: "transparent",
                                    color: "var(--primary)",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {t.donateBtn}
                            </button>
                            {isLoggedIn ? (
                                <button
                                    className="cta-button"
                                    onClick={() => { setActiveView("dashboard"); setMobileMenuOpen(false); }}
                                    style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                                >
                                    {t.navDashboard}
                                </button>
                            ) : (
                                <button
                                    className="cta-button"
                                    onClick={() => { setShowAuthScreen(true); setMobileMenuOpen(false); }}
                                    style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                                >
                                    {t.signInReg}
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <section className="landing-hero">
                    <div
                        className="hero-content"
                        style={{ maxWidth: "750px", margin: "0 auto" }}
                    >
                        <p
                            className="eyebrow"
                            style={{
                                color: "var(--primary)",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                fontSize: "0.8rem",
                                letterSpacing: "1px",
                            }}
                        >
                            {t.tagline}
                        </p>
                        <h1>{t.heroTitle}</h1>
                        <p
                            className="hero-subtitle"
                            style={{
                                color: "#475569",
                                fontSize: "1.05rem",
                                lineHeight: "1.7",
                                marginBottom: "2rem",
                            }}
                        >
                            {t.heroSub}
                        </p>
                        <div
                            className="hero-actions"
                            style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                className="cta-button"
                                onClick={() =>
                                    isLoggedIn
                                        ? setActiveView("dashboard")
                                        : setShowAuthScreen(true)
                                }
                            >
                                {isLoggedIn ? t.navDashboard : t.getStarted}
                            </button>
                            <a
                                href="#about"
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    background: "#fff",
                                    color: "var(--text-main)",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                }}
                            >
                                {t.learnMore}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Rich Text & Image Cards Section */}
                <section className="landing-section" id="dangers">
                    <div
                        className="section-header"
                        style={{ textAlign: "center", marginBottom: "2.5rem" }}
                    >
                        <p
                            className="eyebrow"
                            style={{
                                color: "var(--primary)",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                letterSpacing: "1px",
                            }}
                        >
                            {t.awarenessEyebrow}
                        </p>
                        <h2 style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>
                            {t.awarenessTitle}
                        </h2>
                    </div>
                    <div className="cards-grid">
                        <article className="info-card">
                            <img
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                                alt="Clinical screening"
                            />
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {t.card1Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.card1Body}
                            </p>
                        </article>
                        <article className="info-card">
                            <img
                                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
                                alt="Medication management"
                            />
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {t.card2Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.card2Body}
                            </p>
                        </article>
                        <article className="info-card">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"
                                alt="Doctor patient collaboration"
                            />
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {t.card3Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.card3Body}
                            </p>
                        </article>
                    </div>
                </section>

                <section className="landing-section highlight-bg" id="why-us">
                    <div
                        className="section-header"
                        style={{ textAlign: "center", marginBottom: "2.5rem" }}
                    >
                        <p
                            className="eyebrow"
                            style={{
                                color: "var(--primary)",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                letterSpacing: "1px",
                            }}
                        >
                            {t.whyEyebrow}
                        </p>
                        <h2 style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>
                            {t.whyTitle}
                        </h2>
                    </div>
                    <div className="cards-grid">
                        <article
                            className="info-card"
                            style={{ background: "#fff" }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                    color: "var(--primary)",
                                }}
                            >
                                {t.feat1Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.feat1Body}
                            </p>
                        </article>
                        <article
                            className="info-card"
                            style={{ background: "#fff" }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                    color: "var(--primary)",
                                }}
                            >
                                {t.feat2Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.feat2Body}
                            </p>
                        </article>
                        <article
                            className="info-card"
                            style={{ background: "#fff" }}
                        >
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    marginBottom: "0.5rem",
                                    color: "var(--primary)",
                                }}
                            >
                                {t.feat3Title}
                            </h3>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "0.9rem",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.feat3Body}
                            </p>
                        </article>
                    </div>
                </section>

                {/* Rich Text About Us Section */}
                <section className="landing-section" id="about">
                    <div
                        className="section-header"
                        style={{ textAlign: "center", marginBottom: "2rem" }}
                    >
                        <p
                            className="eyebrow"
                            style={{
                                color: "var(--primary)",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                letterSpacing: "1px",
                            }}
                        >
                            {t.aboutEyebrow}
                        </p>
                        <h2 style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>
                            {t.aboutTitle}
                        </h2>
                    </div>
                    <div
                        style={{
                            maxWidth: "750px",
                            margin: "0 auto",
                            color: "#475569",
                            lineHeight: "1.8",
                            fontSize: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.2rem",
                            textAlign: "left",
                        }}
                    >
                        <p>{t.aboutP1}</p>
                        <p>{t.aboutP2}</p>
                    </div>
                </section>

                {/* Mobile-Optimized Contact Section */}
                <section className="landing-section highlight-bg" id="contact">
                    <div
                        className="section-header"
                        style={{ textAlign: "center", marginBottom: "2rem" }}
                    >
                        <p
                            className="eyebrow"
                            style={{
                                color: "var(--primary)",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                letterSpacing: "1px",
                            }}
                        >
                            {t.contactEyebrow}
                        </p>
                        <h2 style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>
                            {t.contactTitle}
                        </h2>
                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "0.9rem",
                                marginTop: "0.4rem",
                                maxWidth: "500px",
                                marginInline: "auto",
                            }}
                        >
                            {t.contactSub}
                        </p>
                    </div>
                    <div
                        style={{
                            maxWidth: "500px",
                            margin: "0 auto",
                            background: "#fff",
                            padding: "2rem",
                            borderRadius: "12px",
                            border: "1px solid var(--border-color)",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                        }}
                    >
                        {contactSubmitted ? (
                            <div
                                style={{
                                    padding: "1.5rem",
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontSize: "0.95rem",
                                    fontWeight: "600",
                                }}
                            >
                                {t.contactSuccess}
                            </div>
                        ) : (
                            <form
                                onSubmit={handleContactSubmit}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "14px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {t.contactName}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        required
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #cbd5e1",
                                            fontSize: "0.9rem",
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {t.contactEmail}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="jane@example.com"
                                        required
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #cbd5e1",
                                            fontSize: "0.9rem",
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {t.contactMsg}
                                    </label>
                                    <textarea
                                        placeholder="How can we help you?"
                                        rows="4"
                                        required
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #cbd5e1",
                                            fontSize: "0.9rem",
                                        }}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="cta-button"
                                    style={{
                                        marginTop: "6px",
                                        width: "100%",
                                        padding: "10px",
                                    }}
                                >
                                    {t.contactSend}
                                </button>
                            </form>
                        )}
                    </div>
                </section>

                {/* Mobile-Friendly Footer */}
                <footer
                    style={{
                        background: "#fff",
                        borderTop: "1px solid var(--border-color)",
                        padding: "3rem 1.5rem",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "900px",
                            margin: "0 auto",
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "2rem",
                            textAlign: "left",
                        }}
                    >
                        <div>
                            <strong
                                style={{
                                    fontSize: "1.2rem",
                                    color: "var(--primary)",
                                }}
                            >
                                {t.appName}
                            </strong>
                            <p
                                style={{
                                    color: "#64748b",
                                    fontSize: "0.85rem",
                                    marginTop: "0.5rem",
                                    maxWidth: "280px",
                                    lineHeight: "1.6",
                                }}
                            >
                                {t.footerDesc}
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "3rem",
                                fontSize: "0.85rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                }}
                            >
                                <strong style={{ color: "var(--text-main)" }}>
                                    Navigation
                                </strong>
                                <a
                                    href="#about"
                                    style={{
                                        textDecoration: "none",
                                        color: "#64748b",
                                    }}
                                >
                                    {t.navAbout}
                                </a>
                                <a
                                    href="#why-us"
                                    style={{
                                        textDecoration: "none",
                                        color: "#64748b",
                                    }}
                                >
                                    Features
                                </a>
                                <a
                                    href="#contact"
                                    style={{
                                        textDecoration: "none",
                                        color: "#64748b",
                                    }}
                                >
                                    {t.navContact}
                                </a>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                }}
                            >
                                <strong style={{ color: "var(--text-main)" }}>
                                    Legal & Privacy
                                </strong>
                                <a
                                    href="#"
                                    style={{
                                        textDecoration: "none",
                                        color: "#64748b",
                                    }}
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="#"
                                    style={{
                                        textDecoration: "none",
                                        color: "#64748b",
                                    }}
                                >
                                    Terms of Service
                                </a>
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #e2e8f0",
                            marginTop: "2.5rem",
                            paddingTop: "1.5rem",
                            textAlign: "center",
                            fontSize: "0.8rem",
                            color: "#94a3b8",
                        }}
                    >
                        © {new Date().getFullYear()} Rosetta Healthcare. All rights
                        reserved.
                    </div>
                </footer>

                {showDonateModal && <DonationModal />}
            </div>
        );
    };

    if (!session) {
        if (showAuthScreen) {
            return (
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            top: "15px",
                            left: "15px",
                            zIndex: 10,
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            className="cta-button"
                            onClick={() => setShowAuthScreen(false)}
                            style={{ background: "#e2e8f0", color: "#1e293b" }}
                        >
                            {t.backHome}
                        </button>
                        <button
                            className="lang-switch"
                            onClick={toggleLang}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
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
            <main
                className="status-screen"
                style={{ textAlign: "center", padding: "4rem" }}
            >
                <h2>{profileError}</h2>
                <button
                    className="cta-button"
                    onClick={handleLogout}
                    style={{ marginTop: "1rem" }}
                >
                    {t.logout}
                </button>
            </main>
        );
    }

    if (!profile) {
        return <main className="status-screen">Loading...</main>;
    }

    if (activeView === "home") {
        return <LandingView isLoggedIn={true} />;
    }

    const isDoctor = profile.role === "doctor";
    const completedCount = medications.filter((m) => m.is_taken).length;
    const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);

    return (
        <div className="app-shell">
            <header className="topbar">
                <div
                    className="brand-row"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <a
                        className="brand"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveView("home");
                        }}
                        style={{
                            fontWeight: "700",
                            fontSize: "1.2rem",
                            color: "var(--primary)",
                            textDecoration: "none",
                        }}
                    >
                        {t.appName}
                    </a>
                    <button
                        className="hamburger-btn"
                        onClick={() => setDashboardMenuOpen(!dashboardMenuOpen)}
                    >
                        {dashboardMenuOpen ? "✕" : "☰"}
                    </button>
                </div>

                <div
                    className={`nav-links-container ${dashboardMenuOpen ? "mobile-open" : ""}`}
                    style={{
                        display: "flex",
                        gap: "1.2rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    <div
                        className="account-area"
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            className="lang-switch"
                            onClick={toggleLang}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "0.85rem",
                            }}
                        >
                            {lang === "en" ? "FR" : "EN"}
                        </button>
                        <button
                            onClick={() => {
                                setShowDonateModal(true);
                                setDashboardMenuOpen(false);
                            }}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid var(--primary)",
                                background: "transparent",
                                color: "var(--primary)",
                                fontWeight: "600",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                            }}
                        >
                            {t.donateBtn}
                        </button>
                        <button
                            className="cta-button"
                            onClick={() => { setActiveView("home"); setDashboardMenuOpen(false); }}
                            style={{ background: "#e2e8f0", color: "#1e293b", padding: "6px 12px", fontSize: "0.85rem" }}
                        >
                            {t.navDashboard === "Dashboard →" ? "Home" : "Accueil"}
                        </button>

                        <div className="account-info" style={{ display: "flex", flexDirection: "column", textAlign: "right", fontSize: "0.85rem" }}>
                            <strong>{profile.full_name}</strong>
                            <span style={{ color: "#64748b" }}>{isDoctor ? (lang === "en" ? "Doctor" : "Médecin") : (lang === "en" ? "Patient" : "Patient")}</span>
                        </div>

                        <button className="cta-button" onClick={handleLogout} style={{ background: "#ef4444", padding: "6px 12px", fontSize: "0.85rem" }}>
                            {t.logout}
                        </button>
                    </div>
                </div>
            </header>

            <main
                className="dashboard"
                style={{
                    maxWidth: "900px",
                    margin: "2rem auto",
                    padding: "0 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                }}
            >
                <section
                    className="welcome-section"
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                    }}
                >
                    <p
                        className="eyebrow"
                        style={{
                            color: "var(--primary)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            letterSpacing: "1px",
                        }}
                    >
                        {isDoctor ? t.doctorSpace : t.patientSpace}
                    </p>

                    <h1 style={{ fontSize: "1.8rem", margin: "0.4rem 0" }}>
                        {isDoctor
                            ? `${t.welcomeDoctor}${profile.full_name}`
                            : `${t.welcomePatient}${profile.full_name}`}
                    </h1>

                    <p
                        className="welcome-description"
                        style={{ color: "#64748b", fontSize: "0.95rem" }}
                    >
                        {isDoctor ? t.doctorSub : t.patientSub}
                    </p>
                </section>

                {isDoctor ? (
                    <>
                        <section
                            className="panel"
                            style={{
                                background: "#fff",
                                padding: "2rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)",
                            }}
                        >
                            <div
                                className="panel-heading"
                                style={{ marginBottom: "1.5rem" }}
                            >
                                <p
                                    className="eyebrow"
                                    style={{
                                        color: "var(--primary)",
                                        fontWeight: "700",
                                        fontSize: "0.8rem",
                                        letterSpacing: "1px",
                                    }}
                                >
                                    {t.messagesEyebrow}
                                </p>
                                <h2 style={{ fontSize: "1.4rem" }}>
                                    {t.messagesTitle}
                                </h2>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p
                                    style={{
                                        color: "#64748b",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {t.noPatients}
                                </p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "5px",
                                                fontSize: "0.85rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {t.selectPatient}
                                        </label>
                                        <select
                                            value={recipientId}
                                            onChange={(e) =>
                                                setRecipientId(e.target.value)
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {availableUsers.map((pat) => (
                                                <option
                                                    key={pat.id}
                                                    value={pat.id}
                                                >
                                                    {pat.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div
                                        style={{
                                            height: "260px",
                                            overflowY: "auto",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "12px",
                                            marginBottom: "12px",
                                            background: "#f8fafc",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p
                                                style={{
                                                    color: "#94a3b8",
                                                    textAlign: "center",
                                                    margin: "auto",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {t.noMessages}
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe =
                                                    msg.sender_id ===
                                                    profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe
                                                                ? "flex-end"
                                                                : "flex-start",
                                                            background: isMe
                                                                ? "var(--primary)"
                                                                : "#e2e8f0",
                                                            color: isMe
                                                                ? "white"
                                                                : "#1e293b",
                                                            padding: "8px 12px",
                                                            borderRadius: "8px",
                                                            maxWidth: "75%",
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                margin: 0,
                                                                wordBreak:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <form
                                        onSubmit={handleSendMessage}
                                        style={{ display: "flex", gap: "8px" }}
                                    >
                                        <input
                                            type="text"
                                            placeholder={t.typeMsg}
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.9rem",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="cta-button"
                                            style={{ padding: "0 18px" }}
                                        >
                                            {t.send}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(240px, 1fr))",
                                gap: "1rem",
                            }}
                        >
                            <article
                                style={{
                                    background: "#fff",
                                    padding: "1.5rem",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#64748b",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                    }}
                                >
                                    {t.todayMed}
                                </p>
                                <strong
                                    style={{
                                        fontSize: "1.6rem",
                                        display: "block",
                                        margin: "0.2rem 0",
                                    }}
                                >
                                    {medications.length} {t.scheduled}
                                </strong>
                                <span
                                    style={{
                                        color: "#94a3b8",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {t.dailyPlan}
                                </span>
                            </article>

                            <article
                                style={{
                                    background: "#fff",
                                    padding: "1.5rem",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                <p
                                    style={{
                                        color: "#64748b",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                    }}
                                >
                                    {t.dosesDone}
                                </p>
                                <strong
                                    style={{
                                        fontSize: "1.6rem",
                                        display: "block",
                                        margin: "0.2rem 0",
                                    }}
                                >
                                    {completedCount} {t.completedOf}{" "}
                                    {medications.length}
                                </strong>
                                <span
                                    style={{
                                        color: "#94a3b8",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {t.progressToday}
                                </span>
                            </article>
                        </div>

                        <section
                            className="panel"
                            style={{
                                background: "#fff",
                                padding: "2rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)",
                            }}
                        >
                            <div
                                className="panel-heading"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "1.5rem",
                                    flexWrap: "wrap",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <p
                                        className="eyebrow"
                                        style={{
                                            color: "var(--primary)",
                                            fontWeight: "700",
                                            fontSize: "0.8rem",
                                            letterSpacing: "1px",
                                        }}
                                    >
                                        {t.carePlan}
                                    </p>
                                    <h2 style={{ fontSize: "1.4rem" }}>
                                        {t.medSchedule}
                                    </h2>
                                </div>

                                <span
                                    style={{
                                        background: "#f1f5f9",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        color: "#475569",
                                    }}
                                >
                                    {new Date().toLocaleDateString(
                                        lang === "fr" ? "fr-FR" : "en-US",
                                        {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                        },
                                    )}
                                </span>
                            </div>

                            <form
                                onSubmit={handleAddMedication}
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "1.5rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder={t.medNamePlace}
                                    value={newMedName}
                                    onChange={(e) =>
                                        setNewMedName(e.target.value)
                                    }
                                    required
                                    style={{
                                        flex: 2,
                                        minWidth: "180px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.9rem",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder={t.dosagePlace}
                                    value={newDosage}
                                    onChange={(e) =>
                                        setNewDosage(e.target.value)
                                    }
                                    style={{
                                        flex: 1,
                                        minWidth: "110px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.9rem",
                                    }}
                                />
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    required
                                    style={{
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.9rem",
                                    }}
                                />
                                <button type="submit" className="cta-button">
                                    {t.addReminder}
                                </button>
                            </form>

                            {medications.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                        color: "#94a3b8",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {t.noMeds}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                    }}
                                >
                                    {medications.map((med) => (
                                        <div
                                            key={med.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 15px",
                                                background: med.is_taken
                                                    ? "#f8fafc"
                                                    : "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                textDecoration: med.is_taken
                                                    ? "line-through"
                                                    : "none",
                                                color: med.is_taken
                                                    ? "#94a3b8"
                                                    : "#1e293b",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            <div>
                                                <strong>
                                                    {med.medication_name}
                                                </strong>{" "}
                                                ({med.dosage})
                                            </div>
                                            <button
                                                onClick={() =>
                                                    toggleMedication(
                                                        med.id,
                                                        med.is_taken,
                                                    )
                                                }
                                                style={{
                                                    padding: "6px 12px",
                                                    background: med.is_taken
                                                        ? "#64748b"
                                                        : "#16a34a",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {med.is_taken
                                                    ? t.undo
                                                    : t.markTaken}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section
                            className="panel"
                            style={{
                                background: "#fff",
                                padding: "2rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)",
                            }}
                        >
                            <div
                                className="panel-heading"
                                style={{ marginBottom: "1.5rem" }}
                            >
                                <p
                                    className="eyebrow"
                                    style={{
                                        color: "var(--primary)",
                                        fontWeight: "700",
                                        fontSize: "0.8rem",
                                        letterSpacing: "1px",
                                    }}
                                >
                                    {t.messagesEyebrow}
                                </p>
                                <h2 style={{ fontSize: "1.4rem" }}>
                                    {t.messagesTitle}
                                </h2>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p
                                    style={{
                                        color: "#64748b",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {t.noDoctors}
                                </p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "5px",
                                                fontSize: "0.85rem",
                                                fontWeight: "600",
                                            }}
                                        >
                                            {t.selectDoctor}
                                        </label>
                                        <select
                                            value={recipientId}
                                            onChange={(e) =>
                                                setRecipientId(e.target.value)
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {availableUsers.map((doc) => (
                                                <option
                                                    key={doc.id}
                                                    value={doc.id}
                                                >
                                                    Dr. {doc.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div
                                        style={{
                                            height: "260px",
                                            overflowY: "auto",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "12px",
                                            marginBottom: "12px",
                                            background: "#f8fafc",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p
                                                style={{
                                                    color: "#94a3b8",
                                                    textAlign: "center",
                                                    margin: "auto",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {t.noMessages}
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe =
                                                    msg.sender_id ===
                                                    profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe
                                                                ? "flex-end"
                                                                : "flex-start",
                                                            background: isMe
                                                                ? "var(--primary)"
                                                                : "#e2e8f0",
                                                            color: isMe
                                                                ? "white"
                                                                : "#1e293b",
                                                            padding: "8px 12px",
                                                            borderRadius: "8px",
                                                            maxWidth: "75%",
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                margin: 0,
                                                                wordBreak:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <form
                                        onSubmit={handleSendMessage}
                                        style={{ display: "flex", gap: "8px" }}
                                    >
                                        <input
                                            type="text"
                                            placeholder={t.typeMsg}
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.9rem",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="cta-button"
                                            style={{ padding: "0 18px" }}
                                        >
                                            {t.send}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {showDonateModal && <DonationModal />}
        </div>
    );
}