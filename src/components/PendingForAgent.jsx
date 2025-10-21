import { Icon } from "@iconify/react"
import { Box, Button, Typography } from "@mui/material"

const PendingForAgent = ({ handleCancelRequest }) => {
  return (
    <Box p={2}>
      <Typography textAlign={'center'}>
        درخواست شما ارسال شد، لطفا تا پیوستن اولین پشتیبان صبر کنید
        <Icon
          icon="svg-spinners:3-dots-fade"
          width="24"
          height="24"
          style={{ marginBottom: -10, marginRight: 5, transform: 'rotate(180deg)' }}
        />
      </Typography>
      <Button
        onClick={handleCancelRequest}
        fullWidth
        size="small"
        variant="outlined"
        sx={{ mt: 2, borderColor: '#005435', color: '#005435', '&:hover': { bgcolor: '#ffebeb' } }}
      >
        لغو درخواست
      </Button>
    </Box>
  )
}

export default PendingForAgent