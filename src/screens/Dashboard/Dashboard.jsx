import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Welcome to TP Board
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleLogout}
        sx={{ position: 'absolute', top: 20, right: 20 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;