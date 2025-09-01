import { AppBar, Toolbar,Stack, Typography, IconButton } from '@mui/material'
import BackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'

const BoardTopbar = () => {
  return (
    <AppBar sx={{ borderBottom: "5px solid", borderColor: "white" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
            <Stack spacing={1} alignItems="center" direction="row">
                <IconButton>
                    <BackIcon />
                </IconButton>
                <Typography variant="h6">Board Name</Typography>
            </Stack>
            <Stack spacing={2} alignItems="center" direction="row">
                <Typography variant="body2">Board Name</Typography>
                <IconButton>
                    <DeleteIcon />
                </IconButton>
            </Stack>
        </Toolbar>
    </AppBar>
  )
}

export default BoardTopbar