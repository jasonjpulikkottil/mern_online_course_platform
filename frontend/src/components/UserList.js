import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Box, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import { useNotification } from '../context/NotificationContext';
import EditUserModal from './EditUserModal';

const fetchUsers = async () => {
  const data = await userService.getUsers();
  return data;
};

function UserList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError, error } = useQuery('users', fetchUsers, {
    enabled: !!user && user.role === 'admin',
  });

  const deleteUserMutation = useMutation((userId) => userService.deleteUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      showNotification('User deleted successfully', 'success');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete user';
      showNotification(errorMessage, 'error');
    },
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    queryClient.setQueryData('users', (oldUsers) =>
      oldUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
  };

  if (!user || user.role !== 'admin') {
    return <Text>You are not authorized to view this page.</Text>;
  }

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
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
          {users?.map((u) => (
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
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this user?')) {
                      deleteUserMutation.mutate(u._id);
                    }
                  }}
                  isLoading={deleteUserMutation.isLoading}
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

