import React, { createContext, useState, useContext } from 'react';
import { Alert, AlertIcon, Box, CloseButton } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const toast = useToast();

  const showNotification = (message, status = 'success') => {
    toast({
      title: message,
      status: status,
      duration: 6000,
      isClosable: true,
      position: 'top-right',
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
