"use client"

import Image from "next/image"
import { Box } from "@mui/material"
import { motion } from "framer-motion"

export function WidgetLauncher({ config, onClick }) {
    return (
        <motion.div
            key="widget-launcher"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
                display: 'flex',
                position: 'fixed',
                bottom: 40,
                [config?.widget_position || "right"]: 40,
                zIndex: 9999,
                alignItems: 'center',
                gap: '8px', // Equivalent to theme.spacing(1)
                cursor: 'pointer',
            }}
            onClick={onClick}
        >

            {/* Icon Button */}
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: config?.icon_background_color || '#00d285',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.14)',
                    transition: "transform 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.1)",
                        transition: "transform 0.3s ease"
                    }
                }}
            >
                {config?.logo_url ? (
                    <Image
                        src={`https://server.poshtibot.com${config.logo_url}`}
                        width={25} height={25} alt="Chatbot Logo"
                        style={{ objectFit: 'contain' }}
                    />
                ) : (
                    <Image
                        src="/images/whiteicon.png"
                        width={25} height={28} alt="Poshtibot Logo"
                        style={{ objectFit: 'contain' }}
                    />
                )}
            </Box>

            {/* Label */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Box sx={{
                    background: config?.label_background_color || '#fff',
                    color: config?.label_color || '#000',
                    borderRadius: '25px',
                    px: 2,
                    py: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontFamily: 'Vazir',
                }}>
                    {config?.label_text || "از من بپرس 😊"}
                </Box>
            </motion.div>
        </motion.div>
    )
}