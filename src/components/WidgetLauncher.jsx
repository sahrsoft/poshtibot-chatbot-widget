"use client"

import Image from "next/image"
import { Box } from "@mui/material"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function WidgetLauncher({ config, onClick }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // Prevent hydration mismatch

    const dir = config?.widget_position === "right" ? "rtl" : "ltr"
    const positionSide = config?.widget_position || "right"


    return (
        <motion.div
            key="widget-launcher"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
                direction: dir,
                display: "flex",
                position: "fixed",
                bottom: 40,
                [positionSide]: 40,
                zIndex: 9999,
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
            }}
            onClick={onClick}
        >
            {/* Icon Button */}
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: config?.icon_background_color || "#00d285",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.14)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.08)",
                        transition: "transform 0.3s ease",
                    }
                }}
            >
                <Image
                    src={
                        config?.logo_url
                            ? process.env.NEXT_PUBLIC_API_SERVER_URL + config.logo_url
                            : "/images/whiteicon.png"
                    }
                    width={25}
                    height={25}
                    alt="Chatbot Logo"
                    style={{ objectFit: "contain" }}
                />
            </Box>

            {/* Label */}
            {config?.label_text &&
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Box
                        sx={{
                            background: config?.label_background_color || "#fff",
                            color: config?.label_color || "#000",
                            borderRadius: "25px",
                            px: 2,
                            py: 1,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            fontFamily: "Vazir"
                        }}
                    >
                        {config?.label_text}
                    </Box>
                </motion.div>}
        </motion.div>
    )
}