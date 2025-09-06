import { useState } from 'react';
import { Paper, Typography, Box, IconButton, Card, CardContent, Menu, MenuItem, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BoardTab = ({ name, color = 'primary', onAddTask, tasks = [], onEditTask, onDeleteTask, onDeleteList, listId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [listMenuEl, setListMenuEl] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  
  const handleListMenuClick = (event) => {
    event.stopPropagation();
    setListMenuEl(event.currentTarget);
  };
  
  const handleListMenuClose = () => {
    setListMenuEl(null);
  };
  
  const handleDeleteList = () => {
    if (window.confirm(`Are you sure you want to delete the list "${name}"?`)) {
      onDeleteList(listId);
    }
    handleListMenuClose();
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
      onEditTask(listId, { ...editingTask, text: editedText });
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (editingTask) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDeleteTask(listId, editingTask.id);
      }
    }
    handleMenuClose();
  };

  // Handle click outside when editing
  const handleClickOutsideEdit = (e) => {
    if (editingTask && !e.target.closest('.task-edit-input')) {
      handleEdit();
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
          <Typography 
            variant="h6" 
            color={`${color}.main`}
            sx={{ fontWeight: 'bold', flexGrow: 1 }}
          >
            {name}
          </Typography>
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
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            sx={{ 
              mb: 1,
              cursor: 'grab',
              '&:hover': { boxShadow: 2 },
              borderLeft: `4px solid ${theme => theme.palette[color]?.main || theme.palette.primary.main}`,
              position: 'relative',
            }}
            draggable
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
                    sx={{ flexGrow: 1, cursor: 'text' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                      setEditedText(task.text);
                    }}
                  >
                    {task.text}
                  </Typography>
                )}
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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {new Date(task.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
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
        <MenuItem onClick={handleDelete}>
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
        <MenuItem onClick={handleDeleteList}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete List
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BoardTab;