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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const ROLES = {
  owner: { label: 'Owner', color: 'error', description: 'Full access - can delete board and manage users' },
  editor: { label: 'Editor', color: 'primary', description: 'Can edit tasks and board content' },
  viewer: { label: 'Viewer', color: 'default', description: 'Can only view board content' },
  commenter: { label: 'Commenter', color: 'secondary', description: 'Can view and comment on tasks' }
};

const BoardShareModal = ({ open, onClose, boardId, boardName, currentMembers = {}, onMembersUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleInviteUser = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (currentMembers[email]) {
      setError('User is already a member of this board');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // For now, we'll skip checking if user exists and just add them to members
      // In a production app, you'd want to implement proper user lookup
      let userId = null;

      // Update board members
      const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
      const boardDoc = await getDoc(boardRef);
      
      if (boardDoc.exists()) {
        const boardData = boardDoc.data();
        const updatedMembers = {
          ...boardData.members,
          [email.toLowerCase()]: {
            email: email.toLowerCase(),
            role: role,
            addedAt: new Date().toISOString(),
            addedBy: currentUser.uid,
            userId: userId,
            status: userId ? 'active' : 'pending' // pending if user doesn't exist yet
          }
        };

        await updateDoc(boardRef, {
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        });

        // Skip shared boards creation for now - will be implemented when user management is added

        onMembersUpdate(updatedMembers);
        setSuccess(`Successfully invited ${email} as ${ROLES[role].label}`);
        setEmail('');
        setRole('viewer');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      setError('Failed to invite user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (memberEmail === currentUser.email) {
      setError('You cannot remove yourself from the board');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
      const boardDoc = await getDoc(boardRef);
      
      if (boardDoc.exists()) {
        const boardData = boardDoc.data();
        const updatedMembers = { ...boardData.members };
        delete updatedMembers[memberEmail];

        await updateDoc(boardRef, {
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        });

        // Skip shared boards cleanup for now

        onMembersUpdate(updatedMembers);
        setSuccess(`Removed ${memberEmail} from the board`);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberEmail, newRole) => {
    if (memberEmail === currentUser.email && newRole !== 'owner') {
      setError('You cannot change your own role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
      const boardDoc = await getDoc(boardRef);
      
      if (boardDoc.exists()) {
        const boardData = boardDoc.data();
        const updatedMembers = {
          ...boardData.members,
          [memberEmail]: {
            ...boardData.members[memberEmail],
            role: newRole,
            updatedAt: new Date().toISOString()
          }
        };

        await updateDoc(boardRef, {
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        });

        // Skip shared boards role update for now

        onMembersUpdate(updatedMembers);
        setSuccess(`Updated ${memberEmail}'s role to ${ROLES[newRole].label}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('viewer');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon />
          Share "{boardName}"
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Invite new user */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Invite New Member</Typography>
          <Box display="flex" gap={2} alignItems="flex-end">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              disabled={loading}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
                disabled={loading}
              >
                {Object.entries(ROLES).filter(([key]) => key !== 'owner').map(([key, roleInfo]) => (
                  <MenuItem key={key} value={key}>
                    {roleInfo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleInviteUser}
              disabled={loading || !email.trim()}
              startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
            >
              Invite
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {ROLES[role]?.description}
          </Typography>
        </Box>

        {/* Current members */}
        <Typography variant="h6" gutterBottom>Current Members</Typography>
        <List>
          {/* Owner (current user) */}
          <ListItem>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {currentUser.email}
                  <Chip 
                    label="Owner" 
                    color="error" 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    (You)
                  </Typography>
                </Box>
              }
              secondary="Full access - can delete board and manage users"
            />
          </ListItem>

          {/* Other members */}
          {Object.entries(currentMembers).map(([email, member]) => (
            <ListItem key={email}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {email}
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={member.role}
                        onChange={(e) => handleRoleChange(email, e.target.value)}
                        disabled={loading}
                        variant="standard"
                      >
                        {Object.entries(ROLES).filter(([key]) => key !== 'owner').map(([key, roleInfo]) => (
                          <MenuItem key={key} value={key}>
                            {roleInfo.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {member.status === 'pending' && (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </Box>
                }
                secondary={`${ROLES[member.role]?.description} • Added ${new Date(member.addedAt).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveMember(email)}
                  disabled={loading}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {Object.keys(currentMembers).length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No additional members yet. Invite someone to collaborate!
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BoardShareModal;
