import React, { useEffect, useState, useContext } from 'react';
import { Box, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import { useNotification } from '../context/NotificationContext';
import EditUserModal from './EditUserModal';

function UserList() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to fetch users', 'error');
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter((u) => u._id !== userId));
        showNotification('User deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete user', error);
        showNotification(error.response?.data?.message || error.message || 'Failed to delete user', 'error');
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
  };

  if (!user || user.role !== 'admin') {
    return <Text>You are not authorized to view this page.</Text>;
  }

  return (
    <Box>
      <Heading as="h5" size="md" mb={3}>
        User Management
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u) => (
            <Tr key={u._id}>
              <Td>{u.username}</Td>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>
                <Button size="sm" mr={2} onClick={() => handleEdit(u)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(u._id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {selectedUser && (
        <EditUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Box>
  );
}

export default UserList;

