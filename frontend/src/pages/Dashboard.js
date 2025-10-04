import React, { useContext, useState } from 'react';
import { Box, Heading, Text, Button, HStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import UserList from '../components/UserList';
import CourseList from '../components/dashboard/CourseList';
import Report from '../components/dashboard/Report';
import CreateUserForm from '../components/dashboard/CreateUserForm';
import DashboardAnalytics from '../components/dashboard/DashboardAnalytics';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('analytics'); // 'main', 'users', 'courses', 'reports', 'createUser', 'analytics'
  const navigate = useNavigate();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return <Navigate to="/" />;
  }

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>
        Dashboard
      </Heading>
      <Text mb={4}>Welcome to the dashboard, {user.username}!</Text>

      <HStack spacing={4} mb={4} flexWrap="wrap">
        {user.role === 'admin' && (
          <>
            <Button minW="150px" onClick={() => setView('users')}>
              Manage Users
            </Button>
            <Button minW="150px" onClick={() => setView('createUser')}>
              Create User
            </Button>
          </>
        )}
        <Button minW="150px" onClick={() => setView('courses')}>
          Manage Courses
        </Button>
        <Button minW="150px" onClick={() => navigate('/courses/new')}>
          Create Course
        </Button>
        <Button minW="150px" onClick={() => setView('reports')}>
          View Reports
        </Button>
        <Button minW="150px" onClick={() => setView('analytics')}>
          View Analytics
        </Button>
      </HStack>

      {view === 'users' && <UserList />}
      {view === 'createUser' && <CreateUserForm />}
      {view === 'courses' && <CourseList />}
      {view === 'reports' && <Report />}
      {view === 'analytics' && <DashboardAnalytics />}
    </Box>
  );
}

export default Dashboard;



