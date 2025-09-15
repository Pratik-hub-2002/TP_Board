/**
 * Test Suite for TP Board Data Architecture
 * Comprehensive tests for data models, helpers, and store operations
 */

import { 
  createTask, 
  createList, 
  createBoardMetadata,
  validateTask,
  calculateTaskUrgency,
  PRIORITY_LEVELS,
  TASK_STATUS 
} from '../types/dataModels';

import {
  addTaskToList,
  moveTask,
  updateTaskInList,
  deleteTaskFromList,
  addNewList,
  deleteList,
  calculateBoardStats,
  searchTasks
} from '../utils/dataHelpers';

import { migrateBoardData, validateMigratedData } from '../utils/migrationHelper';

// Mock data for testing
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com'
};

const mockTaskData = {
  text: 'Test task',
  priority: PRIORITY_LEVELS.HIGH,
  deadline: new Date(Date.now() + 86400000).toISOString() // Tomorrow
};

const mockListData = {
  name: 'Test List',
  color: 'primary'
};

const mockOldBoardData = {
  id: 'old-board-123',
  name: 'Old Board',
  tabs: {
    'todo': { id: 'todo', name: 'To Do', color: 'primary' },
    'done': { id: 'done', name: 'Done', color: 'success' }
  },
  tasks: {
    'todo': [
      { id: 'task-1', text: 'Old task 1', priority: 'high' },
      { id: 'task-2', text: 'Old task 2', priority: 'medium' }
    ],
    'done': [
      { id: 'task-3', text: 'Completed task', priority: 'low' }
    ]
  }
};

describe('Data Models', () => {
  test('createTask should create valid task object', () => {
    const task = createTask(mockTaskData, 'todo');
    
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('text', 'Test task');
    expect(task).toHaveProperty('listId', 'todo');
    expect(task).toHaveProperty('priority', PRIORITY_LEVELS.HIGH);
    expect(task).toHaveProperty('createdAt');
    expect(task).toHaveProperty('updatedAt');
    expect(typeof task.id).toBe('string');
    expect(task.id).toMatch(/^task_\d+$/);
  });

  test('createList should create valid list object', () => {
    const list = createList(mockListData);
    
    expect(list).toHaveProperty('id');
    expect(list).toHaveProperty('name', 'Test List');
    expect(list).toHaveProperty('color', 'primary');
    expect(list).toHaveProperty('position', 0);
    expect(list).toHaveProperty('createdAt');
    expect(list).toHaveProperty('archived', false);
  });

  test('createBoardMetadata should create valid board metadata', () => {
    const metadata = createBoardMetadata(
      { name: 'Test Board', description: 'Test Description' },
      mockUser.uid,
      mockUser.email
    );
    
    expect(metadata).toHaveProperty('name', 'Test Board');
    expect(metadata).toHaveProperty('description', 'Test Description');
    expect(metadata).toHaveProperty('owner', mockUser.uid);
    expect(metadata).toHaveProperty('ownerEmail', mockUser.email);
    expect(metadata).toHaveProperty('createdAt');
    expect(metadata).toHaveProperty('isPublic', false);
  });

  test('validateTask should validate task data correctly', () => {
    const validTask = { text: 'Valid task', priority: PRIORITY_LEVELS.MEDIUM };
    const invalidTask = { text: '', priority: 'invalid' };
    
    const validResult = validateTask(validTask);
    const invalidResult = validateTask(invalidTask);
    
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);
    
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test('calculateTaskUrgency should calculate urgency correctly', () => {
    const now = new Date();
    const overdue = new Date(now.getTime() - 3600000); // 1 hour ago
    const critical = new Date(now.getTime() + 3600000); // 1 hour from now
    const normal = new Date(now.getTime() + 86400000 * 7); // 1 week from now
    
    const overdueTask = { deadline: overdue.toISOString() };
    const criticalTask = { deadline: critical.toISOString() };
    const normalTask = { deadline: normal.toISOString() };
    const noDeadlineTask = {};
    
    expect(calculateTaskUrgency(overdueTask).level).toBe('overdue');
    expect(calculateTaskUrgency(criticalTask).level).toBe('critical');
    expect(calculateTaskUrgency(normalTask).level).toBe('normal');
    expect(calculateTaskUrgency(noDeadlineTask)).toBeNull();
  });
});

describe('Data Helpers', () => {
  let testTasks = {};
  let testLists = {};

  beforeEach(() => {
    testTasks = {
      'todo': [
        createTask({ text: 'Task 1', priority: PRIORITY_LEVELS.HIGH }, 'todo'),
        createTask({ text: 'Task 2', priority: PRIORITY_LEVELS.MEDIUM }, 'todo')
      ],
      'done': [
        createTask({ text: 'Completed Task', priority: PRIORITY_LEVELS.LOW }, 'done')
      ]
    };

    testLists = {
      'todo': createList({ name: 'To Do', color: 'primary' }),
      'done': createList({ name: 'Done', color: 'success' })
    };
  });

  test('addTaskToList should add task to correct list', () => {
    const newTaskData = { text: 'New Task', priority: PRIORITY_LEVELS.URGENT };
    const result = addTaskToList(testTasks, 'todo', newTaskData);
    
    expect(result.todo).toHaveLength(3);
    expect(result.todo[2].text).toBe('New Task');
    expect(result.todo[2].listId).toBe('todo');
  });

  test('moveTask should move task between lists', () => {
    const taskToMove = testTasks.todo[0];
    const result = moveTask(testTasks, taskToMove.id, 'todo', 'done', 0);
    
    expect(result.todo).toHaveLength(1);
    expect(result.done).toHaveLength(2);
    expect(result.done[0].id).toBe(taskToMove.id);
    expect(result.done[0].listId).toBe('done');
  });

  test('updateTaskInList should update task properties', () => {
    const taskToUpdate = testTasks.todo[0];
    const updates = { text: 'Updated Task', priority: PRIORITY_LEVELS.LOW };
    const result = updateTaskInList(testTasks, 'todo', taskToUpdate.id, updates);
    
    const updatedTask = result.todo.find(task => task.id === taskToUpdate.id);
    expect(updatedTask.text).toBe('Updated Task');
    expect(updatedTask.priority).toBe(PRIORITY_LEVELS.LOW);
    expect(updatedTask.updatedAt).toBeDefined();
  });

  test('deleteTaskFromList should remove task from list', () => {
    const taskToDelete = testTasks.todo[0];
    const result = deleteTaskFromList(testTasks, 'todo', taskToDelete.id);
    
    expect(result.todo).toHaveLength(1);
    expect(result.todo.find(task => task.id === taskToDelete.id)).toBeUndefined();
  });

  test('addNewList should create new list', () => {
    const newListData = { name: 'In Progress', color: 'warning' };
    const result = addNewList(testLists, newListData);
    
    expect(Object.keys(result)).toHaveLength(3);
    const newList = Object.values(result).find(list => list.name === 'In Progress');
    expect(newList).toBeDefined();
    expect(newList.color).toBe('warning');
  });

  test('deleteList should remove list and handle tasks', () => {
    const result = deleteList(testLists, testTasks, 'todo', 'done');
    
    expect(result.lists.todo).toBeUndefined();
    expect(result.tasks.todo).toBeUndefined();
    expect(result.tasks.done).toHaveLength(3); // Original 1 + moved 2
  });

  test('calculateBoardStats should generate correct statistics', () => {
    const stats = calculateBoardStats(testLists, testTasks);
    
    expect(stats.totalLists).toBe(2);
    expect(stats.totalTasks).toBe(3);
    expect(stats.completedTasks).toBe(1);
    expect(stats.completionRate).toBe(33);
    expect(stats.tasksByPriority.high).toBe(1);
    expect(stats.tasksByPriority.medium).toBe(1);
    expect(stats.tasksByPriority.low).toBe(1);
  });

  test('searchTasks should filter tasks correctly', () => {
    const allTasks = Object.values(testTasks).flat();
    const searchResults = searchTasks({ allTasks }, 'Task 1');
    
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].text).toBe('Task 1');
  });
});

describe('Migration Helper', () => {
  test('migrateBoardData should convert old structure to new', () => {
    const result = migrateBoardData(mockOldBoardData, mockUser.uid, mockUser.email);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('metadata');
    expect(result.data).toHaveProperty('lists');
    expect(result.data).toHaveProperty('tasks');
    expect(result.data).toHaveProperty('members');
    expect(result.data).toHaveProperty('settings');
    
    // Check lists migration
    expect(Object.keys(result.data.lists)).toHaveLength(2);
    expect(result.data.lists.todo.name).toBe('To Do');
    
    // Check tasks migration
    expect(Object.keys(result.data.tasks)).toHaveLength(3);
    const todoTasks = Object.values(result.data.tasks).filter(task => task.listId === 'todo');
    expect(todoTasks).toHaveLength(2);
    
    // Check members
    expect(result.data.members[mockUser.email]).toBeDefined();
    expect(result.data.members[mockUser.email].role).toBe('owner');
  });

  test('validateMigratedData should validate structure correctly', () => {
    const validData = {
      metadata: { name: 'Test Board' },
      lists: { 'todo': { id: 'todo', name: 'To Do' } },
      tasks: { 'task-1': { id: 'task-1', listId: 'todo', text: 'Test' } },
      members: { 'test@example.com': { role: 'owner', email: 'test@example.com' } },
      settings: {}
    };
    
    const invalidData = {
      metadata: null,
      lists: {},
      tasks: {},
      members: {},
      settings: {}
    };
    
    const validResult = validateMigratedData(validData);
    const invalidResult = validateMigratedData(invalidData);
    
    expect(validResult.isValid).toBe(true);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});

describe('Error Handling', () => {
  test('should handle invalid task data gracefully', () => {
    expect(() => {
      addTaskToList({}, 'todo', { text: '' });
    }).toThrow();
  });

  test('should handle non-existent task operations gracefully', () => {
    expect(() => {
      updateTaskInList({}, 'todo', 'non-existent-id', { text: 'Updated' });
    }).toThrow();
  });

  test('should handle non-existent list operations gracefully', () => {
    expect(() => {
      deleteList({}, {}, 'non-existent-list');
    }).toThrow();
  });
});

describe('Performance Tests', () => {
  test('should handle large datasets efficiently', () => {
    // Create large dataset
    const largeTasks = {};
    const largeTaskCount = 1000;
    
    for (let i = 0; i < largeTaskCount; i++) {
      const listId = i % 3 === 0 ? 'todo' : i % 3 === 1 ? 'inprogress' : 'done';
      if (!largeTasks[listId]) largeTasks[listId] = [];
      largeTasks[listId].push(createTask({
        text: `Task ${i}`,
        priority: Object.values(PRIORITY_LEVELS)[i % 4]
      }, listId));
    }
    
    const startTime = performance.now();
    const stats = calculateBoardStats({}, largeTasks);
    const endTime = performance.now();
    
    expect(stats.totalTasks).toBe(largeTaskCount);
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
  });
});

// Mock console methods to avoid noise in tests
beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  };
});

// Cleanup after tests
afterAll(() => {
  jest.restoreAllMocks();
});
