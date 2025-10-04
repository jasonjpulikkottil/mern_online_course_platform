import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Text, Heading, Button, VStack, HStack, Checkbox, Spinner } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import courseService from '../services/courseService';
import lessonService from '../services/lessonService';
import participationService from '../services/participationService';
import enrollmentService from '../services/enrollmentService';
import paymentService from '../services/paymentService';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AttendanceTracker from '../components/dashboard/AttendanceTracker';
import ProgressBar from '../components/ProgressBar';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';


import { useQuery, useMutation, useQueryClient } from 'react-query';

// ... (imports)

const fetchCourseDetails = async (id) => {
  const data = await courseService.getCourseById(id);
  return data;
};

const fetchEnrollmentStatus = async (id) => {
  const data = await enrollmentService.checkEnrollment(id);
  return data.isEnrolled;
};

const fetchLessonProgress = async (id) => {
  const data = await participationService.getStudentCourseProgress(id);
  const progressMap = {};
  data.progress.forEach(item => {
    progressMap[item._id] = item.completed;
  });
  return progressMap;
};

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading, isError: courseIsError, error: courseError } = useQuery(
    ['course', id],
    () => fetchCourseDetails(id)
  );

  const { data: isEnrolled, isLoading: enrollmentLoading } = useQuery(
    ['enrollment', id],
    () => fetchEnrollmentStatus(id),
    { enabled: !!user && user.role === 'student' }
  );

  const { data: lessonProgress, isLoading: progressLoading } = useQuery(
    ['progress', id],
    () => fetchLessonProgress(id),
    { 
      enabled: !!user && user.role === 'student' && isEnrolled,
      refetchOnMount: true 
    }
  );

  const enrollMutation = useMutation(() => enrollmentService.enrollInCourse(id), {
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries(['enrollment', id]);
        showNotification('Successfully enrolled in the course!', 'success');
      } else {
        showNotification(data.message, 'info');
      }
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to enroll in course';
      showNotification(errorMessage, 'error');
    },
  });

  const lessonProgressMutation = useMutation(({ lessonId, isCompleted }) => participationService.logLessonCompletion(lessonId, isCompleted), {
    onMutate: async ({ lessonId, isCompleted }) => {
      await queryClient.cancelQueries(['progress', id]);
      const previousProgress = queryClient.getQueryData(['progress', id]);
      queryClient.setQueryData(['progress', id], (oldData) => {
        const newData = { ...oldData };
        newData[lessonId] = isCompleted;
        return newData;
      });
      return { previousProgress };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress', id]);
    },
    onError: (err, variables, context) => {
      if (context.previousProgress) {
        queryClient.setQueryData(['progress', id], context.previousProgress);
      }
      const errorMessage = err.response?.data?.message || 'Failed to update lesson completion';
      showNotification(errorMessage, 'error');
    },
  });

  const deleteLessonMutation = useMutation((lessonId) => lessonService.deleteLesson(id, lessonId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['course', id]);
      showNotification('Lesson deleted successfully', 'success');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to delete lesson';
      showNotification(errorMessage, 'error');
    },
  });

  const handleBuyNow = async () => {
    try {
      const { sessionId } = await paymentService.createCheckoutSession(id);
      await paymentService.redirectToCheckout(sessionId);
    } catch (error) {
      showNotification('Error creating checkout session', 'error');
    }
  };

  if (courseLoading || enrollmentLoading || progressLoading) return <Box><Spinner size="xl" /></Box>;
  if (courseIsError) return <Box>Error: {courseError.message}</Box>;
  if (!course || !course.data) return <Box>Course not found.</Box>;

  const totalLessons = course.data.lessons.length;
  const completedLessons = Object.values(lessonProgress || {}).filter(Boolean).length;
  const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Box p={4}>
      <Heading as="h4" size="lg" mb={3}>{course.data.title}</Heading>
      {user && user.role === 'student' && isEnrolled && (
        <ProgressBar value={courseProgress} mb={4} />
      )}
      <Text fontSize="lg" mb={2} dangerouslySetInnerHTML={{ __html: course.data.description }} />
      <Text fontSize="md" mb={2}>Instructor: {course.data.instructor?.username || 'N/A'}</Text>
      <Text fontSize="md" mb={2}>Price: ${course.data.price}</Text>
      <Text fontSize="md" mb={2}>Average Rating: {course.data.averageRating.toFixed(1)} ({course.data.numReviews} reviews)</Text>

      {user && user.role === 'student' && !isEnrolled && (
        <Button colorScheme="blue" onClick={handleBuyNow} mb={4}>
          Buy Now
        </Button>
      )}

      {user && (user.role === 'instructor' || user.role === 'admin') && (
        <Button colorScheme="blue" onClick={() => navigate(`/courses/${id}/lessons/new`)} mb={4}>
          Add Lesson
        </Button>
      )}

      <Heading as="h5" size="md" mt={4} mb={2}>Lessons</Heading>
      {user && user.role === 'student' && !isEnrolled ? (
        <Text>Enroll in the course to view the lessons.</Text>
      ) : (
        <VStack spacing={2} align="stretch">
          {course.data.lessons.length > 0 ? (
            course.data.lessons.map((lesson) => (
              <Box key={lesson._id} p={2} borderWidth="1px" borderRadius="md">
                <HStack justifyContent="space-between" width="100%">
                  <Heading as="h6" size="sm">{lesson.title}</Heading>
                  {user && (user.role === 'admin' || (user.role === 'instructor' && course.data.instructor?._id?.toString() === user.userId)) && (
                    <HStack>
                      <Button size="sm" onClick={() => navigate(`/courses/${id}/lessons/${lesson._id}/edit`)}>Edit</Button>
                      <Button colorScheme="red" size="sm" onClick={() => deleteLessonMutation.mutate(lesson._id)} isLoading={deleteLessonMutation.isLoading}>Delete</Button>
                    </HStack>
                  )}
                  {user && user.role === 'student' && isEnrolled && (
                    <Checkbox
                      isChecked={!!lessonProgress?.[lesson._id]}
                      onChange={(e) => lessonProgressMutation.mutate({ lessonId: lesson._id, isCompleted: e.target.checked })}
                    >
                      Completed
                    </Checkbox>
                  )}
                </HStack>
                <Text fontSize="sm" mt={1} dangerouslySetInnerHTML={{ __html: lesson.content }} />
                {lesson.media && lesson.media.length > 0 && lesson.media[0].url && (
                  <Box mt={2} width="100%" maxWidth="640px">
                    {lesson.media[0].type === 'video' ? (
                      <video
  controls
  style={{ width: '100%', height: 'auto' }}
>
  <source src={lesson.media[0].url} type="video/mp4" />
  Your browser does not support the video tag.
</video>
                    ) : (
                      <img src={lesson.media[0].url} alt={lesson.title} style={{ maxWidth: '100%' }} />
                    )}
                  </Box>
                )}
                {user && (user.role === 'admin' || user.role === 'instructor') && (
                  <Box mt={4}>
                    <AttendanceTracker courseId={id} lessonId={lesson._id} />
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Text>No lessons available for this course.</Text>
          )}
        </VStack>
      )}

      <ReviewList courseId={id} />
      {user && user.role === 'student' && isEnrolled && (
        <ReviewForm courseId={id} />
      )}
    </Box>
  );
}
export default CourseDetails;