'use client'

import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { Box, Typography, TextField, IconButton, Popover, List, ListItem, ListItemText, ListItemIcon, Menu, MenuItem } from "@mui/material"
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import EmojiPicker from "emoji-picker-react"
import { useChat } from "@/hooks/useChat"

import { v4 as uuidv4 } from 'uuid'

export default function ChatWidget() {
    const [messages, setMessages] = useState([{ from: "bot", text: "سلام، چطور می تونم کمک تون کنم؟" }])
    const [input, setInput] = useState("")
    const [config, setConfig] = useState({})
    const [notifications, setNotifications] = useState(true)
    const [anchorElChat, setAnchorElChat] = useState(null)
    const [conversationId, setConversationId] = useState(null)
    const [userId, setUserId] = useState(null)
    const [typing, setTyping] = useState(false)
    const [botTypingText, setBotTypingText] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)

    const id = anchorEl ? 'emoji-popover' : undefined
    const open = Boolean(anchorEl)
    const chatEndRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const conversationData = JSON.parse(localStorage.getItem("poshtibot-conversation-data"))
        setConversationId(conversationData.poshtibot_conversation_id)
        setUserId(conversationData.poshtibot_user_id)

        const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config"))
        setConfig(pwc)

        const messages = JSON.parse(localStorage.getItem("poshtibot-messages"))
        if (messages) setMessages(messages)

    }, [])

    useEffect(() => {
        chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, typing])

    const { sendUser, joinGroup } = useChat({ userId })

    const conversationStarters = [
        { id: '1', text: 'در مورد محصولات سوال دارم', enabled: true },
        { id: '2', text: 'وضعیت سفارش من', enabled: true },
    ]

    const hasUserMessage = messages.some(msg => msg.from === 'user')

    const handleStarterClick = (starterText) => {
        setInput(starterText)
        sendMessage()
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

    const sendMessage = async () => {
        if (!input.trim()) return

        // Add user message immediately
        const newMessages = [...messages, { from: "user", text: input }]
        setMessages(newMessages)
        setInput("")

        joinGroup(conversationId)
        sendUser(config.user_flows_data, conversationId, input)

        localStorage.setItem("poshtibot-messages", JSON.stringify(newMessages))

        // Send message to Frappe API
        // try {
        //     const res = await fetch("https://server.poshtibot.com/api/method/poshtibot.api.send_msg", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ message: input })
        //     })
        //     const data = await res.json()
        //     const botReply = data.message || "Sorry, I didn’t understand that."
        //     setMessages([...newMessages, { from: "bot", text: botReply }])
        // } catch (err) {
        //     console.error(err)
        //     const botReply = "Sorry, I didn’t understand that."
        //     setMessages([...newMessages, { from: "bot", text: botReply }])
        // }
    }

    const handleCloseChat = () => {
        // send a message to the parent window (WidgetRoot)
        window.parent.postMessage({ type: "CLOSE_CHAT_WIDGET" }, "*")
    }


    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Header */}
            <Box
                sx={{
                    background: 'rgb(0, 210, 133)',
                    color: '#fff',
                    pt: 3,
                    pb: 2,
                    px: 2,
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                        <IconButton sx={{
                            bgcolor: 'white', ml: 1, width: 45, height: 45, '&:hover': {
                                background: '#f5f9f9',
                            },
                        }}>
                            <Image src='/images/poshtibotlogo.png' width={23.5} height={24.8} alt="poshtibotlogo" />
                        </IconButton>
                        {/* <Box display="flex" mt={.5}>
                            <Typography mt={.25} sx={{ fontSize: 17 }}>
                                گفتگو با
                            </Typography>
                            <Typography px={.5} fontSize={19}>ستایش سعادتی</Typography>
                        </Box> */}
                    </Box>
                    <Box>
                        <IconButton
                            onClick={handleToggleNotifications}
                            sx={{ color: '#fff', border: '1px solid #e3eded' }}
                        >
                            {notifications ?
                                <Icon icon="heroicons:bell-alert" width="24" height="24" />
                                :
                                <Icon icon="heroicons:bell-slash" width="24" height="24" />}
                        </IconButton>

                        <IconButton
                            onClick={handleCloseChat}
                            sx={{ color: '#fff', border: '1px solid #e3eded', mx: 1 }}
                        >
                            {<Icon icon="icon-park-outline:down" width="24" height="24" />}
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    flexGrow: 1,
                    p: 1.5,
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
                                pt: 1,
                                pb: 1,
                                // borderRadius: msg.from === 'user' ? '35px 35px 0 35px ' : '35px 35px 35px 0',
                                borderRadius: 2,
                                background: msg.from === 'user' ? '#a3f5c4' : '#f5f9f9',
                                fontSize: { xs: '14px', sm: '15px' },
                                color: 'black',
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
                    px: 1,
                    py: 1,
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

                        <List sx={{ p: 0, ml: .5 }}>
                            {conversationStarters.filter(starter => starter.enabled && starter.text.trim()).map((starter) => (
                                <ListItem
                                    key={starter.id}
                                    onClick={() => handleStarterClick(starter.text)}
                                    sx={{
                                        px: 1,
                                        py: .5,
                                        cursor: 'pointer',
                                        backgroundColor: '#f5f9f9',
                                        borderRadius: '8px',
                                        my: .5,
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
                    <IconButton onClick={handleEmojiButtonClick} sx={{
                        p: 1, border: '1px solid #e3eded', '&:hover': {
                            borderColor: 'rgb(0, 210, 133)'
                        },
                    }}>
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
                                fontSize: { xs: '14px', sm: '15px' },
                                padding: '8px',
                                px: 3
                            },
                        }}
                    />
                    {!input ? (
                        <IconButton onClick={() => fileInputRef.current.click()} sx={{
                            p: 1.25, border: '1px solid #e3eded', '&:hover': {
                                borderColor: 'rgb(0, 210, 133)'
                            },
                        }}>
                            <Icon icon="solar:paperclip-linear" width="20" height="20" style={{ color: '#577e7d' }} />
                        </IconButton>
                    ) : (
                        <IconButton type="submit" sx={{ p: 0.5 }}>
                            <Icon icon="fa6-brands:telegram" fontSize={32} style={{ color: 'rgb(0, 210, 133)' }} />
                        </IconButton>
                    )}
                </Box>

                <Box display="flex" justifyContent="center" alignItems="center" mt={0.5}>
                    <Box display="flex" gap={0.5}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </Box>
                    <Typography sx={{ color: '#577e7d', fontSize: { xs: 11, sm: 12 }, pt: 1 }}>
                        قدرت گرفته از پشتیبات 💚
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