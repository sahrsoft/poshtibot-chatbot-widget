'use client'

import { memo, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useChat } from '@/hooks/useChat'

const AgentButton = ({ userId, conversationId, isVisible }) => {

    const { requestForAgent, pendingForAgent } = useChat({ userId, conversationId })

    const handleRequestForAgent = useCallback(() => {
        requestForAgent(conversationId)
    }, [conversationId])


    return (
        <AnimatePresence>
            {isVisible && !pendingForAgent && (
                <motion.div
                    key="support-btn"
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <Box display="flex" justifyContent="center" mt={1.5}>
                        <Button
                            onClick={handleRequestForAgent}
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
                        </Button>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default memo(AgentButton)