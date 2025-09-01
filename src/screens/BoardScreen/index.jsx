import { Box } from '@mui/material';
import BoardTopbar from "./BoardTopbar";
import BoardInterface from "./BoardInterface";

const BoardScreen = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BoardTopbar />
      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8, overflow: 'auto' }}>
        <BoardInterface />
      </Box>
    </Box>
  );
};

export default BoardScreen;