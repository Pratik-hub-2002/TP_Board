import { Grid, Stack, Typography, IconButton, Dialog, TextField, Button, Paper, CircularProgress, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddTaskModal from './AddTaskModal';
import BoardTab from './BoardTab';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useDeadlineNotifications from '../../hooks/useDeadlineNotifications';
import NotificationPanel from '../../components/layout/NotificationPanel';

const BoardInterface = ({ boardId }) => {
  const [tabs, setTabs] = useState({});
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Deadline notifications
  const { notifications, clearNotification, clearAllNotifications } = useDeadlineNotifications(tasks);
  
  // Load data from Firestore on component mount
  useEffect(() => {
    if (!boardId) {
      console.error('No board ID provided to BoardInterface');
      setLoading(false);
      return;
    }
    
    const auth = getAuth();
    
    // Wait for auth state to be ready
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        console.error('User not authenticated in BoardInterface');
        setLoading(false);
        return;
      }
      
      console.log('BoardInterface: Auth ready, user:', currentUser.uid);
      const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
      
      // Subscribe to real-time updates
      const unsubscribeSnapshot = onSnapshot(boardRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const boardData = docSnapshot.data();
          setTabs(boardData.tabs || {});
          setTasks(boardData.tasks || {});
        } else {
          // Create default board structure if it doesn't exist
          const defaultTabs = {
            'todo': { id: 'todo', name: 'To Do', color: 'primary' },
            'inprogress': { id: 'inprogress', name: 'In Progress', color: 'warning' },
            'done': { id: 'done', name: 'Done', color: 'success' }
          };
          const defaultTasks = {
            'todo': [],
            'inprogress': [],
            'done': []
          };
          
          await setDoc(boardRef, {
            name: 'New Board',
            tabs: defaultTabs,
            tasks: defaultTasks,
            members: {}, // Initialize empty members object for collaboration
            owner: currentUser.uid,
            ownerEmail: currentUser.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublic: false,
            settings: {
              allowComments: true,
              allowEditing: true,
              notifyOnChanges: true
            }
          });
          
          setTabs(defaultTabs);
          setTasks(defaultTasks);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error listening to board changes:', error);
        setLoading(false);
      });
      
      // Return cleanup function for snapshot listener
      return () => {
        unsubscribeSnapshot();
      };
    });
    
    // Return cleanup function for auth listener
    return () => {
      unsubscribeAuth();
    };
  }, [boardId]); // Re-run when boardId changes
  
  // Update Firestore when state changes
  const updateFirestore = async (updates) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }
    
    const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
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
      
      try {
        // Update local state first for immediate UI feedback
        const updatedTabs = { ...tabs, [newId]: newTab };
        const updatedTasks = { ...tasks, [newId]: [] };
        
        setTabs(updatedTabs);
        setTasks(updatedTasks);
        
        // Update Firestore
        await updateFirestore({
          [`tabs.${newId}`]: newTab,
          [`tasks.${newId}`]: []
        });
        
        console.log('New list created successfully:', newTab.name);
      } catch (error) {
        console.error('Error creating new list:', error);
        // Revert local state on error
        setTabs(tabs);
        setTasks(tasks);
      } finally {
        setNewListName('');
        setIsAddListDialogOpen(false);
      }
    }
  };

  const handleAddTask = async (taskData) => {
    if ((typeof taskData === 'string' ? taskData.trim() : taskData.text?.trim()) && addTaskTo) {
      const newTask = {
        id: `task-${Date.now()}`,
        text: typeof taskData === 'string' ? taskData : taskData.text,
        status: addTaskTo,
        createdAt: new Date().toISOString(),
        deadline: typeof taskData === 'object' ? taskData.deadline : null,
        priority: typeof taskData === 'object' ? taskData.priority : 'medium'
      };
      
      try {
        const updatedTasks = {
          ...tasks,
          [addTaskTo]: [...(tasks[addTaskTo] || []), newTask]
        };
        
        // Update local state first for immediate UI feedback
        setTasks(updatedTasks);
        
        // Update Firestore
        await updateFirestore({
          [`tasks.${addTaskTo}`]: updatedTasks[addTaskTo]
        });
        
        console.log('Task added successfully:', newTask.text);
      } catch (error) {
        console.error('Error adding task:', error);
        // Revert local state on error
        setTasks(tasks);
      } finally {
        setAddTaskTo('');
      }
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
      console.log('Deleting task:', taskId, 'from list:', listId);
      const updatedTasks = {
        ...tasks,
        [listId]: (tasks[listId] || []).filter(task => task.id !== taskId)
      };
      console.log('Updated tasks after deletion:', updatedTasks[listId]);
      setTasks(updatedTasks);
      await updateFirestore({
        [`tasks.${listId}`]: updatedTasks[listId] || []
      });
      console.log('Task deleted successfully');
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      console.log('Deleting list:', listId);
      // Create new objects without the deleted list
      const { [listId]: deletedTab, ...remainingTabs } = tabs;
      const { [listId]: deletedTasks, ...remainingTasks } = tasks;
      
      // Update local state
      setTabs(remainingTabs);
      setTasks(remainingTasks);
      
      // Update Firestore
      const updates = {
        tabs: remainingTabs,
        tasks: remainingTasks
      };
      
      await updateFirestore(updates);
      console.log('List deleted successfully');
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };
  
  const handleCloseAddTask = () => {
    setAddTaskTo('');
  };

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If no destination, return
    if (!destination) return;

    // If dropped in the same position, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    // Find the task being moved
    const sourceList = [...(tasks[sourceListId] || [])];
    const [movedTask] = sourceList.splice(source.index, 1);

    // Update task status if moving to different list
    if (sourceListId !== destListId) {
      movedTask.status = destListId;
    }

    // Create new tasks state
    const newTasks = { ...tasks };

    if (sourceListId === destListId) {
      // Moving within the same list
      sourceList.splice(destination.index, 0, movedTask);
      newTasks[sourceListId] = sourceList;
    } else {
      // Moving to different list
      const destList = [...(tasks[destListId] || [])];
      destList.splice(destination.index, 0, movedTask);
      
      newTasks[sourceListId] = sourceList;
      newTasks[destListId] = destList;
    }

    // Update local state immediately for smooth UX
    setTasks(newTasks);

    // Update Firestore
    try {
      const updates = {};
      updates[`tasks.${sourceListId}`] = newTasks[sourceListId];
      if (sourceListId !== destListId) {
        updates[`tasks.${destListId}`] = newTasks[destListId];
      }
      await updateFirestore(updates);
      console.log('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert on error
      setTasks(tasks);
    }
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3} sx={{ p: 2 }}>
          {Object.entries(tabs).filter(([_, tab]) => tab).map(([key, tab]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Droppable droppableId={tab.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <BoardTab
                      key={tab.id}
                      name={tab.name}
                      color={tab.color}
                      onAddTask={handleAddTask}
                      tasks={tasks[tab.id] || []}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDeleteList={handleDeleteList}
                      listId={tab.id}
                      isDragOver={snapshot.isDraggingOver}
                      boardId={boardId}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
      </DragDropContext>

      {/* Notification Panel */}
      <NotificationPanel 
        notifications={notifications}
        onClearNotification={clearNotification}
        onClearAll={clearAllNotifications}
      />

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