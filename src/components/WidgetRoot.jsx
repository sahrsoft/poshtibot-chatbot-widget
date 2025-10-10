"use client";
import { useState } from "react";
import { Box, Fab, Zoom, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

export default function WidgetRoot({ appId }) {
    const [open, setOpen] = useState(false);

    return (
        <>
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
                    }}
                >
                    Ask here
                </Paper>
            </Zoom>

            <Fab
                onClick={() => setOpen(!open)}
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    bgcolor: "#0078FF",
                    color: "white",
                    "&:hover": { bgcolor: "#005FCC" },
                    transform: open ? "rotate(45deg)" : "none",
                    transition: "transform 0.3s",
                    zIndex: 9999,
                }}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </Fab>

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
                    src={`http://localhost:3000/chat?app_id=${appId}`}
                    title="Poshtibot chat"
                    style={{ width: "100%", height: "100%", border: "none" }}
                />
            </Box>
        </>
    );
}
