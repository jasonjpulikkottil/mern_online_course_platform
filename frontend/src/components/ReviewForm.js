
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Box, Button, FormControl, FormLabel, Textarea, Select } from '@chakra-ui/react';
import courseService from '../services/courseService';
import { useNotification } from '../context/NotificationContext';

function ReviewForm({ courseId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const mutation = useMutation(
    (newReview) => courseService.createReview(courseId, newReview),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', courseId]);
        showNotification('Review submitted successfully!', 'success');
        setComment('');
        setRating(5);
      },
      onError: (error) => {
        showNotification(error.response.data.message || 'Error submitting review', 'error');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ rating, comment });
  };

  return (
    <Box as="form" onSubmit={handleSubmit} mt={4}>
      <FormControl>
        <FormLabel>Rating</FormLabel>
        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Average</option>
          <option value={2}>2 - Fair</option>
          <option value={1}>1 - Poor</option>
        </Select>
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Comment</FormLabel>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      </FormControl>
      <Button type="submit" mt={4} colorScheme="blue" isLoading={mutation.isLoading}>
        Submit Review
      </Button>
    </Box>
  );
}

export default ReviewForm;
