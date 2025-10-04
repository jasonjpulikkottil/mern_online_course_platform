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
import MyProgress from './pages/MyProgress';
import MyAttendance from './pages/MyAttendance';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user, logout, loading } = useContext(AuthContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const navBgColor = useColorModeValue('gray.100', 'gray.900');
  const navLinkColor = useColorModeValue('blue.600', 'blue.200');

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const navLinks = (
    <>
      <Button as={RouterLink} to="/courses" variant="ghost" color={navLinkColor} mr={4}>
        Courses
      </Button>
      {user ? (
        <>
          {user.role === 'student' && (
            <>
              <Button as={RouterLink} to="/my-courses" variant="ghost" color={navLinkColor} mr={4}>
                My Courses
              </Button>
              <Button as={RouterLink} to="/my-attendance" variant="ghost" color={navLinkColor} mr={4}>
                My Attendance
              </Button>
              <Button as={RouterLink} to="/my-progress" variant="ghost" color={navLinkColor} mr={4}>
                My Progress
              </Button>
            </>
          )}
          {(user.role === 'admin' || user.role === 'instructor') && (
            <Button as={RouterLink} to="/dashboard" variant="ghost" color={navLinkColor} mr={4}>
              Dashboard
            </Button>
          )}
          {user.role === 'instructor' && (
            <Button as={RouterLink} to="/courses/new" variant="ghost" color={navLinkColor} mr={4}>
              Create Course
            </Button>
          )}
          <Button as={RouterLink} to="/notifications" variant="ghost" color={navLinkColor} mr={4}>
            Notifications
          </Button>
          <Button as={RouterLink} to="/profile" variant="ghost" color={navLinkColor} mr={4}>
            Profile
          </Button>
          <Button onClick={logout} variant="ghost" color={navLinkColor} mr={4}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button as={RouterLink} to="/login" variant="ghost" color={navLinkColor} mr={4}>
            Login
          </Button>
          <Button as={RouterLink} to="/register" variant="ghost" color={navLinkColor} mr={4}>
            Register
          </Button>
        </>
      )}
    </>
  );

  return (
    <Box>
      <Flex as="nav" bg={navBgColor} p={4} alignItems="center" shadow="md">
        <Heading as="h1" size="md">
          <Button as={RouterLink} to="/" variant="ghost" color={navLinkColor}>
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
              color={navLinkColor}
            />
            <MenuList>
              <MenuItem as={RouterLink} to="/courses">
                Courses
              </MenuItem>
              {user ? (
                <>
                  {user.role === 'student' && (
                    <>
                      <MenuItem as={RouterLink} to="/my-courses">
                        My Courses
                      </MenuItem>
                      <MenuItem as={RouterLink} to="/my-attendance">
                        My Attendance
                      </MenuItem>
                      <MenuItem as={RouterLink} to="/my-progress">
                        My Progress
                      </MenuItem>
                    </>
                  )}
                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <MenuItem as={RouterLink} to="/dashboard">
                      Dashboard
                    </MenuItem>
                  )}
                  {user.role === 'instructor' && (
                    <MenuItem as={RouterLink} to="/courses/new">
                      Create Course
                    </MenuItem>
                  )}
                  <MenuItem as={RouterLink} to="/notifications">
                    Notifications
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem as={RouterLink} to="/login">
                    Login
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/register">
                    Register
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        ) : (
          navLinks
        )}
        <Button onClick={toggleColorMode} variant="ghost" color={navLinkColor} ml={4}>
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
      <Container maxWidth="container.xl" mt={4} mb={4}>
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
            path="/my-attendance"
            element={
              <ProtectedRoute roles={['student']}>
                <MyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-progress"
            element={
              <ProtectedRoute roles={['student']}>
                <MyProgress />
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

import theme from './theme';

import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;