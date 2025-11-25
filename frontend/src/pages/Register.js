import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Heading, VStack, Select, Text } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import authService from '../services/authService';
import { useNotification } from '../context/NotificationContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!password || password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (!role || !['student', 'instructor'].includes(role)) newErrors.role = 'Please select a valid role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Please fix the form errors', 'error');
      return;
    }

    // Clear errors on successful validation
    setErrors({});

    try {
      await authService.register({ username, email, password, role });
      showNotification('Registration successful', 'success');
      navigate('/login');
    } catch (err) {
      // Parse backend validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          // Map backend field names to form field names
          const fieldName = error.param || error.path;
          if (fieldName) {
            backendErrors[fieldName] = error.msg;
          }
        });
        setErrors(backendErrors);
        showNotification('Please fix the form errors', 'error');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
        showNotification(errorMessage, 'error');
      }
      console.error(err.response?.data || err);
    }
  };

  return (
    <Box maxWidth="xs" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="lg" textAlign="center">
          Register
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={3}>
            <FormControl isRequired>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderColor={errors.username ? 'red.500' : undefined}
              />
              {errors.username && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.username}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderColor={errors.email ? 'red.500' : undefined}
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.email}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderColor={errors.password ? 'red.500' : undefined}
              />
              {errors.password && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.password}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="role">Role</FormLabel>
              <Select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                borderColor={errors.role ? 'red.500' : undefined}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </Select>
              {errors.role && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.role}
                </Text>
              )}
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full">
              Register
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default Register;
