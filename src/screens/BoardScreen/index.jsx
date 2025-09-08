import { Box, CircularProgress, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import BoardTopbar from "./BoardTopbar";
import BoardInterface from "./BoardInterface";

const BoardScreen = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        if (!boardId) {
          setError('No board ID provided');
          setLoading(false);
          return;
        }
        
        const boardRef = doc(db, 'boards', boardId);
        const boardDoc = await getDoc(boardRef);
        
        if (boardDoc.exists()) {
          setBoard({ id: boardDoc.id, ...boardDoc.data() });
        } else {
          setError('Board not found');
        }
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BoardTopbar board={board} />
      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8, overflow: 'auto' }}>
        <BoardInterface boardId={boardId} />
      </Box>
    </Box>
  );
};

export default BoardScreen;