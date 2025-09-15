/**
 * Specialized Board Store
 * Handles board-specific state management with optimistic updates
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { 
  addTaskToList,
  moveTask,
  updateTaskInList,
  deleteTaskFromList,
  addNewList,
  deleteList,
  calculateBoardStats,
  searchTasks,
  getOverdueTasks,
  getTasksDueSoon
} from '../utils/dataHelpers';

const createBoardStore = (boardId) => create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ===== BOARD STATE =====
      boardId: boardId,
      metadata: null,
      lists: {},
      tasks: {},
      members: {},
      settings: {},
      
      // ===== LOADING STATES =====
      loading: {
        board: false,
        tasks: false,
        lists: false,
        members: false
      },
      
      // ===== ERROR STATES =====
      errors: {
        board: null,
        tasks: null,
        lists: null,
        members: null
      },
      
      // ===== FILTERS & SEARCH =====
      filters: {
        search: '',
        priority: null,
        assignedTo: null,
        hasDeadline: false,
        listId: null
      },
      
      // ===== UI STATE =====
      selectedTasks: new Set(),
      dragState: {
        isDragging: false,
        draggedTaskId: null,
        sourceListId: null
      },
      
      // ===== COMPUTED VALUES =====
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        if (!filters.search && !filters.priority && !filters.assignedTo && !filters.hasDeadline && !filters.listId) {
          return tasks;
        }
        
        const allTasks = Object.values(tasks).flat();
        return searchTasks({ allTasks }, filters.search, {
          priority: filters.priority,
          assignedTo: filters.assignedTo,
          hasDeadline: filters.hasDeadline,
          listId: filters.listId
        });
      },
      
      getTasksByList: (listId) => {
        const { tasks } = get();
        return Object.values(tasks).filter(task => task.listId === listId);
      },
      
      getBoardAnalytics: () => {
        const { lists, tasks } = get();
        return calculateBoardStats(lists, tasks);
      },
      
      getOverdueTasks: () => {
        const { tasks } = get();
        return getOverdueTasks(tasks);
      },
      
      getTasksDueSoon: (hours = 24) => {
        const { tasks } = get();
        return getTasksDueSoon(tasks, hours);
      },
      
      // ===== BOARD ACTIONS =====
      setBoardData: (boardData) => {
        set({
          metadata: boardData.metadata || null,
          lists: boardData.lists || {},
          tasks: boardData.tasks || {},
          members: boardData.members || {},
          settings: boardData.settings || {},
          loading: { ...get().loading, board: false },
          errors: { ...get().errors, board: null }
        });
      },
      
      updateMetadata: (updates) => {
        set((state) => ({
          metadata: state.metadata ? { ...state.metadata, ...updates } : updates
        }));
      },
      
      // ===== LIST ACTIONS =====
      setLists: (lists) => {
        set({
          lists,
          loading: { ...get().loading, lists: false },
          errors: { ...get().errors, lists: null }
        });
      },
      
      addList: (listData) => {
        const { lists } = get();
        try {
          const newLists = addNewList(lists, listData);
          set({ 
            lists: newLists,
            errors: { ...get().errors, lists: null }
          });
          return { success: true, lists: newLists };
        } catch (error) {
          set({
            errors: { ...get().errors, lists: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      updateList: (listId, updates) => {
        set((state) => ({
          lists: {
            ...state.lists,
            [listId]: state.lists[listId] ? {
              ...state.lists[listId],
              ...updates,
              updatedAt: new Date().toISOString()
            } : null
          }
        }));
      },
      
      deleteList: (listId, moveTasksTo = null) => {
        const { lists, tasks } = get();
        try {
          const result = deleteList(lists, tasks, listId, moveTasksTo);
          set({
            lists: result.lists,
            tasks: result.tasks,
            errors: { ...get().errors, lists: null }
          });
          return { success: true, ...result };
        } catch (error) {
          set({
            errors: { ...get().errors, lists: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      // ===== TASK ACTIONS =====
      setTasks: (tasks) => {
        set({
          tasks,
          loading: { ...get().loading, tasks: false },
          errors: { ...get().errors, tasks: null }
        });
      },
      
      addTask: (listId, taskData) => {
        const { tasks } = get();
        try {
          const newTasks = addTaskToList(tasks, listId, taskData);
          set({ 
            tasks: newTasks,
            errors: { ...get().errors, tasks: null }
          });
          return { success: true, tasks: newTasks };
        } catch (error) {
          set({
            errors: { ...get().errors, tasks: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      updateTask: (listId, taskId, updates) => {
        const { tasks } = get();
        try {
          const newTasks = updateTaskInList(tasks, listId, taskId, updates);
          set({ 
            tasks: newTasks,
            errors: { ...get().errors, tasks: null }
          });
          return { success: true, tasks: newTasks };
        } catch (error) {
          set({
            errors: { ...get().errors, tasks: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      deleteTask: (listId, taskId) => {
        const { tasks } = get();
        try {
          const newTasks = deleteTaskFromList(tasks, listId, taskId);
          set({ 
            tasks: newTasks,
            errors: { ...get().errors, tasks: null }
          });
          return { success: true, tasks: newTasks };
        } catch (error) {
          set({
            errors: { ...get().errors, tasks: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      moveTask: (taskId, sourceListId, destListId, destIndex) => {
        const { tasks } = get();
        try {
          const newTasks = moveTask(tasks, taskId, sourceListId, destListId, destIndex);
          set({ 
            tasks: newTasks,
            errors: { ...get().errors, tasks: null }
          });
          return { success: true, tasks: newTasks };
        } catch (error) {
          set({
            errors: { ...get().errors, tasks: error.message }
          });
          return { success: false, error: error.message };
        }
      },
      
      // ===== BULK TASK ACTIONS =====
      selectTask: (taskId) => {
        set((state) => ({
          selectedTasks: new Set([...state.selectedTasks, taskId])
        }));
      },
      
      deselectTask: (taskId) => {
        set((state) => {
          const newSelected = new Set(state.selectedTasks);
          newSelected.delete(taskId);
          return { selectedTasks: newSelected };
        });
      },
      
      selectAllTasks: (listId = null) => {
        const { tasks } = get();
        const tasksToSelect = listId 
          ? Object.values(tasks).filter(task => task.listId === listId)
          : Object.values(tasks);
        
        set({
          selectedTasks: new Set(tasksToSelect.map(task => task.id))
        });
      },
      
      clearSelection: () => {
        set({ selectedTasks: new Set() });
      },
      
      bulkUpdateTasks: (updates) => {
        const { tasks, selectedTasks } = get();
        const updatedTasks = { ...tasks };
        
        selectedTasks.forEach(taskId => {
          const task = Object.values(tasks).find(t => t.id === taskId);
          if (task) {
            const listTasks = updatedTasks[task.listId] || [];
            const taskIndex = listTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              listTasks[taskIndex] = {
                ...listTasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
          }
        });
        
        set({ 
          tasks: updatedTasks,
          selectedTasks: new Set() // Clear selection after bulk update
        });
      },
      
      bulkDeleteTasks: () => {
        const { tasks, selectedTasks } = get();
        const updatedTasks = { ...tasks };
        
        selectedTasks.forEach(taskId => {
          const task = Object.values(tasks).find(t => t.id === taskId);
          if (task) {
            updatedTasks[task.listId] = (updatedTasks[task.listId] || [])
              .filter(t => t.id !== taskId);
          }
        });
        
        set({ 
          tasks: updatedTasks,
          selectedTasks: new Set()
        });
      },
      
      // ===== FILTER ACTIONS =====
      setSearchFilter: (search) => {
        set((state) => ({
          filters: { ...state.filters, search }
        }));
      },
      
      setPriorityFilter: (priority) => {
        set((state) => ({
          filters: { ...state.filters, priority }
        }));
      },
      
      setAssigneeFilter: (assignedTo) => {
        set((state) => ({
          filters: { ...state.filters, assignedTo }
        }));
      },
      
      setDeadlineFilter: (hasDeadline) => {
        set((state) => ({
          filters: { ...state.filters, hasDeadline }
        }));
      },
      
      setListFilter: (listId) => {
        set((state) => ({
          filters: { ...state.filters, listId }
        }));
      },
      
      clearFilters: () => {
        set({
          filters: {
            search: '',
            priority: null,
            assignedTo: null,
            hasDeadline: false,
            listId: null
          }
        });
      },
      
      // ===== DRAG & DROP ACTIONS =====
      setDragState: (dragState) => {
        set((state) => ({
          dragState: { ...state.dragState, ...dragState }
        }));
      },
      
      startDrag: (taskId, sourceListId) => {
        set({
          dragState: {
            isDragging: true,
            draggedTaskId: taskId,
            sourceListId: sourceListId
          }
        });
      },
      
      endDrag: () => {
        set({
          dragState: {
            isDragging: false,
            draggedTaskId: null,
            sourceListId: null
          }
        });
      },
      
      // ===== LOADING ACTIONS =====
      setLoading: (type, loading) => {
        set((state) => ({
          loading: { ...state.loading, [type]: loading }
        }));
      },
      
      // ===== ERROR ACTIONS =====
      setError: (type, error) => {
        set((state) => ({
          errors: { ...state.errors, [type]: error }
        }));
      },
      
      clearError: (type) => {
        set((state) => ({
          errors: { ...state.errors, [type]: null }
        }));
      },
      
      clearAllErrors: () => {
        set({
          errors: {
            board: null,
            tasks: null,
            lists: null,
            members: null
          }
        });
      },
      
      // ===== RESET ACTIONS =====
      resetBoard: () => {
        set({
          metadata: null,
          lists: {},
          tasks: {},
          members: {},
          settings: {},
          loading: {
            board: false,
            tasks: false,
            lists: false,
            members: false
          },
          errors: {
            board: null,
            tasks: null,
            lists: null,
            members: null
          },
          selectedTasks: new Set(),
          dragState: {
            isDragging: false,
            draggedTaskId: null,
            sourceListId: null
          }
        });
      }
    })),
    {
      name: `Board Store - ${boardId}`
    }
  )
);

// Store registry to manage multiple board stores
const boardStores = new Map();

export const getBoardStore = (boardId) => {
  if (!boardStores.has(boardId)) {
    boardStores.set(boardId, createBoardStore(boardId));
  }
  return boardStores.get(boardId);
};

export const removeBoardStore = (boardId) => {
  boardStores.delete(boardId);
};

export const clearAllBoardStores = () => {
  boardStores.clear();
};

export default getBoardStore;
