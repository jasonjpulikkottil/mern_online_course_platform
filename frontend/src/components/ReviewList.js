
import React from 'react';
import { useQuery } from 'react-query';
import { Box, Text, VStack, Spinner, Heading } from '@chakra-ui/react';
import courseService from '../services/courseService';

const fetchReviews = async (courseId) => {
  const data = await courseService.getReviewsForCourse(courseId);
  return data;
};

function ReviewList({ courseId }) {
  const { data: reviews, isLoading, isError, error } = useQuery(
    ['reviews', courseId],
    () => fetchReviews(courseId)
  );

  if (isLoading) return <Spinner />;
  if (isError) return <Text>Error: {error.message}</Text>;

  return (
    <Box>
      <Heading as="h5" size="md" mt={4} mb={2}>Reviews</Heading>
      <VStack spacing={4} align="stretch">
        {reviews.data.length > 0 ? (
          reviews.data.map((review) => (
            <Box key={review._id} p={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="bold">{review.user.username}</Text>
              <Text>Rating: {review.rating}/5</Text>
              <Text mt={2}>{review.comment}</Text>
            </Box>
          ))
        ) : (
          <Text>No reviews yet.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default ReviewList;
