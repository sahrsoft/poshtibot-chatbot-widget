'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Box, TextField, IconButton, Popover, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import EmojiPicker from 'emoji-picker-react'
import stickerCircleLinear from '@iconify-icons/solar/sticker-circle-linear'
import telegram from '@iconify-icons/fa6-brands/telegram'

const ChatInput = ({ isTyping, onSendMessage, onTyping, onStopTyping }) => {
  const [input, setInput] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const typingTimer = useRef(null)
  const isTypingEmitted = useRef(false)
  const inputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      if (isTypingEmitted.current && onStopTyping) onStopTyping()
    }
  }, [onStopTyping])

  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isTyping])

  const emitTypingStart = useCallback(() => {
    if (!isTypingEmitted.current && onTyping) {
      onTyping()
      isTypingEmitted.current = true
    }
  }, [onTyping])

  const emitTypingEnd = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      if (isTypingEmitted.current && onStopTyping) {
        onStopTyping()
        isTypingEmitted.current = false
      }
    }, 2000)
  }, [onStopTyping])

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value
      setInput(value)
      if (value.trim()) {
        emitTypingStart()
        emitTypingEnd()
      } else {
        if (typingTimer.current) clearTimeout(typingTimer.current)
        if (isTypingEmitted.current && onStopTyping) {
          onStopTyping()
          isTypingEmitted.current = false
        }
      }
    },
    [emitTypingStart, emitTypingEnd, onStopTyping]
  )

  const handleEmojiClick = useCallback(
    (emoji) => {
      const ch = emoji?.native || emoji?.emoji || ''
      const newValue = input + ch
      setInput(newValue)
      setAnchorEl(null)
      if (newValue.trim()) {
        emitTypingStart()
        emitTypingEnd()
      }
    },
    [input, emitTypingStart, emitTypingEnd]
  )

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return
      if (typingTimer.current) clearTimeout(typingTimer.current)
      if (isTypingEmitted.current && onStopTyping) {
        onStopTyping()
        isTypingEmitted.current = false
      }
      onSendMessage(trimmed)
      setInput('')
    },
    [input, onSendMessage, onStopTyping]
  )

  return (
    <Box sx={{ px: 1, py: 1, bgcolor: '#fff' }}>
      <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            p: 1,
            border: '1px solid #e3eded',
            '&:hover': { borderColor: 'rgb(0, 210, 133)' }
          }}
        >
          <Icon icon={stickerCircleLinear} width='20' height='20' style={{ color: '#577e7d' }} />
        </IconButton>

        <TextField
          inputRef={inputRef}
          autoFocus
          disabled={isTyping}
          size='small'
          variant='outlined'
          value={input}
          onChange={handleInputChange}
          placeholder='پیام خود را وارد کنید'
          fullWidth
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '120px',
              backgroundColor: '#fff',
              '& fieldset': { borderColor: '#e3eded' },
              '&:hover fieldset': { borderColor: 'rgb(0, 210, 133)' },
              '&.Mui-focused fieldset': {
                border: '1px solid',
                borderColor: 'rgb(0, 210, 133)'
              }
            },
            '& .MuiInputBase-input': {
              color: '#20403c',
              fontSize: 15,
              padding: '8px 16px'
            }
          }}
        />

        <IconButton type='submit' sx={{ p: 0.5 }} disabled={!input.trim()}>
          <Icon icon={telegram} fontSize={32} style={{ color: input.trim() ? 'rgb(0, 210, 133)' : '#c0c0c0' }} />
        </IconButton>
      </Box>

      <Typography textAlign='center' sx={{ color: '#577e7d', fontSize: 12, pt: 1 }}>
        قدرت گرفته از پشتیبات 💚
      </Typography>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          root: { sx: { zIndex: 9999 } },
          paper: {
            sx: {
              maxWidth: { xs: '100vw' },
              direction: 'ltr',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#accbbd #f5f9f9'
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
