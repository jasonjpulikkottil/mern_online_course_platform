import React, { useEffect, useState } from 'react';
import participationService from '../services/participationService';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';
import ProgressBar from '../components/ProgressBar';

const MyProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverallProgress = async () => {
      try {
        const response = await participationService.getOverallProgress();
        setProgress(response.overallProgress);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching your progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverallProgress();
  }, []);

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" mt={10} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container mt={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" mt={4}>
      <Heading as="h1" size="xl" mb={4}>
        My Progress
      </Heading>
      {progress.length === 0 ? (
        <Text>You have no progress to display yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {progress
            .filter((item) => item.course) // Filter out items with null courses
            .map((item) => (
              <Card key={item.course._id} shadow="md" borderWidth="1px">
                <CardBody>
                  <Heading size="md">{item.course.title}</Heading>
                  <Text mt={4}>
                    {item.completedLessons} of {item.totalLessons} lessons
                    completed.
                  </Text>
                  <ProgressBar value={item.progress} mt={4} />
                </CardBody>
              </Card>
            ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default MyProgress;
