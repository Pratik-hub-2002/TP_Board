/**
 * TP Board Data Models
 * Comprehensive type definitions for clean data handling
 */

// ===== ENUMS =====
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress', 
  DONE: 'done'
};

export const MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const NOTIFICATION_TYPES = {
  DEADLINE_WARNING: 'deadline_warning',
  DEADLINE_OVERDUE: 'deadline_overdue',
  TASK_ASSIGNED: 'task_assigned',
  BOARD_SHARED: 'board_shared',
  COMMENT_ADDED: 'comment_added'
};

// ===== CORE MODELS =====

/**
 * User Profile Model
 */
export const createUserProfile = (userData) => ({
  uid: userData.uid,
  email: userData.email,
  displayName: userData.displayName || '',
  photoURL: userData.photoURL || '',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      deadlineReminders: true
    },
    defaultBoardView: 'kanban'
  }
});

/**
 * Board Metadata Model
 */
export const createBoardMetadata = (boardData, ownerId, ownerEmail) => ({
  id: boardData.id || `board_${Date.now()}`,
  name: boardData.name || 'New Board',
  description: boardData.description || '',
  owner: ownerId,
  ownerEmail: ownerEmail,
  isPublic: boardData.isPublic || false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastActivity: new Date().toISOString(),
  tags: boardData.tags || [],
  color: boardData.color || 'primary',
  archived: false
});

/**
 * List Model (formerly tabs)
 */
export const createList = (listData) => ({
  id: listData.id || `list_${Date.now()}`,
  name: listData.name,
  color: listData.color || 'primary',
  position: listData.position || 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  archived: false,
  taskCount: 0
});

/**
 * Task Model
 */
export const createTask = (taskData, listId) => ({
  id: taskData.id || `task_${Date.now()}`,
  text: taskData.text,
  description: taskData.description || '',
  listId: listId,
  position: taskData.position || 0,
  priority: taskData.priority || PRIORITY_LEVELS.MEDIUM,
  deadline: taskData.deadline || null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: null,
  assignedTo: taskData.assignedTo || null,
  assignedBy: taskData.assignedBy || null,
  tags: taskData.tags || [],
  attachments: taskData.attachments || [],
  comments: taskData.comments || [],
  subtasks: taskData.subtasks || [],
  estimatedHours: taskData.estimatedHours || null,
  actualHours: taskData.actualHours || null,
  archived: false
});

/**
 * Member Model
 */
export const createMember = (email, role = MEMBER_ROLES.MEMBER, invitedBy) => ({
  email: email,
  role: role,
  joinedAt: new Date().toISOString(),
  invitedBy: invitedBy,
  status: 'active', // active, pending, inactive
  permissions: getMemberPermissions(role),
  lastActivity: new Date().toISOString()
});

/**
 * Board Settings Model
 */
export const createBoardSettings = (settings = {}) => ({
  allowComments: settings.allowComments !== false,
  allowTaskCreation: settings.allowTaskCreation !== false,
  allowMemberInvites: settings.allowMemberInvites !== false,
  requireApprovalForTasks: settings.requireApprovalForTasks || false,
  enableDeadlineNotifications: settings.enableDeadlineNotifications !== false,
  enableEmailNotifications: settings.enableEmailNotifications !== false,
  autoArchiveCompletedTasks: settings.autoArchiveCompletedTasks || false,
  taskTemplate: settings.taskTemplate || null,
  workingHours: settings.workingHours || {
    start: '09:00',
    end: '17:00',
    timezone: 'UTC'
  }
});

/**
 * Comment Model
 */
export const createComment = (commentData, authorId, authorEmail) => ({
  id: commentData.id || `comment_${Date.now()}`,
  text: commentData.text,
  authorId: authorId,
  authorEmail: authorEmail,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  edited: false,
  mentions: commentData.mentions || [],
  attachments: commentData.attachments || []
});

/**
 * Notification Model
 */
export const createNotification = (type, message, targetUserId, metadata = {}) => ({
  id: `notification_${Date.now()}`,
  type: type,
  message: message,
  targetUserId: targetUserId,
  isRead: false,
  createdAt: new Date().toISOString(),
  metadata: metadata,
  expiresAt: metadata.expiresAt || null
});

// ===== HELPER FUNCTIONS =====

/**
 * Get member permissions based on role
 */
export const getMemberPermissions = (role) => {
  const permissions = {
    canViewBoard: true,
    canCreateTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canCreateLists: false,
    canEditLists: false,
    canDeleteLists: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditBoardSettings: false,
    canDeleteBoard: false,
    canArchiveBoard: false
  };

  switch (role) {
    case MEMBER_ROLES.OWNER:
      return Object.keys(permissions).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
    
    case MEMBER_ROLES.ADMIN:
      return {
        ...permissions,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canCreateLists: true,
        canEditLists: true,
        canDeleteLists: true,
        canInviteMembers: true,
        canEditBoardSettings: true
      };
    
    case MEMBER_ROLES.MEMBER:
      return {
        ...permissions,
        canCreateTasks: true,
        canEditTasks: true,
        canCreateLists: true
      };
    
    case MEMBER_ROLES.VIEWER:
    default:
      return permissions;
  }
};

/**
 * Validate task data
 */
export const validateTask = (taskData) => {
  const errors = [];
  
  if (!taskData.text || taskData.text.trim().length === 0) {
    errors.push('Task text is required');
  }
  
  if (taskData.text && taskData.text.length > 500) {
    errors.push('Task text must be less than 500 characters');
  }
  
  if (taskData.priority && !Object.values(PRIORITY_LEVELS).includes(taskData.priority)) {
    errors.push('Invalid priority level');
  }
  
  if (taskData.deadline && new Date(taskData.deadline) < new Date()) {
    errors.push('Deadline cannot be in the past');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate task urgency for notifications
 */
export const calculateTaskUrgency = (task) => {
  if (!task.deadline) return null;
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
  
  if (hoursUntilDeadline < 0) {
    return { level: 'overdue', hoursOverdue: Math.abs(hoursUntilDeadline) };
  } else if (hoursUntilDeadline <= 2) {
    return { level: 'critical', hoursRemaining: hoursUntilDeadline };
  } else if (hoursUntilDeadline <= 24) {
    return { level: 'urgent', hoursRemaining: hoursUntilDeadline };
  } else if (hoursUntilDeadline <= 72) {
    return { level: 'warning', hoursRemaining: hoursUntilDeadline };
  }
  
  return { level: 'normal', hoursRemaining: hoursUntilDeadline };
};

/**
 * Generate board analytics
 */
export const generateBoardAnalytics = (board, tasks, lists) => {
  const taskArray = Object.values(tasks);
  const listArray = Object.values(lists);
  
  return {
    totalTasks: taskArray.length,
    completedTasks: taskArray.filter(task => task.listId === 'done').length,
    overdueTasks: taskArray.filter(task => {
      if (!task.deadline) return false;
      return new Date(task.deadline) < new Date() && task.listId !== 'done';
    }).length,
    totalLists: listArray.length,
    tasksByPriority: {
      urgent: taskArray.filter(task => task.priority === PRIORITY_LEVELS.URGENT).length,
      high: taskArray.filter(task => task.priority === PRIORITY_LEVELS.HIGH).length,
      medium: taskArray.filter(task => task.priority === PRIORITY_LEVELS.MEDIUM).length,
      low: taskArray.filter(task => task.priority === PRIORITY_LEVELS.LOW).length
    },
    completionRate: taskArray.length > 0 ? 
      (taskArray.filter(task => task.listId === 'done').length / taskArray.length * 100).toFixed(1) : 0,
    lastActivity: board.lastActivity
  };
};
