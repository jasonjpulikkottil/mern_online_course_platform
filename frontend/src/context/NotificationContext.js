import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext'; // Assuming you have an AuthContext that provides the user

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const showNotification = useCallback((message, status = 'info') => {
    toast({
      title: message,
      status: status,
      duration: 6000,
      isClosable: true,
      position: 'top-right',
    });
  }, [toast]);

  useEffect(() => {
    if (user) {
      // Connect to the socket server
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      // Join a room specific to the user
      socket.emit('join', user.userId);

      // Listen for new notifications
      socket.on('new_notification', (notification) => {
        showNotification(notification.message, 'success');
      });

      // Handle connection events
      socket.on('connect', () => {
        console.log('Connected to notification server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from notification server');
      });

      // Clean up the socket connection when the component unmounts or user changes
      return () => {
        socket.disconnect();
      };
    }
  }, [user, showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
