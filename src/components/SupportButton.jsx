'use client'

import { memo } from 'react'
import { Box } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'

const SupportButton = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="support-btn"
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <Box display="flex" justifyContent="center" mt={1.5}>
                        <Box
                            sx={{
                                mt: -2.5,
                                border: '1px solid rgba(74, 255, 186, 0.23)',
                                borderBottom: 'none',
                                bgcolor: 'rgba(74, 255, 198, 0.09)',
                                borderRadius: 2,
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: 0,
                                color: "#00d285",
                                px: 1,
                                py: .5,
                                fontSize: 13,
                                cursor: "pointer"
                            }}
                        >
                            درخواست پشتیبان انسانی
                        </Box>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default memo(SupportButton)