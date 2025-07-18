import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Box, Text, Heading, Input, Button, Flex, Select, Option, HStack, SimpleGrid } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import userService from '../services/userService'; // Import userService
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [keyword, setKeyword] = useState(''); // Renamed from searchTerm
  const [instructorFilter, setInstructorFilter] = useState('');
  const [instructors, setInstructors] = useState([]); // New state for instructors
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, token } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const fetchCourses = useCallback(async () => {
    try {
      const data = await courseService.getCourses(page, 10, keyword, instructorFilter);
      setCourses(data.courses);
      setTotalPages(data.totalPages);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch courses';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  }, [page, keyword, instructorFilter, showNotification, token]);

  const fetchInstructors = useCallback(async () => {
    try {
      const instructorUsers = await userService.getInstructors();
      setInstructors(instructorUsers);
    } catch (err) {
      console.error('Failed to fetch instructors:', err.response?.data || err);
    }
  }, [token]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleEnroll = async (courseId) => {
    try {
      const response = await enrollmentService.enrollInCourse(courseId);
      showNotification(response.message, 'success');
      // Optionally refresh courses or update UI to reflect enrollment
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to enroll in course';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>Course Catalog</Heading>

      <HStack spacing={2} mb={3}>
        <Input
          placeholder="Search Courses"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <FormControl width="full">
          <FormLabel htmlFor="instructor-filter" srOnly>Filter by Instructor</FormLabel>
          <Select
            id="instructor-filter"
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
          >
            <option value="">All Instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.username}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {Array.isArray(courses) && courses.length > 0 ? (courses.map((course) => (
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
            {user && user.role === 'student' && (
              <Flex justifyContent="flex-end" mt={3}>
                <Button size="sm" colorScheme="blue" onClick={() => handleEnroll(course._id)}>
                  Enroll
                </Button>
              </Flex>
            )}
          </Box>
        ))) : (
          <Text>No courses found.</Text>
        )}
      </SimpleGrid>

      <HStack justifyContent="center" mt={4}>
        {[...Array(totalPages).keys()].map((pageNumber) => (
          <Button
            key={pageNumber + 1}
            onClick={() => handlePageChange(null, pageNumber + 1)}
            colorScheme={page === pageNumber + 1 ? "blue" : "gray"}
          >
            {pageNumber + 1}
          </Button>
        ))}
      </HStack>
    </Box>
  );
}

export default CourseList;