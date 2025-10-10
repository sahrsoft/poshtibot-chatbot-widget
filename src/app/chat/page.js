"use client";
import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

export default function ChatPage() {
    const [messages, setMessages] = useState([{ from: "bot", text: "Hi! How can I help you?" }]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message immediately
        const newMessages = [...messages, { from: "user", text: input }];
        setMessages(newMessages);
        setInput("");

        // Send message to Frappe API
        try {
            const res = await fetch("https://api.poshtibot.com/api/method/chatbot.get_reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();
            const botReply = data.message || "Sorry, I didn’t understand that.";
            setMessages([...newMessages, { from: "bot", text: botReply }]);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Typography sx={{ p: 2, bgcolor: "#0078FF", color: "white" }}>
                Poshtibot Support
            </Typography>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                {messages.map((msg, i) => (
                    <Paper
                        key={i}
                        sx={{
                            p: 1,
                            mb: 1,
                            maxWidth: "80%",
                            bgcolor: msg.from === "user" ? "#e3f2fd" : "#f1f1f1",
                            alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        {msg.text}
                    </Paper>
                ))}
            </Box>

            <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #ddd" }}>
                <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} variant="contained" sx={{ ml: 1 }}>
                    Send
                </Button>
            </Box>
        </Box>
    );
}
