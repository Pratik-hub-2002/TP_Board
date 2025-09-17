import { useState } from 'react';
import { Paper, Typography, Box, IconButton, Card, CardContent, Menu, MenuItem, Tooltip, Chip, Alert, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import { Draggable } from '@hello-pangea/dnd';
import { formatDistanceToNow, isPast, isWithinInterval, subDays } from 'date-fns';
import TaskCommentModal from '../../components/layout/TaskCommentModal';

const BoardTab = ({ name, color = 'primary', onAddTask, tasks = [], onEditTask, onDeleteTask, onDeleteList, onEditList, listId, isDragOver, boardId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [listMenuEl, setListMenuEl] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingListName, setEditingListName] = useState(false);
  const [editedListName, setEditedListName] = useState(name);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'list' | 'task', data: {} }

  const handleListMenuClick = (event) => {
    event.stopPropagation();
    setListMenuEl(event.currentTarget);
  };

  
  const handleListMenuClose = () => {
    setListMenuEl(null);
  };
  
  const handleOpenConfirmDialog = (type, data) => {
    setItemToDelete({ type, data });
    setConfirmDialogOpen(true);
    handleListMenuClose();
    handleMenuClose();
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'list') {
      onDeleteList(itemToDelete.data.id);
    } else if (itemToDelete.type === 'task') {
      onDeleteTask(listId, itemToDelete.data.id);
    }

    handleCloseConfirmDialog();
  };

  const handleEditListName = () => {
    setEditingListName(true);
    setEditedListName(name);
    handleListMenuClose();
  };

  const handleSaveListName = () => {
    if (editedListName.trim() && editedListName !== name) {
      onEditList(listId, { name: editedListName.trim() });
    }
    setEditingListName(false);
  };

  const handleCancelEditListName = () => {
    setEditingListName(false);
    setEditedListName(name);
  };

  const handleMenuClick = (event, task) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setEditingTask(task);
    setEditedText(task.text);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setEditingTask(null);
  };

  const handleEdit = () => {
    if (editingTask && editedText.trim()) {
      console.log('BoardTab: Calling onEditTask with:', listId, { ...editingTask, text: editedText });
      onEditTask(listId, { ...editingTask, text: editedText });
    }
    handleMenuClose();
  };


  const handleToggleComplete = (task) => {
    const updatedTask = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null
    };
    onEditTask(listId, updatedTask);
  };

  const handleOpenComments = (task) => {
    setSelectedTask(task);
    setCommentModalOpen(true);
    handleMenuClose();
  };

  const handleTaskUpdate = (updatedTask) => {
    onEditTask(listId, updatedTask);
  };

  // Handle click outside when editing
  const handleClickOutsideEdit = (e) => {
    if (editingTask && !e.target.closest('.task-edit-input')) {
      handleEdit();
    }
  };

  // Get deadline status for a task
  const getDeadlineStatus = (task) => {
    if (!task.deadline) return null;
    
    const deadline = new Date(task.deadline);
    const now = new Date();
    
    if (isPast(deadline)) {
      return { type: 'overdue', message: 'Overdue', color: 'error' };
    }
    
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    if (deadline <= oneDayFromNow) {
      return { type: 'urgent', message: 'Due in ' + formatDistanceToNow(deadline), color: 'error' };
    } else if (deadline <= twoDaysFromNow) {
      return { type: 'soon', message: 'Due in ' + formatDistanceToNow(deadline), color: 'warning' };
    }
    
    return { type: 'normal', message: 'Due ' + formatDistanceToNow(deadline, { addSuffix: true }), color: 'info' };
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {editingListName ? (
            <input
              type="text"
              value={editedListName}
              onChange={(e) => setEditedListName(e.target.value)}
              onBlur={handleSaveListName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveListName();
                } else if (e.key === 'Escape') {
                  handleCancelEditListName();
                }
              }}
              autoFocus
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                fontFamily: 'inherit',
                color: 'inherit',
                backgroundColor: 'transparent',
                flexGrow: 1,
              }}
            />
          ) : (
            <Typography 
              variant="h6" 
              color={`${color}.main`}
              sx={{ 
                fontWeight: 'bold', 
                flexGrow: 1,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={handleEditListName}
            >
              {name}
            </Typography>
          )}
          <IconButton 
            size="small" 
            onClick={handleListMenuClick}
            sx={{ color: 'text.secondary', ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        <IconButton onClick={onAddTask} size="small" sx={{ color: 'text.secondary' }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: '100px', 
        maxHeight: 'calc(100vh - 250px)',
        overflowY: 'auto',
        bgcolor: isDragOver ? 'action.hover' : 'transparent',
        borderRadius: 1,
        transition: 'background-color 0.2s ease',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme => theme.palette.grey[100],
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme => theme.palette.grey[400],
          borderRadius: '3px',
          '&:hover': {
            background: theme => theme.palette.grey[500],
          },
        },
      }}>
        {tasks.map((task, index) => {
          const deadlineStatus = getDeadlineStatus(task);
          return (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <Card 
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  sx={{ 
                    mb: 1,
                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    '&:hover': { boxShadow: 2 },
                    borderLeft: `4px solid ${theme => theme.palette[color]?.main || theme.palette.primary.main}`,
                    position: 'relative',
                    transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                    boxShadow: snapshot.isDragging ? 4 : 1,
                    bgcolor: deadlineStatus?.type === 'overdue' ? 'error.light' : 
                             deadlineStatus?.type === 'urgent' ? 'warning.light' : 'background.paper',
                    opacity: snapshot.isDragging ? 0.8 : 1,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="flex-start" sx={{ flexGrow: 1 }}>
                        <Checkbox
                          checked={task.completed || false}
                          onChange={() => handleToggleComplete(task)}
                          size="small"
                          sx={{ 
                            p: 0.5, 
                            mr: 1,
                            '& .MuiSvgIcon-root': { fontSize: 18 }
                          }}
                        />
                        {editingTask?.id === task.id ? (
                          <input
                            className="task-edit-input"
                            type="text"
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            onBlur={handleEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEdit();
                              } else if (e.key === 'Escape') {
                                setEditingTask(null);
                              }
                            }}
                            autoFocus
                            style={{
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              width: '100%',
                              fontSize: '0.875rem',
                              fontFamily: 'inherit',
                            }}
                          />
                        ) : (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flexGrow: 1, 
                              cursor: 'text',
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.7 : 1,
                              color: task.completed ? 'text.secondary' : 'text.primary'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                              setEditedText(task.text);
                            }}
                          >
                            {task.text}
                          </Typography>
                        )}
                      </Box>
                      <IconButton 
                        size="small" 
                        sx={{ p: 0.5, ml: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, task);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Priority and Deadline indicators */}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      {task.priority && task.priority !== 'medium' && (
                        <Chip 
                          size="small" 
                          label={task.priority.toUpperCase()} 
                          color={getPriorityColor(task.priority)}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                      {deadlineStatus && (
                        <Chip 
                          size="small" 
                          icon={deadlineStatus.type === 'overdue' ? <WarningIcon /> : <AccessTimeIcon />}
                          label={deadlineStatus.message}
                          color={deadlineStatus.color}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {new Date(task.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Draggable>
          );
        })}
        {tasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
            <Typography variant="caption">No tasks yet</Typography>
          </Box>
        )}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          setEditingTask(editingTask);
          setEditedText(editingTask?.text || '');
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleOpenComments(editingTask)}>
          <CommentIcon fontSize="small" sx={{ mr: 1 }} /> 
          Comments {editingTask?.comments?.length > 0 && `(${editingTask.comments.length})`}
        </MenuItem>
        <MenuItem onClick={() => handleOpenConfirmDialog('task', editingTask)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      
      {/* List Actions Menu */}
      <Menu
        anchorEl={listMenuEl}
        open={Boolean(listMenuEl)}
        onClose={handleListMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
            <MenuItem onClick={() => handleOpenConfirmDialog('list', { id: listId, name })}>

          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete List
        </MenuItem>
      </Menu>
      {/* Task Comment Modal */}
      <TaskCommentModal
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        task={selectedTask}
        boardId={boardId}
        listId={listId}
        onTaskUpdate={handleTaskUpdate}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.data?.name || itemToDelete?.data?.text}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default BoardTab;