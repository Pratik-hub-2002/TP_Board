import { Paper, Typography, Box } from '@mui/material';

const BoardTab = ({ name, color = 'primary' }) => {
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
        <Typography 
          variant="h6" 
          color={`${color}.main`}
          sx={{ fontWeight: 'bold' }}
        >
          {name}
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: '100px' }}>
        {/* Task cards will go here */}
      </Box>
    </Paper>
  );
};

export default BoardTab;