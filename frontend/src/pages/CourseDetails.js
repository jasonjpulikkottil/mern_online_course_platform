import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, Heading, Button, VStack, HStack, Checkbox, Spinner } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import courseService from '../services/courseService';
import lessonService from '../services/lessonService';
import participationService from '../services/participationService';
import enrollmentService from '../services/enrollmentService';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState({}); // { lessonId: true/false }
  const [videoLoading, setVideoLoading] = useState({}); // { lessonId: true/false }
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const videoRefs = useRef({}); // Store refs for each video player

  const fetchAllDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      // Always fetch course details, as they are public
      const courseData = await courseService.getCourseById(id);
      setCourse(courseData);

      // Initialize video loading state for each lesson
      const initialVideoLoading = {};
      courseData.lessons.forEach((lesson) => {
        if (lesson.media && lesson.media.length > 0 && lesson.media[0].type === 'video') {
          initialVideoLoading[lesson._id] = true;
        }
      });
      setVideoLoading(initialVideoLoading);

      // Only check enrollment and progress if user is logged in and is a student
      if (user && user.role === 'student' && token) {
        const enrollmentStatus = await enrollmentService.checkEnrollment(id);
        setIsEnrolled(enrollmentStatus.isEnrolled);

        if (enrollmentStatus.isEnrolled) {
          const progressData = await participationService.getCourseProgress(id);
          const progressMap = {};
          progressData.progress.forEach(item => {
            progressMap[item._id] = item.completed;
          });
          setLessonProgress(progressMap);
        }
      } else {
        // If not logged in or not a student, ensure isEnrolled is false
        setIsEnrolled(false);
        setLessonProgress({});
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch course details';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  }, [id, user, token, showNotification]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  const handleEnroll = async () => {
    try {
      await enrollmentService.enrollInCourse(id);
      setIsEnrolled(true);
      showNotification('Successfully enrolled in the course!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to enroll in the course';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  const handleLessonCompletionChange = async (lessonId, isCompleted) => {
    try {
      await participationService.updateLessonProgress(lessonId, isCompleted);
      setLessonProgress(prev => ({ ...prev, [lessonId]: isCompleted }));
      showNotification(`Lesson marked as ${isCompleted ? 'completed' : 'incomplete'}.`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update lesson completion';
      showNotification(errorMessage, 'error');
      console.error(err.response?.data || err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonService.deleteLesson(lessonId);
        showNotification('Lesson deleted successfully', 'success');
        fetchAllDetails(); // Re-fetch all details to update lesson list
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to delete lesson';
        showNotification(errorMessage, 'error');
        console.error(err.response?.data || err);
      }
    }
  };

  const handleVideoError = (error, lessonId) => {
    console.error(`Video error for lesson ${lessonId}:`, error);
    setVideoLoading(prev => ({ ...prev, [lessonId]: false }));
    const errorMessage = error.message?.includes('aborted')
      ? 'Video loading was interrupted. Please refresh and try again.'
      : 'Failed to load video. Check your connection or video source.';
    showNotification(errorMessage, 'error');
  };

  const handleVideoLoadedMetadata = (lessonId) => {
    console.log(`Video metadata loaded for lesson ${lessonId}`);
    setVideoLoading(prev => ({ ...prev, [lessonId]: false }));
  };

  const handlePlayClick = (lessonId) => {
    const video = videoRefs.current[lessonId];
    if (video) {
      setTimeout(() => {
        video.play().catch((e) => handleVideoError(e, lessonId));
      }, 100); // Small delay to stabilize
    }
  };

  if (isLoading) return <Box><Spinner size="xl" /></Box>;
  if (!course) return <Box>Course not found.</Box>;

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>{course.title}</Heading>

      <Text fontSize="lg" mb={2} dangerouslySetInnerHTML={{ __html: course.description }} />
      <Text fontSize="md" mb={2}>Instructor: {course.instructor?.username || 'N/A'}</Text>

      {user && user.role === 'student' && !isEnrolled && (
        <Button colorScheme="blue" onClick={handleEnroll} mb={4}>
          Enroll in this Course
        </Button>
      )}

      {user && (user.role === 'instructor' || user.role === 'admin') && (
        <Button
          colorScheme="blue"
          onClick={() => navigate(`/courses/${id}/lessons/new`)}
          mb={4}
        >
          Add Lesson
        </Button>
      )}

      <Heading as="h5" size="md" mt={4} mb={2}>Lessons</Heading>
      {user && user.role === 'student' && !isEnrolled ? (
        <Text>Enroll in the course to view the lessons.</Text>
      ) : (
        <VStack spacing={2} align="stretch">
          {course.lessons.length > 0 ? (
            course.lessons.map((lesson) => (
              <Box key={lesson._id} p={2} borderWidth="1px" borderRadius="md" display="flex" flexDirection="column" alignItems="flex-start">
                <HStack justifyContent="space-between" width="100%" alignItems="center">
                  <Heading as="h6" size="sm">{lesson.title}</Heading>
                  {user && (user.role === 'admin' || (user.role === 'instructor' && course.instructor?._id?.toString() === user.id)) && (
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/courses/${id}/lessons/${lesson._id}/edit`)}
                        mr={1}
                      >
                        Edit
                      </Button>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson._id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  )}
                  {user && user.role === 'student' && isEnrolled && (
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor={`lesson-completed-${lesson._id}`} mb="0">
                        Completed
                      </FormLabel>
                      <Checkbox
                        id={`lesson-completed-${lesson._id}`}
                        isChecked={!!lessonProgress[lesson._id]}
                        onChange={(e) => handleLessonCompletionChange(lesson._id, e.target.checked)}
                      />
                    </FormControl>
                  )}
                </HStack>
                <Text fontSize="sm" mt={1} dangerouslySetInnerHTML={{ __html: lesson.content }} />
                {lesson.media && lesson.media.length > 0 && lesson.media[0].url && (
                  <Box mt={2} width="100%" maxWidth="640px">
                    {lesson.media[0].type === 'video' && (
                      <Box position="relative" zIndex="1">
                        {videoLoading[lesson._id] && <Spinner size="md" position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" />}
                        <video
                          ref={(el) => (videoRefs.current[lesson._id] = el)}
                          controls
                          preload="metadata"
                          crossOrigin="anonymous"
                          style={{ width: '100%', height: 'auto' }}
                          onError={(e) => handleVideoError(e, lesson._id)}
                          onLoadedMetadata={() => handleVideoLoadedMetadata(lesson._id)}
                        >
                          <source
                            src={`${lesson.media[0].url}?_f=auto&_q=auto`}
                            type="video/mp4"
                          />
                          <source
                            src={`${lesson.media[0].url.replace('.mp4', '.webm')}?_f=auto&_q=auto`}
                            type="video/webm"
                          />
                          Your browser does not support the video tag.
                        </video>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          mt={2}
                          onClick={() => handlePlayClick(lesson._id)}
                          isDisabled={videoLoading[lesson._id]}
                        >
                          Play Video
                        </Button>
                        {console.log('Video URL:', `${lesson.media[0].url}?_f=auto&_q=auto`)}
                      </Box>
                    )}
                    {lesson.media[0].type === 'image' && (
                      <img src={lesson.media[0].url} alt={lesson.title} style={{ maxWidth: '100%', height: 'auto' }} />
                    )}
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Text>No lessons available for this course.</Text>
          )}
        </VStack>
      )}
    </Box>
  );
}

export default CourseDetails;