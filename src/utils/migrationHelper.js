/**
 * Migration Helper for TP Board Data Structure
 * Helps transition from old nested structure to new normalized structure
 */

import { 
  createBoardMetadata, 
  createList, 
  createTask, 
  createMember,
  createBoardSettings 
} from '../types/dataModels';

/**
 * Migrate old board structure to new normalized structure
 */
export const migrateBoardData = (oldBoardData, userId, userEmail) => {
  console.log('🔄 Starting board migration for:', oldBoardData.name);
  
  try {
    // 1. Create new metadata structure
    const metadata = createBoardMetadata({
      id: oldBoardData.id,
      name: oldBoardData.name || 'Migrated Board',
      description: oldBoardData.description || '',
      isPublic: oldBoardData.isPublic || false,
      tags: oldBoardData.tags || [],
      color: oldBoardData.color || 'primary'
    }, userId, userEmail);

    // 2. Migrate tabs to lists
    const lists = {};
    if (oldBoardData.tabs) {
      Object.entries(oldBoardData.tabs).forEach(([tabId, tab]) => {
        if (tab && tab.name) {
          lists[tabId] = createList({
            id: tabId,
            name: tab.name,
            color: tab.color || 'primary',
            position: Object.keys(lists).length
          });
        }
      });
    } else {
      // Create default lists if none exist
      lists['todo'] = createList({ id: 'todo', name: 'To Do', color: 'primary', position: 0 });
      lists['inprogress'] = createList({ id: 'inprogress', name: 'In Progress', color: 'warning', position: 1 });
      lists['done'] = createList({ id: 'done', name: 'Done', color: 'success', position: 2 });
    }

    // 3. Migrate tasks to normalized structure
    const tasks = {};
    if (oldBoardData.tasks) {
      Object.entries(oldBoardData.tasks).forEach(([listId, taskArray]) => {
        if (Array.isArray(taskArray)) {
          taskArray.forEach((oldTask, index) => {
            if (oldTask && oldTask.text) {
              const taskId = oldTask.id || `task_${Date.now()}_${index}`;
              tasks[taskId] = createTask({
                id: taskId,
                text: oldTask.text,
                description: oldTask.description || '',
                priority: oldTask.priority || 'medium',
                deadline: oldTask.deadline || null,
                position: index,
                // Preserve existing timestamps if available
                createdAt: oldTask.createdAt || new Date().toISOString(),
                updatedAt: oldTask.updatedAt || new Date().toISOString(),
                completedAt: listId === 'done' ? (oldTask.completedAt || new Date().toISOString()) : null,
                assignedTo: oldTask.assignedTo || null,
                tags: oldTask.tags || []
              }, listId);
            }
          });
        }
      });
    }

    // 4. Migrate members
    const members = {};
    if (oldBoardData.members) {
      Object.entries(oldBoardData.members).forEach(([email, member]) => {
        members[email] = createMember(
          email,
          member.role || 'member',
          member.invitedBy || userId
        );
      });
    } else {
      // Add current user as owner
      members[userEmail] = createMember(userEmail, 'owner', userId);
    }

    // 5. Migrate settings
    const settings = createBoardSettings({
      allowComments: oldBoardData.settings?.allowComments !== false,
      allowTaskCreation: oldBoardData.settings?.allowTaskCreation !== false,
      allowMemberInvites: oldBoardData.settings?.allowMemberInvites !== false,
      enableDeadlineNotifications: oldBoardData.settings?.enableDeadlineNotifications !== false,
      enableEmailNotifications: oldBoardData.settings?.enableEmailNotifications !== false
    });

    const migratedData = {
      metadata,
      lists,
      tasks,
      members,
      settings
    };

    console.log('✅ Board migration completed successfully');
    console.log(`📊 Migration stats:
      - Lists: ${Object.keys(lists).length}
      - Tasks: ${Object.keys(tasks).length}
      - Members: ${Object.keys(members).length}`);

    return {
      success: true,
      data: migratedData,
      stats: {
        listsCount: Object.keys(lists).length,
        tasksCount: Object.keys(tasks).length,
        membersCount: Object.keys(members).length
      }
    };

  } catch (error) {
    console.error('❌ Board migration failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Validate migrated data structure
 */
export const validateMigratedData = (migratedData) => {
  const errors = [];

  // Check required fields
  if (!migratedData.metadata) {
    errors.push('Missing metadata');
  }

  if (!migratedData.lists || Object.keys(migratedData.lists).length === 0) {
    errors.push('No lists found');
  }

  if (!migratedData.members || Object.keys(migratedData.members).length === 0) {
    errors.push('No members found');
  }

  // Validate tasks reference valid lists
  if (migratedData.tasks) {
    Object.values(migratedData.tasks).forEach(task => {
      if (!migratedData.lists[task.listId]) {
        errors.push(`Task ${task.id} references non-existent list ${task.listId}`);
      }
    });
  }

  // Check for owner
  const hasOwner = Object.values(migratedData.members || {}).some(member => member.role === 'owner');
  if (!hasOwner) {
    errors.push('No owner found in members');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create backup of original data before migration
 */
export const createBackup = (originalData) => {
  const backup = {
    data: JSON.parse(JSON.stringify(originalData)),
    timestamp: new Date().toISOString(),
    version: '1.0'
  };

  // Store in localStorage as fallback
  try {
    localStorage.setItem(`tp_board_backup_${originalData.id}`, JSON.stringify(backup));
    console.log('✅ Backup created in localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to create localStorage backup:', error);
  }

  return backup;
};

/**
 * Restore from backup if migration fails
 */
export const restoreFromBackup = (boardId) => {
  try {
    const backupData = localStorage.getItem(`tp_board_backup_${boardId}`);
    if (backupData) {
      const backup = JSON.parse(backupData);
      console.log('🔄 Restoring from backup created at:', backup.timestamp);
      return {
        success: true,
        data: backup.data
      };
    } else {
      return {
        success: false,
        error: 'No backup found'
      };
    }
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Batch migrate multiple boards
 */
export const batchMigrateBoards = async (boards, userId, userEmail, onProgress) => {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < boards.length; i++) {
    const board = boards[i];
    
    try {
      // Create backup
      createBackup(board);
      
      // Migrate
      const result = migrateBoardData(board, userId, userEmail);
      
      if (result.success) {
        successCount++;
        console.log(`✅ Migrated board: ${board.name}`);
      } else {
        failureCount++;
        console.error(`❌ Failed to migrate board: ${board.name}`, result.error);
      }
      
      results.push({
        boardId: board.id,
        boardName: board.name,
        ...result
      });

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: boards.length,
          successCount,
          failureCount,
          currentBoard: board.name
        });
      }

    } catch (error) {
      failureCount++;
      results.push({
        boardId: board.id,
        boardName: board.name,
        success: false,
        error: error.message
      });
    }
  }

  return {
    results,
    summary: {
      total: boards.length,
      successful: successCount,
      failed: failureCount,
      successRate: Math.round((successCount / boards.length) * 100)
    }
  };
};

/**
 * Generate migration report
 */
export const generateMigrationReport = (migrationResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: migrationResults.summary,
    details: migrationResults.results,
    recommendations: []
  };

  // Add recommendations based on results
  if (migrationResults.summary.failed > 0) {
    report.recommendations.push('Review failed migrations and check data integrity');
  }

  if (migrationResults.summary.successRate < 100) {
    report.recommendations.push('Consider manual review of partially migrated boards');
  }

  report.recommendations.push('Test all migrated boards thoroughly before removing backups');
  report.recommendations.push('Update Firestore security rules for production use');

  return report;
};

/**
 * Clean up migration artifacts
 */
export const cleanupMigration = (boardIds) => {
  let cleanedCount = 0;
  
  boardIds.forEach(boardId => {
    try {
      localStorage.removeItem(`tp_board_backup_${boardId}`);
      cleanedCount++;
    } catch (error) {
      console.warn(`Failed to cleanup backup for board ${boardId}:`, error);
    }
  });

  console.log(`🧹 Cleaned up ${cleanedCount} migration backups`);
  return cleanedCount;
};
