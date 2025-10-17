'use client'

import { memo } from 'react'
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Icon } from '@iconify/react'

const ConversationStarters = ({ starters, onStarterClick }) => {
    // Filter enabled starters once
    const enabledStarters = starters.filter(s => s.enabled && s.message.trim())

    if (enabledStarters.length === 0) {
        return null // Don't render anything if there are no valid starters
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxHeight: '150px',
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 1,
                direction: 'rtl',
                scrollbarWidth: 'thin',
                scrollbarColor: '#577e7d #f5f9f9',
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: '#f5f9f9' },
                '&::-webkit-scrollbar-thumb': {
                    background: '#577e7d',
                    borderRadius: '4px',
                    '&:hover': { background: '#accbbd' }
                }
            }}
        >
            <List sx={{ p: 0, ml: .5 }}>
                {enabledStarters.map((starter, index) => (
                    <ListItem
                        key={index}
                        onClick={() => onStarterClick(starter.message)}
                        sx={{
                            px: 1,
                            py: .5,
                            my: .5,
                            backgroundColor: '#f5f9f9',
                            borderRadius: '8px',
                            textAlign: 'right',
                            cursor: 'pointer'
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
    )
}

export default memo(ConversationStarters)