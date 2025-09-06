import { Dialog, Typography, Stack, IconButton, Chip, OutlinedInput, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const AddTaskModal = ({ open = false, onClose }) => {
  const [task, setTask] = useState('');

  const handleClose = () => {
    setTask('');
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Stack p={2} spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700} variant="h6">Add Task</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>Status:</Typography>
          <Chip label="Todos" color="primary" />
        </Stack>
        
        <OutlinedInput
          placeholder="Enter task description"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            // Handle task addition here
            handleClose();
          }}
          disabled={!task.trim()}
          sx={{ mt: 2 }}
        >
          Add Task
        </Button>
      </Stack>
    </Dialog>
  );
};

export default AddTaskModal;