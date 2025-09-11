import { Dialog, Typography, Stack, IconButton, Chip, OutlinedInput, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const AddTaskModal = ({ addTaskTo, open, onClose, onSave }) => {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleClose = () => {
    setTask('');
    setDeadline('');
    setPriority('medium');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      const taskData = {
        text: task.trim(),
        deadline: deadline || null,
        priority: priority
      };
      onSave(taskData);
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
          
          <TextField
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional: Set a deadline for this task"
          />
          
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          
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