/**
 * Data Helper Functions for TP Board
 * Clean utilities for data manipulation and validation
 */

import { 
  createTask, 
  createList, 
  createBoardMetadata,
  validateTask,
  calculateTaskUrgency,
  PRIORITY_LEVELS,
  TASK_STATUS 
} from '../types/dataModels.js';
import { doc } from 'firebase/firestore';

// ===== FIRESTORE HELPERS =====

/**
 * Batch update helper for Firestore operations
 */
export const createBatchUpdate = (updates) => {
  const batchData = {
    ...updates,
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  // Remove undefined values
  Object.keys(batchData).forEach(key => {
    if (batchData[key] === undefined) {
      delete batchData[key];
    }
  });
  
  return batchData;
};

/**
 * Safe Firestore document reference helper
 */
export const getBoardRef = (db, userId, boardId) => {
  if (!userId || !boardId) {
    throw new Error('User ID and Board ID are required');
  }
  return doc(db, `users/${userId}/boards`, boardId);
};

/**
 * Optimistic update helper with rollback
 */
export const optimisticUpdate = async (
  localStateSetter,
  firestoreUpdate,
  originalState,
  newState
) => {
  try {
    // Apply optimistic update
    localStateSetter(newState);
    
    // Attempt Firestore update
    await firestoreUpdate();
    
    console.log('✅ Optimistic update successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Optimistic update failed, rolling back:', error);
    
    // Rollback to original state
    localStateSetter(originalState);
    
    return { success: false, error: error.message };
  }
};

// ===== TASK MANAGEMENT HELPERS =====

/**
 * Add task with proper validation and structure
 */
export const addTaskToList = (tasks, listId, taskData) => {
  const validation = validateTask(taskData);
  if (!validation.isValid) {
    throw new Error(`Invalid task data: ${validation.errors.join(', ')}`);
  }
  
  const newTask = createTask(taskData, listId);
  const currentTasks = tasks[listId] || [];
  
  return {
    ...tasks,
    [listId]: [...currentTasks, newTask]
  };
};

/**
 * Move task between lists with position management
 */
export const moveTask = (tasks, taskId, sourceListId, destListId, destIndex) => {
  const sourceTasks = [...(tasks[sourceListId] || [])];
  const taskIndex = sourceTasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in source list ${sourceListId}`);
  }
  
  // Remove task from source
  const [movedTask] = sourceTasks.splice(taskIndex, 1);
  
  // Update task properties
  const updatedTask = {
    ...movedTask,
    listId: destListId,
    updatedAt: new Date().toISOString(),
    ...(destListId === 'done' && { completedAt: new Date().toISOString() }),
    ...(destListId !== 'done' && movedTask.completedAt && { completedAt: null })
  };
  
  // Add to destination
  const destTasks = [...(tasks[destListId] || [])];
  destTasks.splice(destIndex, 0, updatedTask);
  
  return {
    ...tasks,
    [sourceListId]: sourceTasks,
    [destListId]: destTasks
  };
};

/**
 * Update task with validation
 */
export const updateTaskInList = (tasks, listId, taskId, updates) => {
  const listTasks = tasks[listId] || [];
  const taskIndex = listTasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Task ${taskId} not found in list ${listId}`);
  }
  
  const updatedTask = {
    ...listTasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // Validate updated task
  const validation = validateTask(updatedTask);
  if (!validation.isValid) {
    throw new Error(`Invalid task update: ${validation.errors.join(', ')}`);
  }
  
  const newListTasks = [...listTasks];
  newListTasks[taskIndex] = updatedTask;
  
  return {
    ...tasks,
    [listId]: newListTasks
  };
};

/**
 * Delete task from list
 */
export const deleteTaskFromList = (tasks, listId, taskId) => {
  const listTasks = tasks[listId] || [];
  const filteredTasks = listTasks.filter(task => task.id !== taskId);
  
  if (filteredTasks.length === listTasks.length) {
    throw new Error(`Task ${taskId} not found in list ${listId}`);
  }
  
  return {
    ...tasks,
    [listId]: filteredTasks
  };
};

// ===== LIST MANAGEMENT HELPERS =====

/**
 * Add new list with validation
 */
export const addNewList = (lists, listData) => {
  if (!listData.name || listData.name.trim().length === 0) {
    throw new Error('List name is required');
  }
  
  const newList = createList({
    ...listData,
    position: Object.keys(lists).length
  });
  
  return {
    ...lists,
    [newList.id]: newList
  };
};

/**
 * Delete list and handle tasks
 */
export const deleteList = (lists, tasks, listId, moveTasksTo = null) => {
  const { [listId]: deletedList, ...remainingLists } = lists;
  
  if (!deletedList) {
    throw new Error(`List ${listId} not found`);
  }
  
  let updatedTasks = { ...tasks };
  const listTasks = tasks[listId] || [];
  
  if (moveTasksTo && lists[moveTasksTo]) {
    // Move tasks to another list
    updatedTasks[moveTasksTo] = [
      ...(tasks[moveTasksTo] || []),
      ...listTasks.map(task => ({
        ...task,
        listId: moveTasksTo,
        updatedAt: new Date().toISOString()
      }))
    ];
  }
  
  // Remove the deleted list's tasks
  const { [listId]: deletedTasks, ...remainingTasks } = updatedTasks;
  
  return {
    lists: remainingLists,
    tasks: remainingTasks
  };
};

// ===== SEARCH AND FILTER HELPERS =====

/**
 * Search tasks across all lists
 */
export const searchTasks = (tasks, searchTerm, filters = {}) => {
  const allTasks = Object.values(tasks).flat();
  const term = searchTerm.toLowerCase().trim();
  
  let filteredTasks = allTasks.filter(task => {
    const matchesSearch = !term || 
      task.text.toLowerCase().includes(term) ||
      (task.description && task.description.toLowerCase().includes(term));
    
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesAssignee = !filters.assignedTo || task.assignedTo === filters.assignedTo;
    const matchesDeadline = !filters.hasDeadline || !!task.deadline;
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesDeadline;
  });
  
  // Sort by relevance and priority
  return filteredTasks.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = (tasks) => {
  const allTasks = Object.values(tasks).flat();
  const now = new Date();
  
  return allTasks.filter(task => {
    if (!task.deadline || task.listId === 'done') return false;
    return new Date(task.deadline) < now;
  });
};

/**
 * Get tasks due soon
 */
export const getTasksDueSoon = (tasks, hoursThreshold = 24) => {
  const allTasks = Object.values(tasks).flat();
  const now = new Date();
  const threshold = new Date(now.getTime() + (hoursThreshold * 60 * 60 * 1000));
  
  return allTasks.filter(task => {
    if (!task.deadline || task.listId === 'done') return false;
    const deadline = new Date(task.deadline);
    return deadline > now && deadline <= threshold;
  });
};

// ===== ANALYTICS HELPERS =====

/**
 * Calculate board statistics
 */
export const calculateBoardStats = (lists, tasks) => {
  const allTasks = Object.values(tasks).flat();
  const completedTasks = allTasks.filter(task => task.listId === 'done');
  const overdueTasks = getOverdueTasks(tasks);
  
  return {
    totalLists: Object.keys(lists).length,
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    completionRate: allTasks.length > 0 ? 
      Math.round((completedTasks.length / allTasks.length) * 100) : 0,
    tasksByPriority: {
      urgent: allTasks.filter(t => t.priority === PRIORITY_LEVELS.URGENT).length,
      high: allTasks.filter(t => t.priority === PRIORITY_LEVELS.HIGH).length,
      medium: allTasks.filter(t => t.priority === PRIORITY_LEVELS.MEDIUM).length,
      low: allTasks.filter(t => t.priority === PRIORITY_LEVELS.LOW).length
    },
    tasksByList: Object.entries(tasks).reduce((acc, [listId, listTasks]) => {
      acc[listId] = listTasks.length;
      return acc;
    }, {})
  };
};

// ===== EXPORT HELPERS =====

/**
 * Export board data to JSON
 */
export const exportBoardData = (boardMetadata, lists, tasks) => {
  return {
    board: boardMetadata,
    lists: lists,
    tasks: tasks,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Import board data with validation
 */
export const importBoardData = (importData) => {
  if (!importData.board || !importData.lists || !importData.tasks) {
    throw new Error('Invalid import data format');
  }
  
  // Validate and sanitize imported data
  const sanitizedLists = {};
  const sanitizedTasks = {};
  
  Object.entries(importData.lists).forEach(([listId, list]) => {
    sanitizedLists[listId] = createList({
      ...list,
      id: listId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  Object.entries(importData.tasks).forEach(([listId, listTasks]) => {
    sanitizedTasks[listId] = listTasks.map(task => createTask({
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, listId));
  });
  
  return {
    lists: sanitizedLists,
    tasks: sanitizedTasks
  };
};
