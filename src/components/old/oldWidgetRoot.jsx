"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Box, Fab } from "@mui/material"
import { AnimatePresence, motion } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'


export default function WidgetRoot({ chatbotId }) {
    const [open, setOpen] = useState(false)
    const [config, setConfig] = useState({})

    useEffect(() => {
        const chatData = localStorage.getItem("poshtibot-chat-data")
        if (!chatData) {
            const chatData = {
                "poshtibot_chat_id": uuidv4(),
                "poshtibot_user_id": uuidv4()
            }
            localStorage.setItem("poshtibot-chat-data", JSON.stringify(chatData))
        }
        const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config"))
        setConfig(pwc)
    }, [])


    useEffect(() => {
        const getConfig = async () => {
            try {
                const res = await fetch(
                    `https://server.poshtibot.com/api/method/poshtibot.api.get_widget_config?chatbot_id=${chatbotId}`
                )
                const data = await res.json()
                setConfig(data?.message)

                const pwc = JSON.stringify(data?.message)

                localStorage.setItem("poshtibot-widget-config", pwc)

            } catch (e) {
                console.warn("Using default config", e)
                setConfig({
                    primary_color: "#00d285",
                    label_text: "از من بپرس 😊",
                    label_color: "#fff",
                    label_background_color: "#00d285",
                    font_family: "sans-serif",
                    icon_color: "#fff",
                    icon_background_color: "#00d285",
                    logo_url: "",
                    widget_position: "right",
                    user_flows_data: "",
                    agent_handoff: 0
                })
            }
        }

        getConfig()
    }, [chatbotId])


    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === "CLOSE_CHAT_WIDGET") {
                setOpen(false)
            }
        }

        window.addEventListener("message", handleMessage)

        return () => window.removeEventListener("message", handleMessage)
    }, [])

    return (
        <>
            <AnimatePresence mode="wait">
                {open ? null : (
                    <motion.div
                        key="closed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        layout
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                position: 'fixed',
                                bottom: 40,
                                [config?.widget_position || "right"]: 40,
                                zIndex: 9999,
                            }}
                        >
                            <Box
                                onClick={() => setOpen(true)}
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    background: config?.icon_background_color || '#00d285',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.14)',
                                    "&:hover": {
                                        transform: "scale(1.1)",
                                        transition: "transform 0.3s ease",
                                    },
                                }}
                            >
                                {config?.logo_url ? (
                                    <Image
                                        src={`https://server.poshtibot.com${config?.logo_url}`}
                                        width={25}
                                        height={25}
                                        alt="poshtibot"
                                        style={{ objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Image
                                        src="/images/whiteicon.png"
                                        width={25}
                                        height={28}
                                        alt="poshtibotlogo"
                                        style={{ objectFit: 'contain' }}
                                    />
                                )}
                            </Box>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <Box
                                    sx={{
                                        background: config?.label_background_color || '#fff',
                                        color: config?.label_color || '#000',
                                        borderRadius: '25px',
                                        px: 2,
                                        py: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        fontFamily: 'Vazir',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setOpen(true)}
                                >
                                    {config?.label_text || "از من بپرس 😊"}
                                </Box>
                            </motion.div>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* {open ? "" : (
                <Fab
                    size="medium"
                    onClick={() => setOpen(!open)}
                    sx={{
                        position: "fixed",
                        bottom: 40,
                        [config?.widget_position || "right"]: 40,
                        bgcolor: config?.icon_background_color || "#00d285",
                        color: config?.icon_color || "#fff",
                        "&:hover": {
                            bgcolor: `color-mix(in srgb, ${config?.icon_background_color} 90%, black)`,
                            // transform: "scale(1.1)"
                            transform: config?.logo_url ? "scale(1.1)" : "",
                        },
                        // "&:hover": { bgcolor: "#005FCC" },
                        transform: config?.logo_url ? "none" : (open ? "rotate(90deg)" : "none"),
                        transition: "transform 0.3s",
                        zIndex: 9999,
                    }}
                >
                    {config?.logo_url ? (
                        <Image src={`https://server.poshtibot.com${config?.logo_url}`} width={24} height={24} alt="poshtibot" />
                    ) : (
                        <Image src='/images/whiteicon.png' width={24} height={30} alt="poshtibotlogo" style={{ marginTop: -2 }} />

                    )}
                </Fab>
            )} */}

            <Box
                sx={{
                    position: "fixed",
                    bottom: { xs: 0, sm: 40 },
                    [config?.widget_position || "right"]: { xs: 0, sm: 45 },
                    width: { xs: '100%', sm: 380 },
                    height: { xs: '100%', sm: 600 },
                    borderRadius: { xs: 0, sm: 7 },
                    overflow: "hidden",
                    boxShadow: 5,
                    transformOrigin: "bottom right",
                    transform: open ? "scale(1)" : "scale(0)",
                    opacity: open ? 1 : 0,
                    transition: "all 0.35s ease",
                    zIndex: 9998,
                    background: "#fff",
                }}
            >
                <iframe
                    // src={`https://widget.poshtibot.com/chat?chatbot_id=${chatbotId}`}
                    src={`http://localhost:3000/chat?chatbot_id=${chatbotId}`}
                    title="Poshtibot chat"
                    style={{ width: "100%", height: "100%", border: "none" }}
                />
            </Box>
        </>
    )
}
