'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Box, IconButton, Typography } from '@mui/material'
import { Icon } from '@iconify/react'

const ChatHeader = ({ notifications, onToggleNotifications, onCloseChat, agentStatus }) => {
    return (
        <Box
            sx={{
                background: '#00d285',
                color: '#fff',
                pt: 3,
                pb: 2,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <Box display={'flex'} alignItems={'center'}>
                {
                    (agentStatus === "none") ? (
                        <IconButton sx={{ bgcolor: 'white', ml: 1, width: 45, height: 45, '&:hover': { background: '#f5f9f9' } }}>
                            <Image src='/images/poshtibot-logo.png' width={23.5} height={24.8} alt="poshtibot" />
                        </IconButton>
                    ) : (agentStatus === "joined") ? (
                        <IconButton sx={{ bgcolor: 'white', ml: 1, width: 45, height: 45, '&:hover': { background: '#f5f9f9' } }}>
                            <Image src='/images/user-profile.png' width={45} height={45} alt="poshtibot" style={{borderRadius: 50}} />
                        </IconButton>
                    ) : ""
                }

                {
                    (agentStatus === "none") ? (
                        <Typography>
                            در حال مکالمه با پشتیبات
                        </Typography>

                    ) : (agentStatus === "pending") ? (
                        <Typography>
                            در انتظار پشتیبان
                        </Typography>

                    ) : (agentStatus === "joined") ? (
                        <Typography>
                            در حال مکالمه با پشتیبان
                        </Typography>
                    ) : ""
                }
            </Box>

            <Box>
                <IconButton onClick={onToggleNotifications} sx={{ color: '#fff', border: '1px solid #e3eded' }}>
                    <Icon icon={notifications ? "heroicons:bell-alert" : "heroicons:bell-slash"} width="24" height="24" />
                </IconButton>
                <IconButton onClick={onCloseChat} sx={{ color: '#fff', border: '1px solid #e3eded', mx: 1 }}>
                    <Icon icon="icon-park-outline:down" width="24" height="24" />
                </IconButton>
            </Box>
        </Box>
    )
}

export default memo(ChatHeader)