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

    // Fetch medications when profile loads and is a patient
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

            if (error) {
                setProfileError(error.message);
            }

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
                    setProfileError(
                        "No profile was returned. Check your profiles table permissions."
                    );
                } else {
                    setProfile(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setProfileError(
                        error.message || "Unable to load your profile."
                    );
                }
            } finally {
                if (!cancelled) {
                    setProfileLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [session?.user?.id]);

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setProfileError(error.message);
        }
    }

    // Fetch users to chat with (Doctors see Patients, Patients see Doctors)
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

    // Fetch messages and subscribe to real-time updates safely
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

            if (!error && data) {
                setMessages(data);
            }
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

    if (loading) {
        return <main className="status-screen">Loading Octobre Rose...</main>;
    }

    if (!session) {
        return <Auth />;
    }

    if (profileError) {
        return (
            <main className="status-screen">
                <h1>We couldn't load your profile</h1>
                <p>{profileError}</p>
                <button onClick={handleLogout}>Log out</button>
            </main>
        );
    }

    if (profileLoading || !profile) {
        return <main className="status-screen">Loading your profile...</main>;
    }

    const isDoctor = profile.role === "doctor";
    const completedCount = medications.filter((m) => m.is_taken).length;

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="#">
                    <span className="brand-mark">✿</span>
                    <span>Octobre Rose</span>
                </a>

                <div className="account-area">
                    <div className="account-info">
                        <strong>{profile.full_name}</strong>
                        <span>{isDoctor ? "Doctor" : "Patient"}</span>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </header>

            <main className="dashboard">
                <section className="welcome-section">
                    <div>
                        <p className="eyebrow">
                            {isDoctor ? "DOCTOR SPACE" : "YOUR PERSONAL SPACE"}
                        </p>

                        <h1>
                            {isDoctor
                                ? `Welcome, Dr. ${profile.full_name}`
                                : `Hello, ${profile.full_name} 💗`}
                        </h1>

                        <p className="welcome-description">
                            {isDoctor
                                ? "Your workspace for supporting patients throughout their care."
                                : "One step at a time. We're here to help you stay on track with your care."}
                        </p>
                    </div>

                    <div className="welcome-decoration" aria-hidden="true">
                        ♡
                    </div>
                </section>

                {isDoctor ? (
                    <>
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">DOCTOR WORKSPACE</p>
                                    <h2>Patient Care Management</h2>
                                </div>
                            </div>
                            <p style={{ color: "#666" }}>
                                Use the chat section below to communicate directly with your registered patients.
                            </p>
                        </section>

                        {/* Doctor's Chat Section */}
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">REAL-TIME COMMUNICATION</p>
                                    <h2>Patient Messages</h2>
                                </div>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p style={{ color: "#666" }}>
                                    No patients registered in the app yet.
                                </p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "5px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Select Patient:
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
                                                border: "1px solid #ccc",
                                            }}
                                        >
                                            {availableUsers.map((pat) => (
                                                <option
                                                    key={pat.id}
                                                    value={pat.id}
                                                >
                                                    {pat.full_name} (Patient)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Messages Display Box */}
                                    <div
                                        style={{
                                            height: "250px",
                                            overflowY: "auto",
                                            border: "1px solid #eee",
                                            borderRadius: "8px",
                                            padding: "15px",
                                            marginBottom: "15px",
                                            background: "#fafafa",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p
                                                style={{
                                                    color: "#888",
                                                    textAlign: "center",
                                                    margin: "auto",
                                                }}
                                            >
                                                No messages yet with this patient.
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe =
                                                    msg.sender_id === profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe
                                                                ? "flex-end"
                                                                : "flex-start",
                                                            background: isMe
                                                                ? "#e83e8c"
                                                                : "#e2e8f0",
                                                            color: isMe
                                                                ? "white"
                                                                : "#333",
                                                            padding: "10px 15px",
                                                            borderRadius: "12px",
                                                            maxWidth: "70%",
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

                                    {/* Message Input Form */}
                                    <form
                                        onSubmit={handleSendMessage}
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                padding: "10px 20px",
                                                background: "#e83e8c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Send
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
                                <span className="summary-icon">♡</span>
                                <p>Today's medication</p>
                                <strong>{medications.length} scheduled</strong>
                                <span className="muted">
                                    Your daily treatment plan
                                </span>
                            </article>

                            <article className="summary-card">
                                <span className="summary-icon">✓</span>
                                <p>Doses completed</p>
                                <strong>
                                    {completedCount} of {medications.length}{" "}
                                    completed
                                </strong>
                                <span className="muted">
                                    Your progress today
                                </span>
                            </article>
                        </section>

                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">YOUR CARE PLAN</p>
                                    <h2>Medication schedule</h2>
                                </div>

                                <span className="date-label">
                                    {new Date().toLocaleDateString(undefined, {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>

                            <form
                                onSubmit={handleAddMedication}
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginBottom: "20px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Medication name (e.g. Tamoxifen)"
                                    value={newMedName}
                                    onChange={(e) =>
                                        setNewMedName(e.target.value)
                                    }
                                    required
                                    style={{
                                        flex: 2,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Dosage (e.g. 20mg)"
                                    value={newDosage}
                                    onChange={(e) =>
                                        setNewDosage(e.target.value)
                                    }
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) =>
                                        setNewTime(e.target.value)
                                    }
                                    required
                                    style={{
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        padding: "10px 20px",
                                        background: "#e83e8c",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Add Reminder
                                </button>
                            </form>

                            {medications.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">♡</div>
                                    <h3>No medications scheduled yet</h3>
                                    <p>
                                        Add your reminders above to keep track of
                                        your daily care plan.
                                    </p>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                    }}
                                >
                                    {medications.map((med) => (
                                        <div
                                            key={med.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "15px",
                                                background: med.is_taken
                                                    ? "#f8f9fa"
                                                    : "#fff",
                                                border: "1px solid #eee",
                                                borderRadius: "8px",
                                                textDecoration: med.is_taken
                                                    ? "line-through"
                                                    : "none",
                                                color: med.is_taken
                                                    ? "#888"
                                                    : "#000",
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
                                                        med.is_taken
                                                    )
                                                }
                                                style={{
                                                    padding: "8px 14px",
                                                    background: med.is_taken
                                                        ? "#6c757d"
                                                        : "#28a745",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {med.is_taken
                                                    ? "Undo"
                                                    : "Mark as Taken"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Real-Time Chat Section */}
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">REAL-TIME SUPPORT</p>
                                    <h2>Chat with your care team</h2>
                                </div>
                            </div>

                            {availableUsers.length === 0 ? (
                                <p style={{ color: "#666" }}>
                                    No doctors available to chat with right now.
                                </p>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: "15px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "5px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Select Doctor:
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
                                                border: "1px solid #ccc",
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

                                    {/* Messages Display Box */}
                                    <div
                                        style={{
                                            height: "250px",
                                            overflowY: "auto",
                                            border: "1px solid #eee",
                                            borderRadius: "8px",
                                            padding: "15px",
                                            marginBottom: "15px",
                                            background: "#fafafa",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        {messages.length === 0 ? (
                                            <p
                                                style={{
                                                    color: "#888",
                                                    textAlign: "center",
                                                    margin: "auto",
                                                }}
                                            >
                                                No messages yet. Send a message
                                                to start the conversation!
                                            </p>
                                        ) : (
                                            messages.map((msg) => {
                                                const isMe =
                                                    msg.sender_id === profile.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        style={{
                                                            alignSelf: isMe
                                                                ? "flex-end"
                                                                : "flex-start",
                                                            background: isMe
                                                                ? "#e83e8c"
                                                                : "#e2e8f0",
                                                            color: isMe
                                                                ? "white"
                                                                : "#333",
                                                            padding: "10px 15px",
                                                            borderRadius: "12px",
                                                            maxWidth: "70%",
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

                                    {/* Message Input Form */}
                                    <form
                                        onSubmit={handleSendMessage}
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            style={{
                                                padding: "10px 20px",
                                                background: "#e83e8c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>
                            )}
                        </section>
                    </>
                )}

                <footer className="dashboard-footer">
                    Octobre Rose · Care, support, and hope 💗
                </footer>
            </main>
        </div>
    );
}