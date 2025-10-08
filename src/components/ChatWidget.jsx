"use client";
import { useState } from "react";

export default function ChatWidget({ appId, theme }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const styles = {
        fontFamily: theme?.font_family || "sans-serif",
        backgroundColor: "#fff",
        borderTop: `4px solid ${theme?.primary_color || "#007bff"}`,
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column"
    };

    const sendMessage = async () => {
        if (!input) return;
        const userMsg = { text: input, from: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const res = await fetch(
                "https://api.poshtibot.com/api/method/chatbot.api.chat.send_message",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        app_id: appId,
                        user_id: "guest",
                        message: input,
                    }),
                }
            );

            const data = await res.json();
            const reply = data?.message?.reply || "No response";
            setMessages((prev) => [...prev, { text: reply, from: "bot" }]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { text: "Error contacting server", from: "bot" },
            ]);
        }
    };

    return (
        <div style={styles}>
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                }}
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            textAlign: m.from === "user" ? "right" : "left",
                            margin: "5px 0",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                background: m.from === "user" ? "#007bff" : "#f1f1f1",
                                color: m.from === "user" ? "#fff" : "#000",
                                padding: "8px 12px",
                                borderRadius: "12px",
                            }}
                        >
                            {m.text}
                        </span>
                    </div>
                ))}
            </div>
            <div style={{ display: "flex", padding: "10px" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, padding: "8px" }}
                />
                <button onClick={sendMessage} style={{ marginLeft: "8px" }}>
                    Send
                </button>
            </div>
        </div>
    );
}
