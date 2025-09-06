import { Dialog, Typography, Stack, IconButton, Chip, OutlinedInput, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const AddTaskModal = ({ addTaskTo, open, onClose, onSave }) => {
  const [task, setTask] = useState('');

  const handleClose = () => {
    setTask('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onSave(task);
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <Stack p={2} spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography fontWeight={700} variant="h6">Add Task</Typography>
            <IconButton onClick={handleClose} type="button">
              <CloseIcon />
            </IconButton>
          </Stack>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Status:</Typography>
            <Chip label={addTaskTo} color="primary" />
          </Stack>
          
          <OutlinedInput
            placeholder="Enter task description"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
            autoFocus
          />
          
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={!task.trim()}
            sx={{ mt: 2 }}
          >
            Add Task
          </Button>
        </Stack>
      </form>
    </Dialog>
  );
};

export default AddTaskModal;