import { AppBar, Toolbar, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import BackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import useStore from '../../store';

const BoardTopbar = ({ board }) => {
  const navigate = useNavigate();
  const setToastrMsg = useStore(state => state.setToastrMsg);

  const handleBack = () => {
    navigate('/boards');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the board "${board?.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'boards', board.id));
        setToastrMsg('Board deleted successfully');
        navigate('/boards');
      } catch (error) {
        console.error('Error deleting board:', error);
        setToastrMsg('Failed to delete board');
      }
    }
  };

  return (
    <AppBar position="fixed" sx={{ borderBottom: "5px solid", borderColor: "white" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack spacing={1} alignItems="center" direction="row">
          <Tooltip title="Back to Boards">
            <IconButton onClick={handleBack} color="inherit">
              <BackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" noWrap>
            {board?.name || 'Loading...'}
          </Typography>
        </Stack>
        
        {board && (
          <Stack spacing={2} alignItems="center" direction="row">
            <Tooltip title="Delete Board">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default BoardTopbar;