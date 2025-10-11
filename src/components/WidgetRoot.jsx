"use client";
import { useEffect, useState } from "react";
import { Box, Fab, Zoom, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

export default function WidgetRoot({ chatbotId }) {
    const [open, setOpen] = useState(false)
    const [config, setConfig] = useState({})

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
                    primary_color: "#007bff",
                    label_text: "از من بپرس 😊",
                    label_color: "#000",
                    label_background_color: "#fff",
                    font_family: "sans-serif",
                    icon_color: "#fff",
                    logo_url: "",
                    widget_position: "right-bottom"
                })
            }
        }

        getConfig()
    }, [chatbotId])


    return (
        <>
            <Zoom in={!open}>
                <Paper
                    sx={{
                        direction: "rtl",
                        position: "fixed",
                        bottom: 80,
                        [config?.widget_position || "right"]: 90,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: 3,
                        fontFamily: "Peyda",
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: "default",
                        bgcolor: config?.label_background_color || "#fff",
                        color: config?.label_color || "#000"
                    }}
                >
                    {config?.label_text ? config?.label_text : "از من بپرس 😊"}
                </Paper>
            </Zoom>

            <Fab
                size="medium"
                onClick={() => setOpen(!open)}
                sx={{
                    position: "fixed",
                    bottom: 24,
                    [config?.widget_position || "right"]: 24,
                    bgcolor: config?.icon_background_color || "#0078FF",
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
                    open ? <CloseIcon /> : <ChatIcon />
                )}
            </Fab>

            <Box
                sx={{
                    position: "fixed",
                    bottom: 90,
                    [config?.widget_position || "right"]: 30,
                    width: 400,
                    height: 600,
                    borderRadius: 3,
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
                    src={`http://localhost:3000/chat?chatbot_id=${chatbotId}`}
                    title="Poshtibot chat"
                    style={{ width: "100%", height: "100%", border: "none" }}
                />
            </Box>
        </>
    );
}
