'use client'

import { useEffect, useState, useRef  } from "react"
import { Box,Typography,TextField, IconButton ,Popover, List, ListItem, ListItemText, ListItemIcon, Menu, MenuItem  } from "@mui/material"
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import EmojiPicker from "emoji-picker-react"

export default function ChatWidget() {
    const [messages, setMessages] = useState([{ from: "bot", text: "سلام، چطور می تونم کمک تون کنم؟" }])
    const [input, setInput] = useState("")
    const [config, setConfig] = useState({})
    const [notifications, setNotifications] = useState(true)
    const [anchorElChat, setAnchorElChat] = useState(null)
    const chatMenuOpen = Boolean(anchorElChat)

    useEffect(() => {
        const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config"))
        setConfig(pwc)
    }, [])

    const [typing, setTyping] = useState(false)
    const [botTypingText, setBotTypingText] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const id = anchorEl ? 'emoji-popover' : undefined
    const open = Boolean(anchorEl)
    const chatEndRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    const conversationStarters = [
        { id: '1', text: 'در مورد محصولات سوال دارم', enabled: true },
        { id: '2', text: 'وضعیت سفارش من', enabled: true },
    ]

    const hasUserMessage = messages.some(msg => msg.from === 'user')

    const handleStarterClick = (starterText) => {
        setInput(starterText)
        sendMessage()
    }

    const handleChatMenuOpen = (event) => {
        setAnchorElChat(event.currentTarget)
    }

    const handleChatMenuClose = () => {
        setAnchorElChat(null)
    }

    const handleToggleNotifications = () => {
        setNotifications(prev => !prev)
    }

    const handleEmojiButtonClick = (e) => setAnchorEl(e.currentTarget)
    const handleClosePopover = () => setAnchorEl(null)
    const handleEmojiClick = (emoji) => {
        const ch = emoji?.native || emoji?.emoji || (typeof emoji === 'string' ? emoji : '')
        setInput(prev => prev + ch)
        setAnchorEl(null)
    }
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setMessages(prev => [...prev, { from: 'user', text: `file: ${file.name}`, file: url, timestamp: Date.now() }])
    }
    const formatTimestamp = (ts) => {
        // If there's no timestamp, return empty string so UI stays clean
        if (!ts) return ''
        try {
            const d = new Date(ts)
            // Prefer Persian locale formatting if available
            return d.toLocaleString('fa-IR')
        } catch (e) {
            return String(ts)
        }
    }

    const sendMessage = async () => {
        if (!input.trim()) return

        // Add user message immediately
        const newMessages = [...messages, { from: "user", text: input }]
        setMessages(newMessages)
        setInput("")

        // Send message to Frappe API
        try {
            const res = await fetch("https://server.poshtibot.com/api/method/poshtibot.api.send_msg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
            })
            const data = await res.json()
            const botReply = data.message || "Sorry, I didn’t understand that."
            setMessages([...newMessages, { from: "bot", text: botReply }])
        } catch (err) {
            console.error(err)
            const botReply = "Sorry, I didn’t understand that."
            setMessages([...newMessages, { from: "bot", text: botReply }])
        }
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff', dir: 'rtl' }}>
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(210deg, rgb(0, 210, 133), rgba(54, 255, 165, 0.67))',
                    color: '#fff',
                    p: 2,
                    borderRadius: '16px 16px 0 0',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box>
                            <Typography sx={{ fontSize: 17 }}>
                                گفتگو با
                            </Typography>
                            <Typography fontSize={16}>ستایش سعادتی</Typography>
                        </Box>
                    </Box>
                    <Box>
                        <IconButton
                            onClick={handleChatMenuOpen}
                            sx={{ color: '#fff' }}
                        >
                            <Icon icon="solar:bell-linear" width="24" height="24" />
                        </IconButton>
                        <Menu
                            anchorEl={anchorElChat}
                            open={chatMenuOpen}
                            onClose={handleChatMenuClose}
                            PaperProps={{
                                sx: {
                                    borderRadius: '8px',
                                    border: '1px solid #e3eded',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    mt: 1,
                                },
                            }}
                        >
                            <MenuItem
                                onClick={handleToggleNotifications}
                                sx={{
                                    color: '#20403c',
                                    '&:hover': { bgcolor: 'rgba(0, 210, 133, 0.1)' },
                                }}
                            >
                                <Icon icon="solar:bell-linear" />
                                {notifications ? 'خاموش کردن اعلان‌ها' : 'روشن کردن اعلان‌ها'}
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    flexGrow: 1,
                    p: .5,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f5f9f9',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#accbbd',
                        borderRadius: '4px',
                        '&:hover': {
                            background: '#456a69',
                        },
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#accbbd #f5f9f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                {messages?.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'flex',
                            justifyContent: msg.from === 'user' ? 'flex-start' : 'flex-end',
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: { xs: '75%', sm: '70%' },
                                px: 2,
                                pt: 1.5,
                                pb: .5,
                                borderRadius: msg.from === 'user' ? '35px 35px 0 35px ' : '35px 35px 35px 0',
                                background: msg.from === 'user' ? 'rgba(0, 210, 133, 0.51)' : '#f5f9f9',
                                fontSize: { xs: '13px', sm: '14px' },
                                color: '#20403c',
                            }}
                        >
                            {msg.file ? (
                                <a
                                    href={msg.file}
                                    download={msg.text.split(': ')[1]}
                                    style={{ color: '#0a3e38', textDecoration: 'underline' }}
                                >
                                    {msg.text}
                                </a>
                            ) : (
                                msg.text
                            )}
                            {/* <Typography variant="caption" sx={{ display: 'block', textAlign: 'left', mt: 0.5, opacity: 0.7 }}>
                                {formatTimestamp(msg.timestamp)}
                            </Typography> */}
                        </Box>
                    </motion.div>
                ))}

                {typing && (
                    <Box display="flex" justifyContent="flex-end">
                        <Box
                            sx={{
                                maxWidth: { xs: '75%', sm: '70%' },
                                px: 2,
                                py: 1.5,
                                borderRadius: '20px',
                                background: '#f5f9f9',
                                fontSize: { xs: '13px', sm: '14px' },
                                color: '#20403c',
                            }}
                        >
                            {botTypingText ? (
                                <Typography component="span">{botTypingText}</Typography>
                            ) : (
                                <Icon icon="svg-spinners:3-dots-fade" width="24" height="24" />
                            )}
                        </Box>
                    </Box>
                )}
                <div ref={chatEndRef} />
            </Box>

            <Box
                sx={{
                    p: .5,
                    borderTop: '1px solid #e3eded',
                    bgcolor: '#fff',
                }}
            >
                {!hasUserMessage && conversationStarters.filter(starter => starter.enabled && starter.text.trim()).length > 0 && (
                    <Box
                        sx={{
                            width: '100%',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f5f9f9',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#577e7d',
                                borderRadius: '4px',
                                '&:hover': {
                                    background: '#accbbd',
                                },
                            },
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#577e7d #f5f9f9',
                            backgroundColor: 'white',
                            borderRadius: 2,
                            direction: 'rtl',
                        }}
                    >
                        <List sx={{ p: 0, m: 0 }}>
                            {conversationStarters.filter(starter => starter.enabled && starter.text.trim()).map((starter) => (
                                <ListItem
                                    key={starter.id}
                                    onClick={() => handleStarterClick(starter.text)}
                                    sx={{
                                        px: 1,
                                        cursor: 'pointer',
                                        backgroundColor: '#f5f9f9',
                                        borderRadius: '8px',
                                        my: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <Icon icon="solar:chat-line-bold" color={'#20403c'} width="20" height="20" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ color: 'black', fontSize: 14, textAlign: 'right' }}>
                                                    {starter.text}
                                                </Typography>
                                            }
                                        />
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
                <Box
                    component="form"
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    <TextField
                        size="small"
                        variant="outlined"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="پیام خود را وارد کنید"
                        sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                '& fieldset': { borderColor: '#e3eded' },
                                '&:hover fieldset': { borderColor: '#accbbd' },
                                '&.Mui-focused fieldset': { borderColor: 'rgb(0, 210, 133)' },
                            },
                            '& .MuiInputBase-input': {
                                color: '#20403c',
                                fontSize: { xs: '14px', sm: '15px' },
                                padding: '8px',
                            },
                        }}
                    />
                    {input && (
                        <IconButton type="submit" sx={{ p: 0.5 }}>
                            <Icon
                                icon="solar:map-arrow-left-bold"
                                width="24"
                                height="24"
                                style={{ color: 'rgb(0, 210, 133)' }}
                            />
                        </IconButton>
                    )}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Box display="flex" gap={0.5}>
                        <IconButton onClick={handleEmojiButtonClick} sx={{ p: 0.5 }}>
                            <Icon icon="solar:smile-circle-linear" width="20" height="20" style={{ color: '#577e7d' }} />
                        </IconButton>
                        <IconButton onClick={() => fileInputRef.current.click()} sx={{ p: 0.5 }}>
                            <Icon icon="solar:paperclip-linear" width="20" height="20" style={{ color: '#577e7d' }} />
                        </IconButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </Box>
                    <Typography sx={{ color: '#577e7d', fontSize: { xs: 11, sm: 12 } }}>
                        قدرت گرفته از پشتیبات
                    </Typography>
                </Box>
            </Box>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: { maxWidth: { xs: '85vw', sm: 320 } },
                }}
            >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Popover>
        </Box>
    )
}