import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Input, Text, Heading, VStack, Progress } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import lessonService from '../services/lessonService';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function LessonForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [media, setMedia] = useState(null);
  const [mediaFileName, setMediaFileName] = useState('');
  const [currentMediaUrl, setCurrentMediaUrl] = useState(''); // To display existing media
  const [uploadProgress, setUploadProgress] = useState(0); // For upload progress
  const { token } = useContext(AuthContext);
  const { courseId, lessonId } = useParams(); // Get lessonId from params
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const isEditMode = !!lessonId; // Determine if in edit mode

  useEffect(() => {
    if (isEditMode) {
      const fetchLesson = async () => {
        try {
          const data = await lessonService.getLesson(lessonId);
          setTitle(data.title);
          setContent(data.content);
          setOrder(data.order);
          if (data.media && data.media.length > 0) {
            setCurrentMediaUrl(data.media[0].url);
            setMediaFileName(data.media[0].url.split('/').pop()); // Extract filename from URL
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch lesson';
          showNotification(errorMessage, 'error');
          console.error(err.response?.data || err);
          navigate(`/courses/${courseId}`); // Redirect if lesson not found or error
        }
      };
      fetchLesson();
    }
  }, [isEditMode, lessonId, courseId, navigate, showNotification]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    setMediaFileName(file ? file.name : '');
    setCurrentMediaUrl(''); // Clear current media URL if new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('order', order);
    if (media) formData.append('media', media);

    try {
      let response;
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log('Upload Progress:', percentCompleted);
        },
      };

      if (isEditMode) {
        response = await lessonService.updateLesson(lessonId, formData, config);
      } else {
        formData.append('courseId', courseId);
        response = await lessonService.createLesson(formData, config);
      }
      showNotification(response.message, 'success');
      setUploadProgress(0); // Reset progress on success
      navigate(`/courses/${courseId}`); // Navigate back to course details after save
    } catch (err) {
      setUploadProgress(0); // Reset progress on error
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || (isEditMode ? 'Failed to update lesson' : 'Failed to create lesson');
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <Box maxWidth="800px" mx="auto" mt={4} p={3} borderWidth="1px" borderRadius="md">
      <Heading as="h5" size="md" mb={3}>{isEditMode ? 'Edit Lesson' : `Create Lesson for Course: ${courseId}`}</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <Text fontSize="md" mt={2} mb={1}>Content</Text>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            style={{ height: '200px', marginBottom: '50px' }}
          />
          <FormControl isRequired>
            <FormLabel>Order</FormLabel>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min={1}
            />
          </FormControl>
          <Button
            as="label"
            htmlFor="media-upload"
            colorScheme="blue"
          >
            Upload Media
            <input
              id="media-upload"
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,application/pdf"
            />
          </Button>
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} size="sm" colorScheme="blue" mt={2} minH="8px" />
          )}
          {console.log('Progress bar rendering with value:', uploadProgress)}
          {(mediaFileName || currentMediaUrl) && (
            <Text fontSize="sm" mt={1}>
              Selected file: {mediaFileName || currentMediaUrl.split('/').pop()}
              {currentMediaUrl && !media && ' (Current)'}
            </Text>
          )}
          <Button type="submit" colorScheme="blue" width="full">
            {isEditMode ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default LessonForm;