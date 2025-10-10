"use client"

import { useEffect, useState } from "react"
import { Box, Button, Typography, Paper, Input, Grid } from "@mui/material"
import SendIcon from '@mui/icons-material/Send'

export default function ChatWidget() {
    const [messages, setMessages] = useState([{ from: "bot", text: "سلام، چطور می تونم کمک تون کنم؟" }])
    const [input, setInput] = useState("")
    const [config, setConfig] = useState({})

    useEffect(() => {
        const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config"))
        setConfig(pwc)
    }, [])

    const sendMessage = async () => {
        if (!input.trim()) return

        // Add user message immediately
        const newMessages = [...messages, { from: "user", text: input }]
        setMessages(newMessages)
        setInput("")

        // Send message to Frappe API
        try {
            const res = await fetch("https://server.poshtibot.com/api/method/poshtibot.api.send_msg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
            })
            const data = await res.json()
            const botReply = data.message || "Sorry, I didn’t understand that."
            setMessages([...newMessages, { from: "bot", text: botReply }])
        } catch (err) {
            console.error(err)
            const botReply = "Sorry, I didn’t understand that."
            setMessages([...newMessages, { from: "bot", text: botReply }])
        }
    }

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Typography sx={{ p: 2, bgcolor: config?.primary_color || "#0078FF", color: "white" }}>
                پشتیبات
            </Typography>

            <Grid container flexDirection={"column"} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                {messages.map((msg, i) => (
                    <Paper
                        key={i}
                        sx={{
                            p: 1,
                            mb: 1,
                            maxWidth: "80%",
                            bgcolor: msg.from === "user" ? "#e3f2fd" : "#f1f1f1",
                            alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                            fontFamily: "Peyda",
                            // color: msg.from === "user" ? "#e3f2fd" : "#f1f1f1",
                        }}
                    >
                        {msg.text}
                    </Paper>
                ))}
            </Grid>

            <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #ddd" }}>
                <Input
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سوال خود را بپرسید..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    sx={{ direction: "rtl" }}
                />
                <Button onClick={sendMessage} sx={{ ml: 1 }}>
                    <SendIcon />
                </Button>
            </Box>
        </Box>
    )
}