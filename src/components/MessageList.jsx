'use client'

import { memo } from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import threeDotsFade from '@iconify-icons/svg-spinners/3-dots-fade'

const Message = memo(({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    style={{
      display: 'flex',
      justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end'
    }}
  >
    <Box
      sx={{
        maxWidth: '75%',
        px: 2,
        py: 1,
        borderRadius: 2,
        background: msg.sender === 'user' ? '#a3f5c4' : '#f5f9f9',
        fontSize: 15,
        color: 'black',
        wordBreak: 'break-word'
      }}
    >
      {msg.message}
    </Box>
  </motion.div>
))
Message.displayName = 'Message'

const MessageList = ({ allMessages, isTyping, chatEndRef }) => (
  <Box
    sx={{
      flexGrow: 1,
      p: 1.5,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      scrollbarWidth: 'thin',
      scrollbarColor: '#accbbd #f5f9f9',
      '&::-webkit-scrollbar': { width: '10px' },
      '&::-webkit-scrollbar-thumb': { background: '#accbbd', borderRadius: '4px' },
      '&::-webkit-scrollbar-track': { background: '#f5f9f9', borderRadius: '4px' }
    }}
  >
    {allMessages.map((msg) => (
      <Message key={msg.id} msg={msg} />
    ))}

    {isTyping && (
      <Box display='flex' justifyContent='flex-end'>
        <Box sx={{ px: 2, pt: 1, mb: 3, borderRadius: 2, color: '#20403c', bgcolor: '#fff' }}>
          <Icon icon={threeDotsFade} width='24' height='24' />
        </Box>
      </Box>
    )}

    <div ref={chatEndRef} />
  </Box>
)

export default memo(MessageList)
