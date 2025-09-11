import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';

const TaskCommentModal = ({ open, onClose, task, boardId, listId, onTaskUpdate }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (task && task.comments) {
      setComments(task.comments || []);
    }
  }, [task]);

  const handleAddComment = async () => {
    if (!comment.trim() || !currentUser) return;

    setLoading(true);
    try {
      const newComment = {
        id: Date.now().toString(),
        text: comment.trim(),
        author: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedComments = [...comments, newComment];
      const updatedTask = {
        ...task,
        comments: updatedComments,
        lastCommentAt: new Date().toISOString()
      };

      // Update in Firebase
      const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
      const boardDoc = await getDoc(boardRef);
      
      if (boardDoc.exists()) {
        const boardData = boardDoc.data();
        const updatedTasks = { ...boardData.tasks };
        
        if (updatedTasks[listId]) {
          const taskIndex = updatedTasks[listId].findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            updatedTasks[listId][taskIndex] = updatedTask;
          }
        }

        await updateDoc(boardRef, {
          tasks: updatedTasks,
          updatedAt: new Date().toISOString()
        });

        setComments(updatedComments);
        setComment('');
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CommentIcon />
          Comments for "{task?.text}"
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Task Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Task: {task?.text}
          </Typography>
          {task?.priority && (
            <Chip 
              label={task.priority} 
              size="small" 
              color={
                task.priority === 'urgent' ? 'error' :
                task.priority === 'high' ? 'warning' :
                task.priority === 'medium' ? 'info' : 'default'
              }
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {/* Comments List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
          {comments.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            <List>
              {comments.map((commentItem, index) => (
                <React.Fragment key={commentItem.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(commentItem.author.displayName)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">
                            {commentItem.author.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(commentItem.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {commentItem.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Add Comment */}
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            size="small"
          />
          <IconButton
            onClick={handleAddComment}
            disabled={!comment.trim() || loading}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskCommentModal;
