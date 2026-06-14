'use client'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'Vazir'
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#00d285'
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1
          }
        }
      }
    }
  }
})

export default theme
