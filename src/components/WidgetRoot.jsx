"use client";
import { useState } from "react";
import { Box, Fab, Typography, Zoom, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

export default function WidgetRoot({ appId, primaryColor = "#0078FF", labelText = "Ask here" }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating Label */}
            <Zoom in={!open}>
                <Paper
                    sx={{
                        position: "fixed",
                        bottom: 90,
                        right: 90,
                        px: 2,
                        py: 1,
                        borderRadius: 3,
                        boxShadow: 3,
                        fontSize: 14,
                        cursor: "default",
                        transition: "all 0.3s",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    {labelText}
                </Paper>
            </Zoom>

            {/* Chat Button */}
            <Fab
                onClick={() => setOpen(!open)}
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    bgcolor: primaryColor,
                    color: "white",
                    "&:hover": { bgcolor: "#005FCC" },
                    transition: "transform 0.3s",
                    transform: open ? "rotate(45deg)" : "none",
                    zIndex: 9999,
                }}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </Fab>

            {/* Iframe Container */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 90,
                    right: 30,
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
                    src={`https://widget.poshtibot.com/widget?app_id=${appId}`}
                    title="Poshtibot chat widget"
                    style={{ width: "100%", height: "100%", border: "none" }}
                />

            </Box>
        </>
    );
}
