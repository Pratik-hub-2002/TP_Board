import { Grid, Stack, Typography, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/AddCircle'

const BoardInterface = () => {
  return (
    <>
    <AddTaskModal />
      <Grid container spacing={5}>
        <Grid item xs={12} md={6} lg={4}>
          <Stack spacing={2} bgcolor="#000" p={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={400} variant="h6">Add List</Typography>
              <IconButton size="small">
                <AddIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}

export default BoardInterface;