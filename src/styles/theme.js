'use client'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
    colorSchemes: {
        light: {
            palette: {
                // The best part is that you can refer to the variables wherever you like 🤩
                gradient:
                    'linear-gradient(to left, var(--mui-palette-primary-main), var(--mui-palette-primary-dark))',
                border: {
                    subtle: 'var(--mui-palette-neutral-200)',
                },
            },
        },
        dark: {
            palette: {
                gradient:
                    'linear-gradient(to left, var(--mui-palette-primary-light), var(--mui-palette-primary-main))',
                border: {
                    subtle: 'var(--mui-palette-neutral-600)',
                },
            },
        },
    },
});

export default theme
