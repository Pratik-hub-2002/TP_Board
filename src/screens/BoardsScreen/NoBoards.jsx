import { Stack, Typography } from '@mui/material';  

const NoBoards = () => {
    return (
        <Stack mt={15} textAlign="center" spacing={1}>
          <Typography variant="h5">No Boards Created</Typography>
          <Typography>Create Your First Board Today!</Typography>
        </Stack>
    );
}

export default NoBoards