/**
 * Enhanced Board Interface Example
 * Shows how to integrate the new data architecture with existing components
 */

import React, { useEffect, useState } from 'react';
import { Grid, Stack, Typography, IconButton, Dialog, TextField, Button, Paper, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// New imports for enhanced data management
import useStore from '../store';
import getBoardStore from '../stores/boardStore';
import useDataManager from '../hooks/useDataManager';
import { createTask, createList, PRIORITY_LEVELS } from '../types/dataModels';
import { validateTask } from '../types/dataModels';

// Enhanced Board Interface with new data architecture
const EnhancedBoardInterface = ({ boardId }) => {
  // Global store
  const { 
    currentUser, 
    selectedBoard, 
    setSelectedBoard,
    setBoardData,
    updateBoardTasks,
    updateBoardLists,
    setBoardError,
    setBoardLoading,
    addNotification
  } = useStore();

  // Board-specific store
  const boardStore = getBoardStore(boardId);
  const {
    lists,
    tasks,
    metadata,
    loading,
    errors,
    selectedTasks,
    dragState,
    // Actions
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addList,
    updateList,
    deleteList,
    setBoardData: setBoardStoreData,
    setLoading,
    setError,
    clearError,
    // Computed values
    getBoardAnalytics,
    getOverdueTasks,
    getTasksDueSoon
  } = boardStore();

  // Data manager for Firestore operations
  const { 
    taskOperations, 
    listOperations, 
    boardOperations,
    loading: dataLoading,
    error: dataError,
    clearError: clearDataError
  } = useDataManager(boardId);

  // Local UI state
  const [addTaskTo, setAddTaskTo] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Initialize board data
  useEffect(() => {
    if (!boardId || !currentUser) return;

    setLoading('board', true);
    
    // Subscribe to real-time board updates
    const unsubscribe = boardOperations.subscribe(
      (boardData) => {
        console.log('📡 Real-time board update received');
        
        // Update both stores
        setBoardData(boardData);
        setBoardStoreData(boardData);
        
        // Update global store
        if (boardData.metadata) {
          setSelectedBoard(boardData.metadata);
        }
      },
      (error) => {
        console.error('❌ Real-time subscription error:', error);
        setBoardError(error.message);
        setError('board', error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [boardId, currentUser]);

  // Handle task addition with enhanced validation
  const handleAddTask = async (taskData) => {
    if (!addTaskTo) return;

    // Validate task data
    const validation = validateTask(taskData);
    if (!validation.isValid) {
      showSnackbar(`Invalid task: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    try {
      // Optimistic update in board store
      const localResult = addTask(addTaskTo, taskData);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await taskOperations.add(
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        addTaskTo,
        taskData
      );

      if (firestoreResult.success) {
        showSnackbar('Task added successfully!', 'success');
        
        // Add notification for deadline tasks
        if (taskData.deadline) {
          addNotification({
            id: `task_${Date.now()}`,
            type: 'task_created',
            message: `Task "${taskData.text}" created with deadline`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        showSnackbar(`Failed to add task: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showSnackbar('Failed to add task', 'error');
    } finally {
      setAddTaskTo('');
    }
  };

  // Handle task editing with optimistic updates
  const handleEditTask = async (listId, taskId, updates) => {
    try {
      // Optimistic update
      const localResult = updateTask(listId, taskId, updates);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await taskOperations.update(
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        listId,
        taskId,
        updates
      );

      if (firestoreResult.success) {
        showSnackbar('Task updated successfully!', 'success');
      } else {
        showSnackbar(`Failed to update task: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Failed to update task', 'error');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (listId, taskId) => {
    try {
      // Optimistic update
      const localResult = deleteTask(listId, taskId);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await taskOperations.delete(
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        listId,
        taskId
      );

      if (firestoreResult.success) {
        showSnackbar('Task deleted successfully!', 'success');
      } else {
        showSnackbar(`Failed to delete task: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Failed to delete task', 'error');
    }
  };

  // Handle drag and drop with enhanced error handling
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      // Optimistic update
      const localResult = moveTask(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );

      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await taskOperations.move(
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );

      if (firestoreResult.success) {
        showSnackbar('Task moved successfully!', 'success');
      } else {
        showSnackbar(`Failed to move task: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error moving task:', error);
      showSnackbar('Failed to move task', 'error');
    }
  };

  // Handle list addition
  const handleAddNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const listData = createList({
        name: newListName.trim(),
        color: 'primary'
      });

      // Optimistic update
      const localResult = addList(listData);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await listOperations.add(
        lists,
        (newLists) => updateBoardLists(newLists),
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        listData
      );

      if (firestoreResult.success) {
        showSnackbar('List added successfully!', 'success');
      } else {
        showSnackbar(`Failed to add list: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error adding list:', error);
      showSnackbar('Failed to add list', 'error');
    } finally {
      setNewListName('');
      setIsAddListDialogOpen(false);
    }
  };

  // Handle list deletion
  const handleDeleteList = async (listId) => {
    try {
      // Optimistic update
      const localResult = deleteList(listId);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      // Update Firestore
      const firestoreResult = await listOperations.delete(
        lists,
        (newLists) => updateBoardLists(newLists),
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        listId
      );

      if (firestoreResult.success) {
        showSnackbar('List deleted successfully!', 'success');
      } else {
        showSnackbar(`Failed to delete list: ${firestoreResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      showSnackbar('Failed to delete list', 'error');
    }
  };

  // Utility function for showing snackbar messages
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get board analytics for display
  const analytics = getBoardAnalytics();
  const overdueTasks = getOverdueTasks();
  const tasksDueSoon = getTasksDueSoon(24);

  if (loading.board || dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errors.board || dataError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error loading board: {errors.board || dataError}
        </Typography>
        <Button 
          onClick={() => {
            clearError('board');
            clearDataError();
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Board Analytics Display */}
      {analytics && (
        <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Board Analytics</Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="body2">
              Total Tasks: {analytics.totalTasks}
            </Typography>
            <Typography variant="body2">
              Completed: {analytics.completedTasks}
            </Typography>
            <Typography variant="body2" color={overdueTasks.length > 0 ? 'error' : 'text.secondary'}>
              Overdue: {overdueTasks.length}
            </Typography>
            <Typography variant="body2" color={tasksDueSoon.length > 0 ? 'warning.main' : 'text.secondary'}>
              Due Soon: {tasksDueSoon.length}
            </Typography>
            <Typography variant="body2">
              Completion Rate: {analytics.completionRate}%
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Task Modal */}
      {!!addTaskTo && lists[addTaskTo] && (
        <AddTaskModal 
          open={!!addTaskTo} 
          addTaskTo={lists[addTaskTo]?.name || ''} 
          onClose={() => setAddTaskTo('')}
          onSave={handleAddTask}
        />
      )}

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3} sx={{ p: 2 }}>
          {Object.entries(lists).filter(([_, list]) => list).map(([key, list]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Droppable droppableId={list.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <EnhancedBoardTab
                      key={list.id}
                      name={list.name}
                      color={list.color}
                      onAddTask={() => setAddTaskTo(list.id)}
                      tasks={Object.values(tasks).filter(task => task.listId === list.id)}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDeleteList={handleDeleteList}
                      listId={list.id}
                      isDragOver={snapshot.isDraggingOver}
                      boardId={boardId}
                      analytics={analytics}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Grid>
          ))}
          
          {/* Add List Button */}
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
              onClick={() => setIsAddListDialogOpen(true)}
            >
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%' }}>
                <AddIcon color="action" />
                <Typography color="text.secondary">Add another list</Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </DragDropContext>

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Enhanced Board Tab component (placeholder - you would implement this)
const EnhancedBoardTab = ({ 
  name, 
  color, 
  onAddTask, 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onDeleteList, 
  listId, 
  isDragOver, 
  boardId,
  analytics 
}) => {
  // This would be your enhanced BoardTab component
  // with additional features like task analytics per list
  return (
    <Paper 
      elevation={isDragOver ? 6 : 3}
      sx={{ 
        p: 2, 
        minHeight: 300,
        bgcolor: isDragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color={color}>
            {name} ({tasks.length})
          </Typography>
          <Button size="small" onClick={onAddTask}>
            <AddIcon />
          </Button>
        </Stack>
        
        {/* Task list would go here */}
        <Box sx={{ minHeight: 200 }}>
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    opacity: snapshot.isDragging ? 0.8 : 1,
                    transform: snapshot.isDragging 
                      ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                      : provided.draggableProps.style?.transform
                  }}
                >
                  <Paper 
                    elevation={snapshot.isDragging ? 4 : 1}
                    sx={{ p: 1, mb: 1, cursor: 'grab' }}
                  >
                    <Typography variant="body2">{task.text}</Typography>
                    {task.priority && (
                      <Typography variant="caption" color="primary">
                        Priority: {task.priority}
                      </Typography>
                    )}
                  </Paper>
                </div>
              )}
            </Draggable>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
};

// Mock AddTaskModal component
const AddTaskModal = ({ open, addTaskTo, onClose, onSave }) => {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState(PRIORITY_LEVELS.MEDIUM);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onSave({
        text: task.trim(),
        deadline: deadline || null,
        priority: priority
      });
      setTask('');
      setDeadline('');
      setPriority(PRIORITY_LEVELS.MEDIUM);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <Stack p={2} spacing={2}>
          <Typography variant="h6">Add Task to {addTaskTo}</Typography>
          <TextField
            label="Task Description"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
              <option key={value} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </TextField>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!task.trim()}>
              Add Task
            </Button>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
};

export default EnhancedBoardInterface;
