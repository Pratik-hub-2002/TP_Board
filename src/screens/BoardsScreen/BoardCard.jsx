import { Stack, Grid, Typography, IconButton, Box } from '@mui/material';
import OpenIcon from '@mui/icons-material/Launch';
import { colors } from '../../theme';

const BoardCard = ({ name, color, createdAt }) => {
  if (!name) return null;
  
  const boardColor = colors[color] || colors[0];
  const createdDate = createdAt || new Date().toLocaleDateString();

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Stack 
        p={2} 
        bgcolor="background.paper" 
        borderLeft="5px solid" 
        borderColor={colors[color]}
        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
      > 
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box width="70%">
            <Typography 
              textOverflow="ellipsis" 
              overflow="hidden" 
              whiteSpace="nowrap" 
              fontWeight={400} 
              variant="h6"
            >
              {name || 'Untitled Board'}
            </Typography>
          </Box>
          <IconButton size="small">
            <OpenIcon />
          </IconButton>
        </Stack>
        <Typography variant="caption">
          Created at: {createdAt}
        </Typography>
      </Stack>
    </Grid>
  )
}

export default BoardCard