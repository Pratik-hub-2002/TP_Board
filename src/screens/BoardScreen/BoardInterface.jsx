import { Grid, Stack, Typography, IconButton, Dialog, TextField, Button, Paper, CircularProgress, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddTaskModal from './AddTaskModal';
import BoardTab from './BoardTab';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const BoardInterface = ({ boardId }) => {
  const [tabs, setTabs] = useState({});
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Load data from Firestore on component mount
  useEffect(() => {
    if (!boardId) {
      console.error('No board ID provided to BoardInterface');
      setLoading(false);
      return;
    }
    
    const boardRef = doc(db, 'boards', boardId);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(boardRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.tabs) setTabs(data.tabs);
        if (data.tasks) setTasks(data.tasks);
      } else {
        // Initialize with default data if no document exists
        const defaultTabs = {
          todos: { name: "Todos", color: "primary" },
          inProgress: { name: "In Progress", color: "secondary" },
          done: { name: "Completed", color: "success" },
          backlogs: { name: "Backlogs", color: "warning" }
        };
        
        setDoc(boardRef, {
          tabs: defaultTabs,
          tasks: {}
        });
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [boardId]); // Re-run when boardId changes
  
  // Update Firestore when state changes
  const updateFirestore = async (updates) => {
    const boardRef = doc(db, 'boards', boardId);
    try {
      await updateDoc(boardRef, updates);
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };
  const [addTaskTo, setAddTaskTo] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);

  const handleOpenAddTask = (tabKey) => {
    setAddTaskTo(tabKey);
  };

  const handleOpenAddList = () => {
    setNewListName('');
    setIsAddListDialogOpen(true);
  };

  // List of available colors for new lists
  const availableColors = [
    'primary', 'secondary', 'error', 'warning', 'info', 'success',
    'action', 'disabled', 'text.primary', 'text.secondary'
  ];

  const handleAddNewList = async () => {
    if (newListName.trim()) {
      const newId = `list-${Date.now()}`;
      
      // Get a random color from available colors
      const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      
      const newTab = {
        name: newListName.trim(),
        color: randomColor,
        id: newId
      };
      
      // Update local state
      const updatedTabs = { ...tabs, [newId]: newTab };
      const updatedTasks = { ...tasks, [newId]: [] };
      
      setTabs(updatedTabs);
      setTasks(updatedTasks);
      
      // Update Firestore
      await updateFirestore({
        [`tabs.${newId}`]: newTab,
        [`tasks.${newId}`]: []
      });
      
      setNewListName('');
      setIsAddListDialogOpen(false);
    }
  };

  const handleAddTask = async (taskText) => {
    if (taskText.trim() && addTaskTo) {
      const newTask = {
        id: `task-${Date.now()}`,
        text: taskText,
        status: addTaskTo,
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = {
        ...tasks,
        [addTaskTo]: [...(tasks[addTaskTo] || []), newTask]
      };
      
      setTasks(updatedTasks);
      
      // Update Firestore
      await updateFirestore({
        [`tasks.${addTaskTo}`]: updatedTasks[addTaskTo]
      });
      
      setAddTaskTo('');
    }
  };

  const handleEditTask = async (listId, updatedTask) => {
    try {
      const updatedTasks = {
        ...tasks,
        [listId]: (tasks[listId] || []).map(task => 
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      };
      setTasks(updatedTasks);
      await updateFirestore({
        [`tasks.${listId}`]: updatedTasks[listId] || []
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (listId, taskId) => {
    try {
      const updatedTasks = {
        ...tasks,
        [listId]: (tasks[listId] || []).filter(task => task.id !== taskId)
      };
      setTasks(updatedTasks);
      await updateFirestore({
        [`tasks.${listId}`]: updatedTasks[listId] || []
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteList = async (listId) => {
    // Create new objects without the deleted list
    const { [listId]: deletedTab, ...remainingTabs } = tabs;
    const { [listId]: deletedTasks, ...remainingTasks } = tasks;
    
    // Update local state
    setTabs(remainingTabs);
    setTasks(remainingTasks);
    
    // Update Firestore
    const updates = {
      [`tabs.${listId}`]: null, // This will delete the field
      [`tasks.${listId}`]: null
    };
    
    await updateFirestore(updates);
  };
  
  const handleCloseAddTask = () => {
    setAddTaskTo('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {!!addTaskTo && tabs[addTaskTo] && (
        <AddTaskModal 
          open={!!addTaskTo} 
          addTaskTo={tabs[addTaskTo]?.name || ''} 
          onClose={handleCloseAddTask}
          onSave={handleAddTask}
        />
      )}
      <Grid container spacing={3} sx={{ p: 2 }}>
        {Object.entries(tabs).filter(([_, tab]) => tab).map(([key, { name, color }]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
            <BoardTab 
              key={key}
              name={name} 
              color={color}
              tasks={tasks[key] || []}
              onAddTask={() => handleOpenAddTask(key)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDeleteList={handleDeleteList}
              listId={key}
            />
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              bgcolor: 'background.paper',
              '&:hover': { 
                bgcolor: 'action.hover',
                boxShadow: 4
              },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={handleOpenAddList}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%' }}>
              <AddIcon color="action" />
              <Typography color="text.secondary">Add another list</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Add List Dialog */}
      <Dialog open={isAddListDialogOpen} onClose={() => setIsAddListDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); handleAddNewList(); }}>
          <Stack p={2} spacing={2}>
            <Typography variant="h6" fontWeight="bold">Add New List</Typography>
            
            <TextField
              autoFocus
              label="List Name"
              fullWidth
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button onClick={() => setIsAddListDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!newListName.trim()}
              >
                Add List
              </Button>
            </Stack>
          </Stack>
        </form>
      </Dialog>
    </>
  );
};

export default BoardInterface;