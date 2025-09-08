import { Stack, Typography, Button } from '@mui/material';  
import PostAddIcon from '@mui/icons-material/PostAdd';

const NoBoards = ({ onCreateBoard }) => {
    return (
        <Stack mt={15} textAlign="center" spacing={3} alignItems="center">
            <Typography variant="h5" color="text.secondary">No Boards Found</Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
                Get started by creating your first board
            </Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<PostAddIcon />}
                onClick={onCreateBoard}
                sx={{ width: 'fit-content' }}
            >
                Create Board
            </Button>
        </Stack>
    );
}

export default NoBoards;