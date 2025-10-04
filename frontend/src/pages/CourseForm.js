import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Button, Input, Heading, VStack, Textarea, FormControl, FormLabel, useToast, List, ListItem, ListIcon, IconButton } from '@chakra-ui/react';
import { MdEdit, MdDelete } from 'react-icons/md';
import courseService from '../services/courseService';
import lessonService from '../services/lessonService';
import { useNotification } from '../context/NotificationContext';

function CourseForm() {
  const { id } = useParams(); // For editing existing course
  const navigate = useNavigate();
  const toast = useToast();
  const { showNotification } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      courseService.getCourseById(id)
        .then(data => {
          setTitle(data.data.title);
          setDescription(data.data.description);
          setLessons(data.data.lessons || []);
        })
        .catch(err => {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load course';
          showNotification(errorMessage, 'error');
          navigate('/dashboard'); // Redirect if course not found or error
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseData = { title, description };
      if (id) {
        await courseService.updateCourse(id, courseData);
        showNotification('Course updated successfully', 'success');
      } else {
        const response = await courseService.createCourse(courseData);
        showNotification('Course created successfully', 'success');
        navigate(`/courses/${response.data._id}/edit`); // Navigate to edit page to add lessons
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message || 'Operation failed';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonService.deleteLesson(id, lessonId);
        setLessons(lessons.filter(lesson => lesson._id !== lessonId));
        showNotification('Lesson deleted successfully', 'success');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete lesson';
        showNotification(errorMessage, 'error');
      }
    }
  };

  return (
    <Box maxWidth="xl" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="lg" textAlign="center">
          {id ? 'Edit Course' : 'Create New Course'}
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={3}>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Course Title</FormLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter course title"
                isDisabled={loading}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="description">Course Description</FormLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description"
                rows={5}
                isDisabled={loading}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
              {id ? 'Update Course' : 'Create Course'}
            </Button>
          </VStack>
        </form>

        {id && (
          <Box mt={8}>
            <Heading as="h2" size="md" mb={4}>Lessons</Heading>
            <List spacing={3}>
              {lessons.map(lesson => (
                <ListItem key={lesson._id} d="flex" justifyContent="space-between" alignItems="center">
                  {lesson.title}
                  <Box>
                    <IconButton as={Link} to={`/courses/${id}/lessons/${lesson._id}/edit`} icon={<MdEdit />} aria-label="Edit lesson" mr={2} />
                    <IconButton icon={<MdDelete />} aria-label="Delete lesson" onClick={() => handleDeleteLesson(lesson._id)} />
                  </Box>
                </ListItem>
              ))}
            </List>
            <Button as={Link} to={`/courses/${id}/lessons/new`} colorScheme="green" mt={4}>
              Add New Lesson
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default CourseForm;
