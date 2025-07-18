import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Spacer,
  Heading,
  Button,
  Container,
  Spinner,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseForm from './pages/CourseForm';
import LessonForm from './pages/LessonForm';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user, logout, loading } = useContext(AuthContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const navLinks = (
    <>
      <Button as={RouterLink} to="/courses" variant="link" color="blue.500" mr={4}>
        Courses
      </Button>
      {user ? (
        <>
          {user.role === 'student' && (
            <Button as={RouterLink} to="/my-courses" variant="link" color="blue.500" mr={4}>
              My Courses
            </Button>
          )}
          {(user.role === 'admin' || user.role === 'instructor') && (
            <Button as={RouterLink} to="/dashboard" variant="link" color="blue.500" mr={4}>
              Dashboard
            </Button>
          )}
          {user.role === 'instructor' && (
            <Button as={RouterLink} to="/courses/new" variant="link" color="blue.500" mr={4}>
              Create Course
            </Button>
          )}
          <Button as={RouterLink} to="/notifications" variant="link" color="blue.500" mr={4}>
            Notifications
          </Button>
          <Button as={RouterLink} to="/profile" variant="link" color="blue.500" mr={4}>
            Profile
          </Button>
          <Button onClick={logout} variant="link" color="blue.500" mr={4}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button as={RouterLink} to="/login" variant="link" color="blue.500" mr={4}>
            Login
          </Button>
          <Button as={RouterLink} to="/register" variant="link" color="blue.500" mr={4}>
            Register
          </Button>
        </>
      )}
    </>
  );

  return (
    <Box flexGrow={1}>
      <Flex as="nav" bg="green.100" color="blue.500" p={4} alignItems="center">
        <Heading as="h1" size="md">
          <Button as={RouterLink} to="/" variant="link" color="blue.500">
            Online Course Platform
          </Button>
        </Heading>
        <Spacer />
        {isMobile ? (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
              color="blue.500"
            />
            <MenuList>
              <MenuItem as={RouterLink} to="/courses" color="blue.500">
                Courses
              </MenuItem>
              {user ? (
                <>
                  {user.role === 'student' && (
                    <MenuItem as={RouterLink} to="/my-courses" color="blue.500">
                      My Courses
                    </MenuItem>
                  )}
                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <MenuItem as={RouterLink} to="/dashboard" color="blue.500">
                      Dashboard
                    </MenuItem>
                  )}
                  {user.role === 'instructor' && (
                    <MenuItem as={RouterLink} to="/courses/new" color="blue.500">
                      Create Course
                    </MenuItem>
                  )}
                  <MenuItem as={RouterLink} to="/notifications" color="blue.500">
                    Notifications
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/profile" color="blue.500">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={logout} color="blue.500">
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem as={RouterLink} to="/login" color="blue.500">
                    Login
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/register" color="blue.500">
                    Register
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        ) : (
          navLinks
        )}
        <Button onClick={toggleColorMode} variant="ghost" color="blue.500" ml={4}>
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
      <Container maxWidth="xl" mt={4} mb={4}>
        <Routes>
          <Route path="/" element={<CourseList />} />
          <Route path="/courses" element={<CourseList />} />
          <Route
            path="/courses/new"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/lessons/new"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <LessonForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/lessons/:lessonId/edit"
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <LessonForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute roles={['student']}>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['admin', 'instructor']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;