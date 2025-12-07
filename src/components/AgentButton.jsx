'use client'

import { memo, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useChat } from '@/hooks/useChat'
import { LOCAL_STORAGE_CHAT_DATA_KEY } from '@/lib/constants'

const AgentButton = ({ chatbotId, userId, chatId, isVisible, userFlowsData }) => {

  const { requestForAgent, agentStatus } = useChat({ chatbotId, userId, chatId })

  const handleRequestForAgent = useCallback(() => {
    requestForAgent(chatId, userFlowsData)

    const chatData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CHAT_DATA_KEY))
    const updated = {
      ...chatData,
      agent_status: "pending"
    }
    chatData && localStorage.setItem(LOCAL_STORAGE_CHAT_DATA_KEY, JSON.stringify(updated))
  }, [chatId])


  return (
    <AnimatePresence>
      {isVisible && (agentStatus === "none") && (
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