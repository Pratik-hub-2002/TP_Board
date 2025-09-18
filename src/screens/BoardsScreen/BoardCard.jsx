import { Stack, Grid, Typography, IconButton, Box, Tooltip, Menu, MenuItem } from '@mui/material';
import OpenIcon from '@mui/icons-material/Launch';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme';
import useStore from '../../store';
import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const BoardCard = ({ name, color, createdAt, id }) => {
  const navigate = useNavigate();
  const { setToastrMsg, boards, setBoards } = useStore();
  const [anchorEl, setAnchorEl] = useState(null);
  
  if (!id) return null;
  
  const boardColor = colors[color] || colors[0];
  const boardName = name || 'Untitled Board';
  const createdDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
  
  const handleOpenBoard = (e) => {
    e.stopPropagation();
    navigate(`/board/${id}`);
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    handleOpenBoard(e);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteBoard = async () => {
    if (window.confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)) {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setToastrMsg('User not authenticated');
          return;
        }

        // Delete from Firestore
        const boardRef = doc(db, `users/${currentUser.uid}/boards`, id);
        await deleteDoc(boardRef);

        // Update local state
        const updatedBoards = boards.filter(board => board.id !== id);
        setBoards(updatedBoards);

        setToastrMsg('Board deleted successfully');
      } catch (error) {
        console.error('Error deleting board:', error);
        setToastrMsg('Failed to delete board');
      }
    }
    handleMenuClose();
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Stack 
        p={{ xs: 1.5, sm: 2 }} 
        minHeight="120px"
        bgcolor="background.paper"
        borderRadius={1}
        boxShadow={1}
        sx={{ 
          borderLeft: `5px solid ${boardColor}`,
          cursor: 'pointer', 
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: 3,
          }
        }}
        onClick={handleClick}
      > 
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box width="80%">
            <Typography 
              variant="h6"
              fontWeight={500}
              noWrap
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                color: 'text.primary',
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {boardName}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.5,
              }}
            >
              Created: {createdDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Open board">
              <IconButton 
                onClick={handleOpenBoard} 
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <OpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Board options">
              <IconButton 
                onClick={handleMenuClick} 
                size="small"
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Stack>
      
      {/* Board Options Menu */}
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
        <MenuItem onClick={handleDeleteBoard}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Board
        </MenuItem>
      </Menu>
    </Grid>
  )
}

export default BoardCard;
