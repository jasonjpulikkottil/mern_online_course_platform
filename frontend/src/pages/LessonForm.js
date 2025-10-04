import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Input, Heading, VStack, Textarea, FormControl, FormLabel, useToast, InputGroup, InputLeftElement, Progress } from '@chakra-ui/react';
import { FaFileUpload } from 'react-icons/fa';
import lessonService from '../services/lessonService';
import { useNotification } from '../context/NotificationContext';

function LessonForm() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (lessonId) {
      setLoading(true);
      lessonService.getLessonById(courseId, lessonId)
        .then(data => {
          setTitle(data.data.title);
          setContent(data.data.content);
          // Media handling would be more complex in a real app
        })
        .catch(err => {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load lesson';
          showNotification(errorMessage, 'error');
          navigate(`/courses/${courseId}/edit`);
        })
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId, navigate, showNotification]);

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }
    // The order field is required by the backend, let's add a placeholder
    formData.append('order', 1);

    const onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percentCompleted);
    };

    try {
      if (lessonId) {
        await lessonService.updateLesson(courseId, lessonId, formData, onUploadProgress);
        showNotification('Lesson updated successfully', 'success');
      } else {
        await lessonService.createLesson(courseId, formData, onUploadProgress);
        showNotification('Lesson created successfully', 'success');
      }
      navigate(`/courses/${courseId}/edit`);
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message || 'Operation failed';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
    setLoading(false);
  };

  return (
    <Box maxWidth="xl" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Heading as="h1" size="lg" textAlign="center">
          {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={3}>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Lesson Title</FormLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title"
                isDisabled={loading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="content">Lesson Content</FormLabel>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter lesson content"
                rows={5}
                isDisabled={loading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="media">Media (Video/Image)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaFileUpload />
                </InputLeftElement>
                <Input
                  type="file"
                  id="media"
                  onChange={handleFileChange}
                  isDisabled={loading}
                  p={1}
                />
              </InputGroup>
            </FormControl>
            {loading && media && (
              <Progress hasStripe value={uploadProgress} width="100%" />
            )}
            <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
              {lessonId ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}

export default LessonForm;
