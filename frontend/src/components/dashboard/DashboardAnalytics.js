
import React from 'react';
import { useQuery } from 'react-query';
import { Box, Text, VStack, Spinner, Heading, SimpleGrid } from '@chakra-ui/react';
import dashboardService from '../../services/dashboardService';

function StatCard({ title, value }) {
  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Heading fontSize="xl">{title}</Heading>
      <Text mt={4} fontSize="2xl">{value}</Text>
    </Box>
  );
}

function DashboardAnalytics() {
  const { data, isLoading, isError, error } = useQuery('analytics', dashboardService.getAnalytics);

  if (isLoading) return <Spinner />;
  if (isError) return <Text>Error: {error.message}</Text>;

  const analytics = data.data;

  return (
    <Box>
      <Heading as="h5" size="md" mt={4} mb={2}>Analytics</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
        {Object.entries(analytics).map(([key, value]) => (
          <StatCard key={key} title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default DashboardAnalytics;
