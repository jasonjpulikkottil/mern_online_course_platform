import React, { useEffect, useState, useContext } from 'react';
import { Box, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      // The service returns an object with a courses property
      if (data && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else if (Array.isArray(data)) {
        // Fallback if the API returns a direct array
        setCourses(data);
      } else {
        setCourses([]); // Ensure courses is always an array
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to fetch courses', 'error');
      setCourses([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter((c) => c._id !== courseId));
        showNotification('Course deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete course', error);
        showNotification(error.response?.data?.message || error.message || 'Failed to delete course', 'error');
      }
    }
  };

  return (
    <Box>
      <Heading as="h5" size="md" mb={3}>
        Course Management
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Instructor</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(courses) && courses.map((c) => (
            <Tr key={c._id}>
              <Td>{c.title}</Td>
              <Td>{c.instructor?.username || 'N/A'}</Td>
              <Td>
                <Button
                  size="sm"
                  mr={2}
                  onClick={() => navigate(`/courses/${c._id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(c._id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

export default CourseList;
