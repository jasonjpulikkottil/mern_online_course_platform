import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, Heading, VStack, Progress, Button, Flex } from '@chakra-ui/react';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import enrollmentService from '../services/enrollmentService';
import participationService from '../services/participationService';
import { AuthContext } from '../context/AuthContext';

function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const enrollments = await enrollmentService.getMyEnrollments();
        const coursesWithProgress = await Promise.all(
          enrollments.map(async (enrollment) => {
            if (!enrollment.course) {
              console.warn('Enrollment with null course found:', enrollment._id);
              return null; // Skip this enrollment if course is null
            }
            const course = enrollment.course;
            try {
              const progressResponse = await participationService.getCourseProgress(course._id);
              const totalLessons = progressResponse.progress.length;
              const completedLessons = progressResponse.progress.filter(lesson => lesson.completed).length;
              const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

              return {
                ...course,
                progressPercentage: progressPercentage,
                completedLessons: completedLessons,
                totalLessons: totalLessons,
              };
            } catch (progressErr) {
              console.error(`Error fetching progress for course ${course._id}:`, progressErr);
              return {
                ...course,
                progressPercentage: 0,
                completedLessons: 0,
                totalLessons: 0,
                progressError: 'Failed to load progress',
              };
            }
          })
        );
        setEnrolledCourses(coursesWithProgress.filter(Boolean)); // Filter out null values
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch enrolled courses');
        console.error('Error fetching enrolled courses:', err.response?.data || err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Optionally logout or redirect to login if token is invalid/expired
          // logout();
          // navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchMyCourses();
    } else if (!token) {
      setLoading(false);
      navigate('/login');
    }
  }, [token, user, navigate]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="80vh">
        <Text>Loading your courses...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user || user.role !== 'student') {
    return (
      <Box p={4}>
        <Alert status="warning">
          <AlertIcon />
          Please log in as a student to view your enrolled courses.
        </Alert>
        <Button onClick={() => navigate('/login')} mt={2}>Go to Login</Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>My Enrolled Courses</Heading>
      {enrolledCourses.length === 0 ? (
        <Text>You are not enrolled in any courses yet. <Link to="/courses">Browse courses</Link> to get started!</Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {enrolledCourses.map((course) => (
            <Box key={course._id} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
              <Heading as="h6" size="md" mb={2}>
                <Link to={`/courses/${course._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {course.title}
                </Link>
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Instructor: {course.instructor?.username || 'N/A'}
              </Text>
              <Text fontSize="md" mt={2}>
                {(course.description).replace(/<[^>]*>?/gm, '')}
              </Text>
              <Box width="100%" mt={2}>
                <Text fontSize="sm" color="gray.600">
                  Progress: {course.completedLessons} / {course.totalLessons} lessons completed ({course.progressPercentage.toFixed(0)}%)
                </Text>
                <Progress value={course.progressPercentage} size="sm" colorScheme="blue" borderRadius="md" mt={1} />
                {course.progressError && <Alert status="warning" mt={1}><AlertIcon />{course.progressError}</Alert>}
              </Box>
              <Button as={Link} to={`/courses/${course._id}`} size="sm" mt={3} colorScheme="blue">
                Continue Learning
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default MyCourses;
