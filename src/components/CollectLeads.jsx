
'use client'

import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

const CollectLeads = () => {
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
            hi
        </Box>
    )
}

export default CollectLeads