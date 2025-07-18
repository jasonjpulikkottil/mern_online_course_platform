import React, { useState, useContext } from 'react';
import { Box, Button, Input, Heading, VStack, Select } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import userService from '../../services/userService';

function CreateUserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { token } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser({ username, email, password, role }, token);
      showNotification('User created successfully', 'success');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('student');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  return (
    <Box maxWidth="400px" mx="auto" mt={4} p={3} borderWidth="1px" borderRadius="md">
      <Heading as="h5" size="md" mb={3}>
        Create User
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </Select>
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Create User
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default CreateUserForm;
