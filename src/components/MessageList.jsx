'use client'

import { memo } from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const Message = memo(({ msg }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}
    >
        <Box
            sx={{
                maxWidth: '75%',
                px: 2,
                py: 1,
                borderRadius: 2,
                background: msg.sender === 'user' ? '#a3f5c4' : '#f5f9f9',
                fontSize: 15,
                color: 'black'
            }}
        >
            {msg.message}
            {/* {msg.file ? (
                <a
                    href={msg.file}
                    download={msg.message.split(': ')[1]}
                    style={{ color: '#0a3e38', textDecoration: 'underline' }}
                >
                    {msg.message}
                </a>
            ) : (
                msg.message
            )}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'left', mt: 0.5, opacity: 0.7 }}>
                {formatTimestamp(msg.timestamp)}
            </Typography> */}
        </Box>
    </motion.div>
))
Message.displayName = 'Message'

const MessageList = ({ allMessages, isTyping, chatEndRef }) => {
    return (
        <Box sx={{
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
        }}>
            {allMessages.map((msg, index) => (
                <Message key={index} msg={msg} />
            ))}

            {isTyping && (
                <Box display="flex" justifyContent="flex-end">
                    <Box
                        sx={{
                            px: 2,
                            pt: 1,
                            mb: 3,
                            borderRadius: 2,
                            color: '#20403c',
                            bgcolor: '#fff'
                        }}
                    >
                        <Icon icon="svg-spinners:3-dots-fade" width="24" height="24" />
                    </Box>
                </Box>
            )}

            <div ref={chatEndRef} />
        </Box>
    )
}

export default memo(MessageList)