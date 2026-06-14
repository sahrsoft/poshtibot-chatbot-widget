'use client'

import { useState, useCallback } from 'react'
import { Box, Button, Paper, Typography, TextField } from '@mui/material'
import { api } from '@/lib/api'
import { storage, Keys } from '@/lib/constants'

function validateField(name, value) {
  if (!value.trim()) return 'این فیلد اجباری است'
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'آدرس ایمیل نامعتبر است'
  if (name === 'mobile' && !/^09\d{9}$/.test(value)) return 'شماره همراه نامعتبر است'
  return ''
}

const CollectLeads = ({ config, chatbotId }) => {
  const [formData, setFormData] = useState(() => {
    const chatData = chatbotId ? storage.getJSON(Keys.chatData(chatbotId)) : null
    return {
      chat_id: chatData?.poshtibot_chat_id ?? '',
      name: '',
      email: '',
      mobile: ''
    }
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }, [])

  const validate = useCallback(() => {
    const newErrors = {}
    if (config.leads_from_name && !formData.name.trim()) newErrors.name = 'لطفا نام و نام خانوادگی خود را وارد کنید'
    if (config.leads_from_email) {
      const emailErr = validateField('email', formData.email)
      if (emailErr) newErrors.email = emailErr
    }
    if (config.leads_from_mobile) {
      const mobileErr = validateField('mobile', formData.mobile)
      if (mobileErr) newErrors.mobile = mobileErr
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [config, formData])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validate()) return
      setSubmitting(true)
      try {
        await api.post('/collect_leads', formData)
        if (chatbotId) {
          const chatData = storage.getJSON(Keys.chatData(chatbotId)) ?? {}
          storage.setJSON(Keys.chatData(chatbotId), { ...chatData, leads_collected: true })
        }
        window.location.reload()
      } catch {
        // Error handled silently
      } finally {
        setSubmitting(false)
      }
    },
    [chatbotId, formData, validate]
  )

  const fieldSx = {
    mb: 3,
    '& .MuiInputLabel-root': {
      right: 0,
      left: 'auto',
      transformOrigin: 'top right',
      textAlign: 'right',
      fontSize: 14
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, -1.5px) scale(0.75)'
    },
    '& .MuiInputBase-input': {
      color: '#20403c',
      textAlign: 'right',
      fontSize: 14
    }
  }

  return (
    <Box
      component='form'
      onSubmit={handleSubmit}
      noValidate
      sx={{
        flexGrow: 1,
        p: 1.5,
        my: 5,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 7
      }}
    >
      <Paper sx={{ width: '70%', borderRadius: 7, textAlign: 'center', p: 2 }}>
        <Typography fontSize={14} mb={2}>
          لطفا جهت پاسخگویی بهتر فرم زیر را تکمیل کنید.
        </Typography>

        {config.leads_from_name === 1 && (
          <TextField
            name='name'
            variant='standard'
            size='small'
            fullWidth
            label='نام و نام خانوادگی'
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={fieldSx}
          />
        )}

        {config.leads_from_email === 1 && (
          <TextField
            name='email'
            variant='standard'
            size='small'
            fullWidth
            label='آدرس ایمیل'
            type='email'
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={fieldSx}
          />
        )}

        {config.leads_from_mobile === 1 && (
          <TextField
            name='mobile'
            variant='standard'
            size='small'
            fullWidth
            label='شماره موبایل'
            type='tel'
            value={formData.mobile}
            onChange={handleChange}
            error={!!errors.mobile}
            helperText={errors.mobile}
            sx={fieldSx}
          />
        )}

        <Button
          type='submit'
          variant='contained'
          disabled={submitting}
          sx={{ borderRadius: 4, px: 3, py: 0.5, bgcolor: '#00d285' }}
        >
          شروع
        </Button>
      </Paper>
    </Box>
  )
}

export default CollectLeads
