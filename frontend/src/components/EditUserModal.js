import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import userService from '../services/userService';
import { useNotification } from '../context/NotificationContext';

function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: '', // Empty by default to avoid accidental overwrites
    role: user.role,
  });
  const { showNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      // Only include password in the update if it's non-empty
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password; // Exclude empty password
      }
      await userService.updateUser(user._id, updateData);
      onUserUpdated({ ...user, ...updateData });
      showNotification('User updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to update user', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to update user', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password (leave blank to keep unchanged)</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
            Update
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditUserModal;