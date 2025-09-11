import { useState } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Chip,
  Button,
  Divider,
  Badge,
  Fab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const NotificationPanel = ({ notifications, onClearNotification, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue': return <ErrorIcon color="error" />;
      case 'urgent': return <WarningIcon color="warning" />;
      case 'soon': return <AccessTimeIcon color="info" />;
      default: return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'overdue': return 'error';
      case 'urgent': return 'warning';
      case 'soon': return 'info';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(true)}
      >
        <Badge badgeContent={notifications.length} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </Fab>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 400, maxWidth: '90vw' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Deadline Notifications
            </Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {notifications.length > 0 && (
            <Button
              startIcon={<ClearAllIcon />}
              onClick={onClearAll}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            >
              Clear All
            </Button>
          )}

          <Divider sx={{ mb: 2 }} />

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No deadline notifications
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: notification.type === 'overdue' ? 'error.light' : 
                             notification.type === 'urgent' ? 'warning.light' : 'background.paper',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {notification.message}
                        </Typography>
                        <Chip
                          size="small"
                          label={notification.type.toUpperCase()}
                          color={getNotificationColor(notification.type)}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </Typography>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={() => onClearNotification(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationPanel;
