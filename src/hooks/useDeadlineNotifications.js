import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, isPast, isWithinInterval, subDays } from 'date-fns';

const useDeadlineNotifications = (tasks) => {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);
  const lastCheckRef = useRef(Date.now());

  // Initialize audio
  useEffect(() => {
    // Create audio context for notification sounds
    audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Play notification sound
  const playNotificationSound = (type = 'warning') => {
    if (!audioRef.current) return;

    const ctx = audioRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sounds for different urgency levels
    if (type === 'urgent') {
      // High-pitched urgent sound
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === 'overdue') {
      // Alarm-like sound for overdue tasks
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else {
      // Gentle warning sound
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    }
  };

  // Check for deadline notifications
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const newNotifications = [];

      // Flatten all tasks from all lists
      const allTasks = Object.values(tasks).flat();

      allTasks.forEach(task => {
        if (!task.deadline) return;

        const deadline = new Date(task.deadline);
        const timeUntilDeadline = deadline.getTime() - now.getTime();
        const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

        let notificationType = null;
        let message = '';
        let soundType = 'warning';

        if (isPast(deadline)) {
          notificationType = 'overdue';
          message = `Task "${task.text}" is overdue!`;
          soundType = 'overdue';
        } else if (hoursUntilDeadline <= 1) {
          notificationType = 'urgent';
          message = `Task "${task.text}" is due in ${Math.round(hoursUntilDeadline * 60)} minutes!`;
          soundType = 'urgent';
        } else if (hoursUntilDeadline <= 24) {
          notificationType = 'soon';
          message = `Task "${task.text}" is due in ${Math.round(hoursUntilDeadline)} hours!`;
          soundType = 'warning';
        }

        if (notificationType) {
          const notificationId = `${task.id}-${notificationType}`;
          
          // Check if we haven't shown this notification recently
          const lastShown = localStorage.getItem(`notification-${notificationId}`);
          const shouldShow = !lastShown || (now.getTime() - parseInt(lastShown)) > 30 * 60 * 1000; // 30 minutes

          if (shouldShow) {
            newNotifications.push({
              id: notificationId,
              taskId: task.id,
              type: notificationType,
              message,
              timestamp: now.getTime(),
              task
            });

            // Play sound for new notifications
            if (now.getTime() - lastCheckRef.current > 5000) { // Don't spam sounds
              playNotificationSound(soundType);
            }

            // Remember we showed this notification
            localStorage.setItem(`notification-${notificationId}`, now.getTime().toString());
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev.slice(0, 10)]); // Keep last 10
      }

      lastCheckRef.current = now.getTime();
    };

    // Check immediately
    checkDeadlines();

    // Check every minute
    const interval = setInterval(checkDeadlines, 60000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Clear notification
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotification,
    clearAllNotifications,
    playNotificationSound
  };
};

export default useDeadlineNotifications;
