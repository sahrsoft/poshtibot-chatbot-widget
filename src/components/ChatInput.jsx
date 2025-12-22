'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Box, TextField, IconButton, Popover, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import EmojiPicker from 'emoji-picker-react'

const ChatInput = ({ isTyping, onSendMessage, onTyping, onStopTyping }) => {
  const [input, setInput] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)

  const typingTimeoutRef = useRef(null)
  const hasEmittedTypingRef = useRef(false)

  const handleEmojiClick = useCallback((emoji) => {
    const ch = emoji?.native || emoji?.emoji || (typeof emoji === 'string' ? emoji : '')
    const newValue = input + ch
    setInput(newValue)
    setAnchorEl(null)

    // Trigger typing event for emoji input
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    // Emit typing if not already emitted
    if (newValue.trim() && !hasEmittedTypingRef.current && onTyping) {
      onTyping()
      hasEmittedTypingRef.current = true
    }

    // Set timeout to emit stop_typing after user stops typing (2 seconds)
    typingTimeoutRef.current = setTimeout(() => {
      if (hasEmittedTypingRef.current && onStopTyping) {
        onStopTyping()
        hasEmittedTypingRef.current = false
      }
    }, 2000)
  }, [input, onTyping, onStopTyping])

  // Handle typing with debouncing
  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    setInput(value)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    // If input becomes empty, emit stop_typing immediately
    if (!value.trim()) {
      if (hasEmittedTypingRef.current && onStopTyping) {
        onStopTyping()
        hasEmittedTypingRef.current = false
      }
      return
    }

    // Emit typing if not already emitted and input has content
    if (!hasEmittedTypingRef.current && onTyping) {
      onTyping()
      hasEmittedTypingRef.current = true
    }

    // Set timeout to emit stop_typing after user stops typing (2 seconds)
    typingTimeoutRef.current = setTimeout(() => {
      if (hasEmittedTypingRef.current && onStopTyping) {
        onStopTyping()
        hasEmittedTypingRef.current = false
      }
    }, 2000)
  }, [onTyping, onStopTyping])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedMessage = input.trim()
    if (!trimmedMessage) return

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }

    // Emit stop_typing when message is sent
    if (hasEmittedTypingRef.current && onStopTyping) {
      onStopTyping()
      hasEmittedTypingRef.current = false
    }

    onSendMessage(trimmedMessage)
    setInput("")
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      // Emit stop_typing on unmount if we were typing
      if (hasEmittedTypingRef.current && onStopTyping) {
        onStopTyping()
      }
    }
  }, [onStopTyping])


  return (
    <Box sx={{ px: 1, py: 1, bgcolor: '#fff' }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 1, border: '1px solid #e3eded', '&:hover': { borderColor: 'rgb(0, 210, 133)' } }}
        >
          <Icon icon="solar:sticker-circle-linear" width="20" height="20" style={{ color: '#577e7d' }} />
        </IconButton>

        <TextField
          className='light-bg-input-autofill'
          disabled={isTyping}
          size="small"
          variant="outlined"
          value={input}
          onChange={handleInputChange}
          placeholder="پیام خود را وارد کنید"
          fullWidth
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '120px',
              backgroundColor: '#fff',
              '& fieldset': { borderColor: '#e3eded' },
              '&:hover fieldset': { borderColor: 'rgb(0, 210, 133)' },
              '&.Mui-focused fieldset': { border: '1px solid', borderColor: 'rgb(0, 210, 133)' },
            },
            '& .MuiInputBase-input': {
              color: '#20403c',
              fontSize: 15,
              padding: '8px',
              px: 2
            },
          }}
        />

        <IconButton type="submit" sx={{ p: 0.5 }} disabled={!input.trim()}>
          <Icon icon="fa6-brands:telegram" fontSize={32} style={{ color: input.trim() ? "rgb(0, 210, 133)" : "#c0c0c0" }} />
        </IconButton>

        {/* {input ? (
                    <IconButton type="submit" sx={{ p: 0.5 }}>
                        <Icon icon="fa6-brands:telegram" fontSize={32} style={{ color: 'rgb(0, 210, 133)' }} />
                    </IconButton>
                ) : (
                    <IconButton onClick={() => fileInputRef.current.click()} sx={{
                        p: 1.25, border: '1px solid #e3eded', '&:hover': {
                            borderColor: 'rgb(0, 210, 133)'
                        },
                    }}>
                        <Icon icon="solar:paperclip-linear" width="20" height="20" style={{ color: '#577e7d' }} />
                    </IconButton>
                )} */}

      </Box>
      <Typography textAlign="center" sx={{ color: '#577e7d', fontSize: 12, pt: 1 }}>
        قدرت گرفته از پشتیبات 💚
      </Typography>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              maxWidth: { xs: '100vw' },
              direction: 'ltr',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f9f9',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#accbbd',
                borderRadius: '4px',
                '&:hover': {
                  background: '#20403c',
                },
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#accbbd #f5f9f9',
            }
          }
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
    </Box>
  )
}

export default memo(ChatInput)