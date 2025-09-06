import { Grid, Stack, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircle';
import AddTaskModal from './AddTaskModal';
import BoardTab from './BoardTab';
import { useState } from 'react';

const BoardInterface = () => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const handleOpenAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleCloseAddTask = () => {
    setIsAddTaskModalOpen(false);
  };

const tabs = {
  todos: { name: "Todos", color: "primary" },
  inProgress: { name: "In Progress", color: "secondary" },
  done: { name: "Completed", color: "success" },
  backlogs: { name: "Backlogs", color: "warning" }
};

  return (
    <>
      <AddTaskModal 
        open={isAddTaskModalOpen} 
        onClose={handleCloseAddTask} 
      />
      
      <Grid container spacing={3} sx={{ p: 2 }}>
        {Object.entries(tabs).map(([key, { name, color }]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <BoardTab name={name} color={color} />
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Stack 
            spacing={2} 
            bgcolor="#000" 
            p={2}
            sx={{ 
              cursor: 'pointer',
              '&:hover': { bgcolor: '#111' }
            }}
            onClick={handleOpenAddTask}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={400} variant="h6" color="white">Add List</Typography>
              <IconButton size="small" sx={{ color: 'white' }}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default BoardInterface;