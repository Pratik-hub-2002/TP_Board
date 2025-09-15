# TP Board Implementation Guide

## 🚀 Quick Start Integration

This guide shows you how to integrate the new data architecture into your existing TP Board application.

## 📋 Step-by-Step Implementation

### Step 1: Update Your BoardInterface Component

Replace your existing `BoardInterface.jsx` with the enhanced version:

```javascript
// src/screens/BoardScreen/BoardInterface.jsx
import React, { useEffect, useState } from 'react';
import { Grid, Stack, Typography, IconButton, Dialog, TextField, Button, Paper, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// New imports
import useStore from '../../store';
import getBoardStore from '../../stores/boardStore';
import useDataManager from '../../hooks/useDataManager';
import { createTask, createList, PRIORITY_LEVELS, validateTask } from '../../types/dataModels';
import AddTaskModal from './AddTaskModal';
import BoardTab from './BoardTab';

const BoardInterface = ({ boardId }) => {
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
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addList,
    deleteList,
    setBoardData: setBoardStoreData,
    setLoading,
    setError,
    getBoardAnalytics,
    getOverdueTasks
  } = boardStore();

  // Data manager
  const { 
    taskOperations, 
    listOperations, 
    boardOperations,
    loading: dataLoading,
    error: dataError
  } = useDataManager(boardId);

  // Local state
  const [addTaskTo, setAddTaskTo] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Initialize board data
  useEffect(() => {
    if (!boardId || !currentUser) return;

    setLoading('board', true);
    
    const unsubscribe = boardOperations.subscribe(
      (boardData) => {
        setBoardData(boardData);
        setBoardStoreData(boardData);
        if (boardData.metadata) {
          setSelectedBoard(boardData.metadata);
        }
      },
      (error) => {
        setBoardError(error.message);
        setError('board', error.message);
      }
    );

    return unsubscribe;
  }, [boardId, currentUser]);

  // Enhanced task operations
  const handleAddTask = async (taskData) => {
    if (!addTaskTo) return;

    const validation = validateTask(taskData);
    if (!validation.isValid) {
      showSnackbar(`Invalid task: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    try {
      const localResult = addTask(addTaskTo, taskData);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

      const firestoreResult = await taskOperations.add(
        tasks,
        (newTasks) => updateBoardTasks(newTasks),
        addTaskTo,
        taskData
      );

      if (firestoreResult.success) {
        showSnackbar('Task added successfully!', 'success');
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
      showSnackbar('Failed to add task', 'error');
    } finally {
      setAddTaskTo('');
    }
  };

  const handleEditTask = async (listId, taskId, updates) => {
    try {
      const localResult = updateTask(listId, taskId, updates);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

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
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (listId, taskId) => {
    try {
      const localResult = deleteTask(listId, taskId);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

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
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    try {
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
      showSnackbar('Failed to move task', 'error');
    }
  };

  const handleAddNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const listData = createList({
        name: newListName.trim(),
        color: 'primary'
      });

      const localResult = addList(listData);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

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
      showSnackbar('Failed to add list', 'error');
    } finally {
      setNewListName('');
      setIsAddListDialogOpen(false);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const localResult = deleteList(listId);
      if (!localResult.success) {
        showSnackbar(localResult.error, 'error');
        return;
      }

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
      showSnackbar('Failed to delete list', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const analytics = getBoardAnalytics();
  const overdueTasks = getOverdueTasks();

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
      </Box>
    );
  }

  return (
    <>
      {/* Analytics Display */}
      {analytics && (
        <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Board Analytics</Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="body2">Total Tasks: {analytics.totalTasks}</Typography>
            <Typography variant="body2">Completed: {analytics.completedTasks}</Typography>
            <Typography variant="body2" color={overdueTasks.length > 0 ? 'error' : 'text.secondary'}>
              Overdue: {overdueTasks.length}
            </Typography>
            <Typography variant="body2">Completion Rate: {analytics.completionRate}%</Typography>
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

      {/* Board Interface */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3} sx={{ p: 2 }}>
          {Object.entries(lists).filter(([_, list]) => list).map(([key, list]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Droppable droppableId={list.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <BoardTab
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
                p: 2, height: '100%', display: 'flex', flexDirection: 'column',
                cursor: 'pointer', bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover', boxShadow: 4 },
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
              autoFocus label="List Name" fullWidth value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              margin="normal" variant="outlined"
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button onClick={() => setIsAddListDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={!newListName.trim()}>
                Add List
              </Button>
            </Stack>
          </Stack>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BoardInterface;
```

### Step 2: Update Your useApp Hook

```javascript
// src/hooks/useApp.js
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import useStore from '../store'
import { createBoardMetadata } from '../types/dataModels'

const useApp = () => {
    const [authLoading, setAuthLoading] = useState(true);
    const auth = getAuth();
    const { 
        setCurrentUser, 
        setLoginStatus, 
        setBoards, 
        setBoardsError,
        currentUser 
    } = useStore();
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('🔄 useApp: Auth state changed:', user ? user.uid : 'logged out');
            setCurrentUser(user);
            setAuthLoading(false);
            setLoginStatus(!!user, user);
        });
        
        return () => unsubscribe();
    }, [auth, setLoginStatus, setCurrentUser]);

    const createBoard = async (boardData) => {
        if (!currentUser) {
            throw new Error('User must be authenticated to create board');
        }
        
        try {
            const metadata = createBoardMetadata(boardData, currentUser.uid, currentUser.email);
            const boardsColRef = collection(db, `users/${currentUser.uid}/boards`);
            const docRef = await addDoc(boardsColRef, {
                metadata,
                lists: {
                    'todo': { id: 'todo', name: 'To Do', color: 'primary', position: 0 },
                    'inprogress': { id: 'inprogress', name: 'In Progress', color: 'warning', position: 1 },
                    'done': { id: 'done', name: 'Done', color: 'success', position: 2 }
                },
                tasks: {},
                members: {
                    [currentUser.email]: {
                        email: currentUser.email,
                        role: 'owner',
                        joinedAt: new Date().toISOString(),
                        status: 'active'
                    }
                },
                settings: {
                    allowComments: true,
                    allowTaskCreation: true,
                    allowMemberInvites: true
                }
            });
            
            const newBoard = { 
                id: docRef.id, 
                ...metadata
            };
            
            return newBoard;
        } catch (err) {
            console.error('Error creating board:', err);
            throw new Error('Failed to create board: ' + err.message);
        }
    } 

    const fetchBoards = async (setLoading) => {
        if (!currentUser) {
            console.log('🚫 fetchBoards: No current user');
            if (setLoading) setLoading(false);
            return;
        }
        
        try {
            console.log('📥 fetchBoards: Fetching boards for user:', currentUser.uid);
            const boardsColRef = collection(db, `users/${currentUser.uid}/boards`);
            const q = query(boardsColRef, orderBy('metadata.createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const boards = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data.metadata,
                    createdAt: data.metadata?.createdAt || new Date().toISOString()
                };
            });
            
            console.log('✅ fetchBoards: Found', boards.length, 'boards');
            setBoards(boards);
        } catch (err) {
            console.error('❌ fetchBoards error:', err);
            setBoardsError(err.message);
            throw err;
        } finally {
            if (setLoading) setLoading(false);
        }
    }
    
    return { 
        createBoard, 
        fetchBoards, 
        loading: authLoading, 
        error: !authLoading && !currentUser ? 'User must be authenticated' : null,
        currentUser 
    };    
}

export default useApp
```

### Step 3: Install Required Dependencies

```bash
npm install zustand @hello-pangea/dnd
```

### Step 4: Update Your Package.json

Add these dependencies if not already present:

```json
{
  "dependencies": {
    "zustand": "^4.4.1",
    "@hello-pangea/dnd": "^16.3.0"
  }
}
```

## 🔧 Key Integration Points

### 1. **Store Integration**
- Replace your existing store with the enhanced version
- Use both global and board-specific stores
- Implement optimistic updates with automatic rollback

### 2. **Data Operations**
- Use the `useDataManager` hook for all Firestore operations
- Implement proper error handling with user feedback
- Add real-time analytics and monitoring

### 3. **Component Updates**
- Update components to use new data models
- Add validation using the provided validation functions
- Implement enhanced drag & drop with visual feedback

## 🚀 Benefits You'll Get

1. **Better Performance**: Optimistic updates with instant UI feedback
2. **Enhanced UX**: Real-time analytics and comprehensive error handling
3. **Scalability**: Normalized data structure supporting unlimited tasks
4. **Type Safety**: Comprehensive validation at all levels
5. **Maintainability**: Clean, documented code with separation of concerns

## 📊 Testing Your Implementation

1. **Start your Firebase emulator**: `npm run emulator`
2. **Test task operations**: Add, edit, delete, and move tasks
3. **Test list operations**: Create and delete lists
4. **Test real-time sync**: Open multiple browser tabs
5. **Test error handling**: Disconnect network and observe behavior

## 🔍 Troubleshooting

### Common Issues:
1. **Import errors**: Make sure all new files are in correct locations
2. **Store not updating**: Check that you're using the correct store hooks
3. **Firestore errors**: Verify your Firebase configuration and rules
4. **Real-time not working**: Check your Firestore security rules

Your enhanced TP Board application is now ready with professional-grade data management!
