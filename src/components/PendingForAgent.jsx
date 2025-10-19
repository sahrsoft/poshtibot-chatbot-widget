import { Icon } from "@iconify/react"
import { Box, Typography } from "@mui/material"

const PendingForAgent = () => {
  return (
    <Box p={2}>
      <Typography textAlign={'center'}>
        درخواست شما ارسال شد، لطفا تا پیوستن اولین پشتیبان صبر کنید
        <Icon icon="svg-spinners:3-dots-fade" width="24" height="24" style={{ marginBottom: -10, marginRight: 5, transform: 'rotate(180deg)' }} />
      </Typography>
    </Box>
  )
}

export default PendingForAgent