import { Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase';
import BoardTopbar from "./BoardTopbar";
import BoardInterface from "./BoardInterface";

const BoardScreen = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('BoardScreen: Auth state changed, user:', currentUser?.uid);
      
      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      setUser(currentUser);
      
      try {
        if (!boardId) {
          setError('No board ID provided');
          setLoading(false);
          return;
        }
        
        console.log('BoardScreen: Fetching board for user:', currentUser.uid, 'boardId:', boardId);
        
        const boardRef = doc(db, `users/${currentUser.uid}/boards`, boardId);
        const boardDoc = await getDoc(boardRef);
        
        if (boardDoc.exists()) {
          console.log('BoardScreen: Board found:', boardDoc.data());
          setBoard({ id: boardDoc.id, ...boardDoc.data() });
        } else {
          console.log('BoardScreen: Board not found, creating default');
          // Create a default board object if it doesn't exist
          setBoard({ id: boardId, name: 'New Board', color: 'primary' });
        }
        setError(null);
      } catch (err) {
        console.error('BoardScreen: Error fetching board:', err);
        // Even if there's an error, show the interface with a default board
        setBoard({ id: boardId, name: 'New Board', color: 'primary' });
        setError(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [boardId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && error === 'No board ID provided') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (error && error === 'User not authenticated') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleBoardUpdate = (updatedBoard) => {
    setBoard(updatedBoard);
  };

  // Always render the interface if we have a user and boardId
  if (user && boardId) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <BoardTopbar 
          boardName={board?.name} 
          boardId={boardId} 
          board={board || { id: boardId, name: 'New Board', color: 'primary' }} 
          onBoardUpdate={handleBoardUpdate}
        />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <BoardInterface boardId={boardId} boardName={board?.name} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default BoardScreen;