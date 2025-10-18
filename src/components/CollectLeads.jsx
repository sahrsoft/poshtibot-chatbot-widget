
"use client"

import { useEffect, useState } from "react"
import { Box, Button, Paper, Typography } from "@mui/material"
import { TextField } from "@mui/material"
import { LOCAL_STORAGE_CONVERSATION_KEY } from "@/lib/constants"

const CollectLeads = ({ config }) => {

    useEffect(() => {
        const cachedConfig = localStorage.getItem(LOCAL_STORAGE_CONVERSATION_KEY)
        if (cachedConfig) {
            const parsed = JSON.parse(cachedConfig)
            setFormData(f => ({ ...f, conversation_id: parsed.poshtibot_conversation_id || "" }))
        }
    }, [])

    const [formData, setFormData] = useState(() => {
        if (typeof window === "undefined") return { conversation_id: "", name: "", email: "", mobile: "" }

        try {
            const cachedConfig = localStorage.getItem(LOCAL_STORAGE_CONVERSATION_KEY)
            const conversation_id = cachedConfig ? JSON.parse(cachedConfig).poshtibot_conversation_id : ""
            return { conversation_id, name: "", email: "", mobile: "" }
        } catch {
            return { conversation_id: "", name: "", email: "", mobile: "" }
        }
    })


    const [errors, setErrors] = useState({
        name: '',
        email: '',
        mobile: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })

        // Clear error when user starts typing again
        setErrors({ ...errors, [name]: '' })
    }

    const validate = () => {
        const newErrors = { name: '', email: '', mobile: '' }
        let valid = true

        if (!formData.name.trim()) {
            newErrors.name = "لطفا نام و نام خانوادگی خود را وارد کنید"
            valid = false
        }

        if (!formData.email.trim()) {
            newErrors.email = "آدرس ایمیل خود را وارد کنید"
            valid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "آدرس ایمیل نامعتبر است"
            valid = false
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = "شماره همراه خود را وارد کنید"
            valid = false
        } else if (!/^09\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = "شماره همراه نامعتبر است"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collect_leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                const conversationData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONVERSATION_KEY))
                const update = {
                    ...conversationData,
                    leads_collected: true
                }
                localStorage.setItem(LOCAL_STORAGE_CONVERSATION_KEY, JSON.stringify(update))
                window.location.reload()
            })
            .catch(err => console.log(err))

        console.log('✅ Form submitted:', formData)
    }

    const disabledButton = (config.leads_from_name === 1 && !formData.name) || (config.leads_from_email === 1 && !formData.email) || (config.leads_from_mobile === 1 && !formData.mobile)


    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
                flexGrow: 1,
                p: 1.5,
                my: 5,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 7
            }}
        >
            <Paper sx={{ width: "70%", borderRadius: 7, textAlign: "center", p: 2 }}>
                <Typography fontSize={14} mb={2}>
                    لطفا جهت پاسخگویی بهتر فرم زیر را تکمیل کنید.
                </Typography>

                {config.leads_from_name === 1 &&
                    <TextField
                        name="name"
                        className="light-bg-input-autofill"
                        variant="standard"
                        size="small"
                        fullWidth
                        label="نام و نام خانوادگی"
                        type="text"
                        color="warning"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        sx={{
                            mb: 3,
                            "& .MuiInputLabel-root": {
                                right: 0,
                                left: "auto",
                                transformOrigin: "top right",
                                textAlign: "right",
                                fontSize: 14
                            },
                            "& .MuiInputLabel-shrink": {
                                transform: "translate(0, -1.5px) scale(0.75)"
                            },
                            "& .MuiInputBase-input": {
                                color: "#20403c",
                                textAlign: "right",
                                fontSize: 14
                                // "::placeholder": {
                                //     color: "gray",
                                //     opacity: 1,
                                //     textAlign: "right"
                                // }
                            }
                        }}
                    />
                }

                {config.leads_from_email === 1 &&
                    <TextField
                        name="email"
                        className="light-bg-input-autofill"
                        variant="standard"
                        size="small"
                        fullWidth
                        label="آدرس ایمیل"
                        type="email"
                        color="warning"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{
                            mb: 3,
                            "& .MuiInputLabel-root": {
                                right: 0,
                                left: "auto",
                                transformOrigin: "top right",
                                textAlign: "right",
                                fontSize: 14
                            },
                            "& .MuiInputLabel-shrink": {
                                transform: "translate(0, -1.5px) scale(0.75)"
                            },
                            "& .MuiInputBase-input": {
                                color: "#20403c",
                                textAlign: "left",
                                fontSize: 14
                            }
                        }}
                    />
                }

                {config.leads_from_mobile === 1 &&
                    <TextField
                        name="mobile"
                        className="light-bg-input-autofill"
                        variant="standard"
                        size="small"
                        fullWidth
                        label="شماره موبایل"
                        type="tel"
                        // helperText="شماره همراه نامعتبر است"
                        color="warning"
                        value={formData.mobile}
                        onChange={handleChange}
                        error={!!errors.mobile}
                        helperText={errors.mobile}
                        sx={{
                            mb: 3,
                            "& .MuiInputLabel-root": {
                                right: 0,
                                left: "auto",
                                transformOrigin: "top right",
                                textAlign: "right",
                                fontSize: 14
                            },
                            "& .MuiInputLabel-shrink": {
                                transform: "translate(0, -1.5px) scale(0.75)"
                            },
                            "& .MuiInputBase-input": {
                                color: "#20403c",
                                textAlign: "left",
                                fontSize: 14
                            }
                        }}
                    />
                }

                <Button
                    type="submit"
                    variant="contained"
                    disabled={disabledButton}
                    sx={{ borderRadius: 4, px: 3, py: .5, bgcolor: "#00d285" }}>
                    شروع
                </Button>
            </Paper>
        </Box>
    )
}

export default CollectLeads