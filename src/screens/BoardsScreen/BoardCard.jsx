import { Stack, Grid, Typography, IconButton, Box, Tooltip } from '@mui/material';
import OpenIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme';
import useStore from '../../store';

const BoardCard = ({ name, color, createdAt, id }) => {
  const navigate = useNavigate();
  const setToastrMsg = useStore(state => state.setToastrMsg);
  
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

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Stack 
        p={2} 
        height="100%"
        bgcolor="background.paper"
        borderRadius={1}
        boxShadow={1}
        sx={{ 
          borderLeft: `5px solid ${boardColor}`,   // ✅ moved inside sx
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
        </Stack>
      </Stack>
    </Grid>
  )
}

export default BoardCard;
