'use client'

import Image from "next/image"
import { useEffect, useState, useRef, useCallback } from "react"
import { Box, Typography, TextField, IconButton, Popover, List, ListItem, ListItemText, ListItemIcon } from "@mui/material"
import { Icon } from '@iconify/react'
import { AnimatePresence, motion } from 'framer-motion'
import EmojiPicker from "emoji-picker-react"
import { useChat } from "@/hooks/useChat"
import { usePoshtibotSetup } from "./usePoshtibotSetup"

export default function ChatWidget() {
    // const DEFAULT_BOT_MESSAGE = { sender: "poshtibot", message: "سلام، چطور می تونم کمک‌تون کنم؟" }

    // const [allMessages, setAllMessages] = useState([DEFAULT_BOT_MESSAGE])
    const [input, setInput] = useState("")
    // const [config, setConfig] = useState({})
    const [notifications, setNotifications] = useState(true)
    const [anchorEl, setAnchorEl] = useState(null)
    // const [conversationId, setConversationId] = useState(null)
    // const [userId, setUserId] = useState(null)
    const [typing, setTyping] = useState(false)
    const [botTypingText, setBotTypingText] = useState('')
    const [showSupportBtn, setShowSupportBtn] = useState(true)

    const chatEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const { config, conversationId, userId, allMessages, setAllMessages } = usePoshtibotSetup()

    const { joinGroup, sendUser, messages } = useChat({ userId })



    // Load config and restore saved chat once
    // useEffect(() => {
    //     try {
    //         const conversationData = JSON.parse(localStorage.getItem("poshtibot-conversation-data") || "{}")
    //         setConversationId(conversationData.poshtibot_conversation_id)
    //         setUserId(conversationData.poshtibot_user_id)

    //         const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config"))
    //         setConfig(pwc)

    //         const savedMessages = JSON.parse(localStorage.getItem("poshtibot-messages") || "[]")
    //         setAllMessages(savedMessages.length > 0 ? savedMessages : [DEFAULT_BOT_MESSAGE])
    //     } catch (err) {
    //         console.error("Error loading chat data:", err)
    //         setAllMessages([DEFAULT_BOT_MESSAGE])
    //     }
    // }, [])

    // console.log(config)

    // Sync new messages coming from socket/chat
    useEffect(() => {
        if (!messages?.length) return

        setAllMessages(prev => {
            const seen = new Set(prev.map(m => JSON.stringify(m)))
            const newOnes = messages.filter(m => !seen.has(JSON.stringify(m)))
            const merged = [...prev, ...newOnes]
            localStorage.setItem("poshtibot-messages", JSON.stringify(merged))
            return merged
        })

        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [allMessages])

    // Send user message
    const sendMessage = useCallback(() => {
        const trimmed = input.trim()
        if (!trimmed) return

        const newMsg = { sender: "user", message: trimmed }
        setAllMessages(prev => {
            const updated = [...prev, newMsg]
            localStorage.setItem("poshtibot-messages", JSON.stringify(updated))
            return updated
        })

        setInput("")
        joinGroup(conversationId)
        sendUser(config.user_flows_data, conversationId, trimmed)
    }, [input, conversationId, config, joinGroup, sendUser])

    // const handleFileUpload = (e) => {
    //     const file = e.target.files?.[0]
    //     if (!file) return
    //     const url = URL.createObjectURL(file)
    //     setAllMessages(prev => [...prev, { sender: 'user', message: `file: ${file.name}`, file: url, timestamp: Date.now() }])
    // }

    // Emoji handling
    const handleEmojiClick = (emoji) => {
        const ch = emoji?.native || emoji?.emoji || (typeof emoji === 'string' ? emoji : '')
        setInput(prev => prev + ch)
        setAnchorEl(null)
    }

    const conversationStarters = [
        { id: '1', message: 'در مورد محصولات سوال دارم', enabled: true },
        { id: '2', message: 'وضعیت سفارش من', enabled: true },
        { id: '3', message: 'وضعیت سفارش من', enabled: true },
        { id: '4', message: 'وضعیت سفارش من', enabled: true },
        { id: '5', message: 'وضعیت سفارش من', enabled: true },
    ]
    const hasUserMessage = allMessages.some(msg => msg.sender === 'user')

    // Starter click shortcut
    const handleStarterClick = (starterText) => {
        setInput(starterText)
        sendMessage()
    }

    // Notification toggle
    const toggleNotifications = () => setNotifications(prev => !prev)

    // Close widget
    const handleCloseChat = () => {
        window.parent.postMessage({ type: "CLOSE_CHAT_WIDGET" }, "*")
    }


    if (!config) {
        return (
            <div style={{ textAlign: "center", marginTop: 50 }}>
                <span>در حال بارگذاری...</span>
            </div>
        )
    }


    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Header */}
            <Box sx={{
                background: 'rgb(0, 210, 133)',
                color: '#fff',
                pt: 3,
                pb: 2,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <IconButton sx={{ bgcolor: 'white', ml: 1, width: 45, height: 45, '&:hover': { background: '#f5f9f9' } }}>
                    <Image src='/images/poshtibotlogo.png' width={23.5} height={24.8} alt="poshtibotlogo" />
                </IconButton>

                <Box>
                    <IconButton onClick={toggleNotifications} sx={{ color: '#fff', border: '1px solid #e3eded' }}>
                        <Icon icon={notifications ? "heroicons:bell-alert" : "heroicons:bell-slash"} width="24" height="24" />
                    </IconButton>

                    <IconButton onClick={handleCloseChat} sx={{ color: '#fff', border: '1px solid #e3eded', mx: 1 }}>
                        <Icon icon="icon-park-outline:down" width="24" height="24" />
                    </IconButton>
                </Box>
            </Box>

            {/* Messages */}
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
                {allMessages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-start' : 'flex-end' }}
                    >
                        <Box sx={{
                            maxWidth: '75%',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            background: msg.sender === 'user' ? '#a3f5c4' : '#f5f9f9',
                            fontSize: 15,
                            color: 'black'
                        }}>
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
                ))}

                {/* {!typing && (
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
                )} */}

                <div ref={chatEndRef} />
            </Box>

            {/* Support button */}
            <AnimatePresence>
                {allMessages.length % 9 === 0 && showSupportBtn && (
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

            {/* Input area */}
            <Box sx={{ px: 1, py: 1, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
                {!hasUserMessage && allMessages.length < 9 && conversationStarters.filter(starter => starter.enabled && starter.message.trim()).length > 0 && (
                    <Box
                        sx={{
                            width: '100%',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            borderRadius: 2,
                            direction: 'rtl',
                            backgroundColor: 'white',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#577e7d #f5f9f9',
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-track': { background: '#f5f9f9' },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#577e7d',
                                borderRadius: '4px',
                                '&:hover': { background: '#accbbd' },
                            },
                        }}
                    >
                        <List sx={{ p: 0, ml: .5 }}>
                            {conversationStarters.filter(s => s.enabled && s.message.trim()).map(starter => (
                                <ListItem
                                    key={starter.id}
                                    onClick={() => handleStarterClick(starter.message)}
                                    sx={{
                                        px: 1,
                                        py: .5,
                                        cursor: 'pointer',
                                        backgroundColor: '#f5f9f9',
                                        borderRadius: '8px',
                                        my: .5,
                                        textAlign: 'right'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Icon icon="solar:chat-line-bold" color="#20403c" width="20" height="20" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography sx={{ color: 'black', fontSize: 14 }}>{starter.message}</Typography>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Box
                    component="form"
                    onSubmit={(e) => { e.preventDefault(); sendMessage() }}
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
                        size="small"
                        variant="outlined"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="پیام خود را وارد کنید"
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
                                px: 3
                            },
                        }}
                    />

                    <IconButton type="submit" sx={{ p: 0.5 }} disabled={!input.trim()}>
                        <Icon icon="fa6-brands:telegram" fontSize={32} style={{ color: input ? "rgb(0, 210, 133)" : "" }} />
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
            </Box>

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
