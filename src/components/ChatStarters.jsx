'use client'

import { memo } from 'react'
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import chatLineBold from '@iconify-icons/solar/chat-line-bold'

function isEnabledStarter(starter) {
  if (!starter?.message?.trim()) return false
  const flag = starter.enabled ?? starter.enable
  if (flag === undefined || flag === null) return true
  return flag === true || flag === 1 || flag === '1'
}

const ChatStarters = ({ starters, onStarterClick }) => {
  const enabledStarters = (starters || []).filter(isEnabledStarter)

  if (enabledStarters.length === 0) {
    return null
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
            key={starter.message_id || index}
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
              <Icon icon={chatLineBold} color="#20403c" width="20" height="20" />
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

export default memo(ChatStarters)
