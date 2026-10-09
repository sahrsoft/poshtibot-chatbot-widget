'use client'

import { memo } from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import threeDotsFade from '@iconify-icons/svg-spinners/3-dots-fade'

const Message = memo(({ msg }) => {
  // const messageText =
  //   typeof msg?.message === 'string'
  //     ? msg.message
  //     : typeof msg?.message?.text === 'string'
  //       ? msg.message.text
  //       : typeof msg?.message?.message === 'string'
  //         ? msg.message.message
  //         : typeof msg?.message?.content === 'string'
  //           ? msg.message.content
  //           : ''

  return (
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
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      >
        {msg.audio_url ? (
          <Box component='audio' controls src={msg.audio_url} sx={{ width: '100%', mt: msg.message ? 1 : 0 }} />
        ) : null}
        {msg.file_url ? (
          <Box
            component='a'
            href={msg.file_url}
            target='_blank'
            rel='noreferrer'
            sx={{ display: 'block', color: '#0a7a4b', mt: msg.message ? 1 : 0 }}
          >
            دانلود فایل
          </Box>
        ) : null}
        {msg.message}
      </Box>
    </motion.div>
  )
})
Message.displayName = 'Message'

const MessageList = ({ allMessages, isTyping, chatEndRef, agentStatus }) => (
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

    {isTyping && agentStatus !== 'joined' ? (
      <Box display='flex' justifyContent='flex-end'>
        <Box sx={{ px: 2, pt: 1, mb: 3, borderRadius: 2, color: '#20403c', bgcolor: '#fff' }}>
          <Icon icon={threeDotsFade} width='24' height='24' />
        </Box>
      </Box>
    ) : null}

    <div ref={chatEndRef} />
  </Box>
)

export default memo(MessageList)
