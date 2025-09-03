import { Dialog, Typography, Stack, IconButton, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const AddTaskModal = () => {
  return (
    <Dialog open>
        <Stack p={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700} variant="h6">Add Task</Typography>
            <IconButton>
                <CloseIcon />
            </IconButton>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Status:</Typography>
            <Chip label="Todos" />
        </Stack>
        <OutlinedInput />
        <Button variant="contained">Add Task</Button>
        </Stack>
    </Dialog>
  )
}

export default AddTaskModal