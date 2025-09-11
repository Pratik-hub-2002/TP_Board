import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  AppBar, 
  Toolbar, 
  Stack,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import BoardShareModal from '../../components/layout/BoardShareModal';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import useStore from '../../store';

const BoardTopbar = ({ board, onBoardUpdate }) => {
  const navigate = useNavigate();
  const setToastrMsg = useStore(state => state.setToastrMsg);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedBoardName, setEditedBoardName] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [boardMembers, setBoardMembers] = useState({});

  const handleBack = () => {
    navigate('/boards');
  };

  const handleEditBoard = () => {
    setEditedBoardName(board?.name || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editedBoardName.trim() && board) {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setToastrMsg('User not authenticated');
          return;
        }
        
        await updateDoc(doc(db, `users/${currentUser.uid}/boards`, board.id), {
          name: editedBoardName.trim()
        });
        
        setToastrMsg('Board name updated successfully');
        if (onBoardUpdate) {
          onBoardUpdate({ ...board, name: editedBoardName.trim() });
        }
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error('Error updating board name:', error);
        setToastrMsg('Failed to update board name');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the board "${board?.name}"?`)) {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setToastrMsg('User not authenticated');
          return;
        }
        
        await deleteDoc(doc(db, `users/${currentUser.uid}/boards`, board.id));
        setToastrMsg('Board deleted successfully');
        navigate('/boards');
      } catch (error) {
        console.error('Error deleting board:', error);
        setToastrMsg('Failed to delete board');
      }
    }
  };

  const handleShareBoard = () => {
    setBoardMembers(board?.members || {});
    setIsShareModalOpen(true);
  };

  const handleMembersUpdate = (updatedMembers) => {
    setBoardMembers(updatedMembers);
    if (onBoardUpdate) {
      onBoardUpdate({ ...board, members: updatedMembers });
    }
  };

  return (
    <AppBar position="fixed" sx={{ borderBottom: "5px solid", borderColor: "white" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack spacing={1} alignItems="center" direction="row">
          <Tooltip title="Back to Boards">
            <IconButton onClick={handleBack} color="inherit">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" noWrap>
            {board?.name || 'Loading...'}
          </Typography>
        </Stack>
        
        {board && (
          <Stack spacing={2} alignItems="center" direction="row">
            <Tooltip title="Share Board">
              <IconButton onClick={handleShareBoard} color="inherit">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Board Name">
              <IconButton onClick={handleEditBoard} color="inherit">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Board">
              <IconButton onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Toolbar>
      
      {/* Edit Board Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Board Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            fullWidth
            variant="outlined"
            value={editedBoardName}
            onChange={(e) => setEditedBoardName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={!editedBoardName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Board Share Modal */}
      <BoardShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        boardId={board?.id}
        boardName={board?.name}
        currentMembers={boardMembers}
        onMembersUpdate={handleMembersUpdate}
      />
    </AppBar>
  );
};

export default BoardTopbar;
