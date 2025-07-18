import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Input, Heading, Text, Spinner, Flex } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // For fetching initial profile
import userService from '../services/userService'; // For updating profile
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function Profile() {
  const { user, login, loading: authLoading } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        // If user is not in context, try to fetch from backend
        try {
          const fetchedUser = await authService.getProfile();
          setUsername(fetchedUser.username);
          setEmail(fetchedUser.email);
          // Update AuthContext if it was null
          if (!user) {
            login(fetchedUser, localStorage.getItem('token')); // Re-login to update context
          }
        } catch (err) {
          setError(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch profile');
          console.error(err.response?.data || err);
          showNotification('Failed to load profile. Please log in again.', 'error');
          navigate('/login');
        } finally {
          setLoading(false);
        }
      } else {
        // If user is already in context, use that data
        setUsername(user.username);
        setEmail(user.email);
        setLoading(false);
      }
    };

    if (!authLoading) { // Only fetch if AuthContext has finished loading
      fetchProfile();
    }
  }, [user, authLoading, navigate, showNotification, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const profileData = { username, email };
    if (password) {
      profileData.password = password;
    }
    try {
      const updatedUser = await userService.updateProfile(profileData);
      // Update the user in AuthContext
      login(updatedUser.user, localStorage.getItem('token')); // Use login to update context
      showNotification('Profile updated successfully!', 'success');
      setPassword('');
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box maxWidth="xs" mx="auto">
        <Box mt={8} display="flex" flexDirection="column" alignItems="center">
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
          <Button onClick={() => navigate('/login')} mt={2}>Go to Login</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth="xs" mx="auto">
      <Box
        mt={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Heading as="h1" size="lg">
          User Profile
        </Heading>
        <Box as="form" onSubmit={handleSubmit} mt={1} width="full">
          <FormControl mt={2} isRequired>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl mt={2} isRequired>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl mt={2}>
            <FormLabel htmlFor="password">New Password</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            width="full"
            colorScheme="blue"
            mt={3}
            mb={2}
            isLoading={loading}
          >
            Update Profile
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Profile;