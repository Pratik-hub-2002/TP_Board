/**
 * Custom Hook for Data Management
 * Centralized data operations with optimistic updates and error handling
 */

import { useState, useCallback } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { 
  optimisticUpdate, 
  createBatchUpdate,
  addTaskToList,
  moveTask,
  updateTaskInList,
  deleteTaskFromList,
  addNewList,
  deleteList
} from '../utils/dataHelpers';

const useDataManager = (boardId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user
  const getCurrentUser = useCallback(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }, []);

  // Get board reference
  const getBoardRef = useCallback(() => {
    const user = getCurrentUser();
    if (!boardId) {
      throw new Error('Board ID is required');
    }
    return doc(db, `users/${user.uid}/boards`, boardId);
  }, [boardId, getCurrentUser]);

  // Generic Firestore update function
  const updateFirestore = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const boardRef = getBoardRef();
      const batchUpdate = createBatchUpdate(updates);
      
      await updateDoc(boardRef, batchUpdate);
      console.log('✅ Firestore update successful');
    } catch (err) {
      console.error('❌ Firestore update failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBoardRef]);

  // Task Operations
  const taskOperations = {
    // Add new task
    add: useCallback(async (tasks, setTasks, listId, taskData) => {
      const originalTasks = { ...tasks };
      
      try {
        const newTasks = addTaskToList(tasks, listId, taskData);
        
        return await optimisticUpdate(
          setTasks,
          () => updateFirestore({ [`tasks.${listId}`]: newTasks[listId] }),
          originalTasks,
          newTasks
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Update existing task
    update: useCallback(async (tasks, setTasks, listId, taskId, updates) => {
      const originalTasks = { ...tasks };
      
      try {
        const newTasks = updateTaskInList(tasks, listId, taskId, updates);
        
        return await optimisticUpdate(
          setTasks,
          () => updateFirestore({ [`tasks.${listId}`]: newTasks[listId] }),
          originalTasks,
          newTasks
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Delete task
    delete: useCallback(async (tasks, setTasks, listId, taskId) => {
      const originalTasks = { ...tasks };
      
      try {
        const newTasks = deleteTaskFromList(tasks, listId, taskId);
        
        return await optimisticUpdate(
          setTasks,
          () => updateFirestore({ [`tasks.${listId}`]: newTasks[listId] }),
          originalTasks,
          newTasks
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Move task between lists
    move: useCallback(async (tasks, setTasks, taskId, sourceListId, destListId, destIndex) => {
      const originalTasks = { ...tasks };
      
      try {
        const newTasks = moveTask(tasks, taskId, sourceListId, destListId, destIndex);
        
        const updates = {
          [`tasks.${sourceListId}`]: newTasks[sourceListId],
          [`tasks.${destListId}`]: newTasks[destListId]
        };
        
        return await optimisticUpdate(
          setTasks,
          () => updateFirestore(updates),
          originalTasks,
          newTasks
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore])
  };

  // List Operations
  const listOperations = {
    // Add new list
    add: useCallback(async (lists, setLists, tasks, setTasks, listData) => {
      const originalLists = { ...lists };
      const originalTasks = { ...tasks };
      
      try {
        const newLists = addNewList(lists, listData);
        const newListId = Object.keys(newLists).find(id => !lists[id]);
        const newTasks = { ...tasks, [newListId]: [] };
        
        const updates = {
          [`lists.${newListId}`]: newLists[newListId],
          [`tasks.${newListId}`]: []
        };
        
        // Update both lists and tasks optimistically
        setLists(newLists);
        setTasks(newTasks);
        
        try {
          await updateFirestore(updates);
          return { success: true };
        } catch (err) {
          setLists(originalLists);
          setTasks(originalTasks);
          throw err;
        }
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Delete list
    delete: useCallback(async (lists, setLists, tasks, setTasks, listId, moveTasksTo = null) => {
      const originalLists = { ...lists };
      const originalTasks = { ...tasks };
      
      try {
        const { lists: newLists, tasks: newTasks } = deleteList(lists, tasks, listId, moveTasksTo);
        
        const updates = {
          lists: newLists,
          tasks: newTasks
        };
        
        // Update both lists and tasks optimistically
        setLists(newLists);
        setTasks(newTasks);
        
        try {
          await updateFirestore(updates);
          return { success: true };
        } catch (err) {
          setLists(originalLists);
          setTasks(originalTasks);
          throw err;
        }
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Update list
    update: useCallback(async (lists, setLists, listId, updates) => {
      const originalLists = { ...lists };
      
      try {
        const newLists = {
          ...lists,
          [listId]: {
            ...lists[listId],
            ...updates,
            updatedAt: new Date().toISOString()
          }
        };
        
        return await optimisticUpdate(
          setLists,
          () => updateFirestore({ [`lists.${listId}`]: newLists[listId] }),
          originalLists,
          newLists
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore])
  };

  // Board Operations
  const boardOperations = {
    // Update board metadata
    updateMetadata: useCallback(async (metadata, setMetadata, updates) => {
      const originalMetadata = { ...metadata };
      
      try {
        const newMetadata = {
          ...metadata,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        return await optimisticUpdate(
          setMetadata,
          () => updateFirestore(updates),
          originalMetadata,
          newMetadata
        );
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    }, [updateFirestore]),

    // Subscribe to real-time updates
    subscribe: useCallback((onUpdate, onError) => {
      try {
        const boardRef = getBoardRef();
        
        const unsubscribe = onSnapshot(
          boardRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              onUpdate(data);
            } else {
              console.warn('Board document does not exist');
            }
          },
          (error) => {
            console.error('Real-time subscription error:', error);
            setError(error.message);
            if (onError) onError(error);
          }
        );
        
        return unsubscribe;
      } catch (err) {
        setError(err.message);
        if (onError) onError(err);
        return () => {}; // Return empty cleanup function
      }
    }, [getBoardRef])
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    taskOperations,
    listOperations,
    boardOperations,
    updateFirestore
  };
};

export default useDataManager;
