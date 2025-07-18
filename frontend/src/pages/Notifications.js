import React, { useState, useEffect, useContext } from 'react';
import { Box, Heading, Text, VStack, Button, Checkbox, HStack } from '@chakra-ui/react';
import notificationService from '../services/notificationService';
import { useNotification } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { showNotification } = useNotification();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return; // Don't fetch if not authenticated
      try {
        const data = await notificationService.getNotifications(token);
        setNotifications(data);
      } catch (error) {
        showNotification(error.response?.data?.message || error.message || 'Failed to fetch notifications', 'error');
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();
  }, [token, showNotification]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markNotificationAsRead(id, token);
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
      );
      showNotification('Notification marked as read', 'success');
    } catch (error) {
      showNotification(error.response?.data?.message || error.message || 'Failed to mark notification as read', 'error');
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await notificationService.clearAllNotifications(token);
        setNotifications([]);
        showNotification('All notifications cleared', 'success');
      } catch (error) {
        showNotification(error.response?.data?.message || error.message || 'Failed to clear all notifications', 'error');
        console.error('Failed to clear all notifications', error);
      }
    }
  };

  return (
    <Box p={4}>
      <HStack justifyContent="space-between" mb={4}>
        <Heading as="h4" size="lg">
          Notifications
        </Heading>
        <Button colorScheme="red" size="sm" onClick={handleClearAll} isDisabled={notifications.length === 0}>
          Clear All
        </Button>
      </HStack>
      <VStack spacing={3} align="stretch">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              shadow="md"
              bg={notification.read ? 'gray.100' : 'white'} // Light gray for read notifications
            >
              <HStack justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Text fontWeight={notification.read ? 'normal' : 'bold'}>{notification.message}</Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {notification.date}
                  </Text>
                </Box>
                {!notification.read && (
                  <Checkbox
                    isChecked={notification.read}
                    onChange={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as Read
                  </Checkbox>
                )}
              </HStack>
            </Box>
          ))
        ) : (
          <Text>You have no new notifications.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default Notifications;
