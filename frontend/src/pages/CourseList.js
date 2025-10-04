import React, { useState, useContext } from 'react';
import { useQuery } from 'react-query';
import { Box, Text, Heading, Input, Button, Flex, Select, HStack, SimpleGrid, Spinner } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import userService from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const fetchCourses = async (page, keyword, instructorFilter) => {
  const data = await courseService.getCourses(page, 10, keyword, instructorFilter);
  return data;
};

const fetchInstructors = async () => {
  const data = await userService.getInstructors();
  return data;
};

function CourseList() {
  const [keyword, setKeyword] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const { data: courseData, isLoading: coursesLoading, isError: coursesIsError, error: coursesError } = useQuery(
    ['courses', page, keyword, instructorFilter],
    () => fetchCourses(page, keyword, instructorFilter),
    { keepPreviousData: true }
  );

  const { data: instructors, isLoading: instructorsLoading } = useQuery('instructors', fetchInstructors);

  const handleEnroll = async (courseId) => {
    try {
      const response = await enrollmentService.enrollInCourse(courseId);
      showNotification(response.message, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to enroll in course';
      showNotification(errorMessage, 'error');
    }
  };

  if (coursesIsError) {
    showNotification(coursesError.message, 'error');
  }

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>Course Catalog</Heading>

      <HStack spacing={2} mb={3}>
        <Input
          placeholder="Search Courses"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
        />
        <FormControl width="full">
          <FormLabel htmlFor="instructor-filter" srOnly>Filter by Instructor</FormLabel>
          <Select
            id="instructor-filter"
            value={instructorFilter}
            onChange={(e) => { setInstructorFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Instructors</option>
            {instructors?.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.username}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      {coursesLoading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {courseData?.data?.length > 0 ? (courseData.data.map((course) => (
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
            {[...Array(courseData?.pagination?.totalPages || 0).keys()].map((pageNumber) => (
              <Button
                key={pageNumber + 1}
                onClick={() => setPage(pageNumber + 1)}
                colorScheme={page === pageNumber + 1 ? "blue" : "gray"}
              >
                {pageNumber + 1}
              </Button>
            ))}
          </HStack>
        </>
      )}
    </Box>
  );
}

export default CourseList;