import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import enrollmentService from '../services/enrollmentService';
import participationService from '../services/participationService';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react';
import ProgressBar from '../components/ProgressBar';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoursesAndProgress = async () => {
      try {
        const coursesResponse = await enrollmentService.getMyCourses();
        setCourses(coursesResponse.data);

        const progressResponse = await participationService.getOverallProgress();
        const progressMap = {};
        progressResponse.overallProgress.forEach((item) => {
          progressMap[item.course._id] = item.progress;
        });
        setProgress(progressMap);
      } catch (err) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndProgress();
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
        My Courses
      </Heading>
      {courses.length === 0 ? (
        <Text>You are not enrolled in any courses yet.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {courses.map((enrollment) => {
            if (!enrollment.course) {
              return null; // or a placeholder component
            }
            return (
              <Card key={enrollment._id} shadow="md" borderWidth="1px">
                <CardBody>
                  <Heading size="md">{enrollment.course.title}</Heading>
                  <Text mt={2} color="gray.500">
                    Instructor: {enrollment.course.instructor?.username || 'N/A'}
                  </Text>
                  <Text mt={4}>{enrollment.course.description}</Text>
                  <ProgressBar value={progress[enrollment.course._id] || 0} mt={4} />
                </CardBody>
                <CardFooter>
                  <Flex justify="flex-end" width="100%">
                    <Button
                      as={RouterLink}
                      to={`/courses/${enrollment.course._id}`}
                      colorScheme="blue"
                    >
                      View Course
                    </Button>
                  </Flex>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default MyCourses;