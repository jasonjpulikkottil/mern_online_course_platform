import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Input, Heading, VStack, Select } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

import courseService from '../services/courseService';
import userService from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function CourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [instructors, setInstructors] = useState([]);
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (user.role === 'admin') {
      const fetchInstructors = async () => {
        try {
          const instructorData = await userService.getInstructors();
          setInstructors(instructorData);
        } catch (error) {
          console.error('Failed to fetch instructors', error);
          showNotification('Failed to fetch instructors', 'error');
        }
      };
      fetchInstructors();
    }

    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const course = await courseService.getCourseById(id);
          setTitle(course.title);
          setDescription(course.description);
          if (course.instructor) {
            setInstructor(course.instructor._id);
          }
        } catch (error) {
          console.error('Failed to fetch course', error);
          showNotification(error.response?.data?.message || error.message || 'Failed to fetch course details', 'error');
        }
      };
      fetchCourse();
    }
  }, [id, isEditing, showNotification, user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const courseData = { title, description };
    if (user.role === 'admin' && instructor) {
      courseData.instructor = instructor;
    }

    try {
      if (isEditing) {
        await courseService.updateCourse(id, courseData);
        showNotification('Course updated successfully', 'success');
      } else {
        await courseService.createCourse(courseData);
        showNotification('Course created successfully', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'], // Removed 'image' as course form doesn't handle media directly yet
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link' // Removed 'image'
  ];

  return (
    <Box maxWidth="400px" mx="auto" mt={4} p={3} borderWidth="1px" borderRadius="md">
      <Heading as="h5" size="md" mb={3}>
        {isEditing ? 'Edit Course' : 'Create Course'}
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={quillModules}
              formats={quillFormats}
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </FormControl>
          {user.role === 'admin' && (
            <FormControl>
              <FormLabel>Instructor</FormLabel>
              <Select
                placeholder="Select instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
              >
                {instructors.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.username}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <Button type="submit" colorScheme="blue" width="full">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default CourseForm;
