import React, { useEffect, useState, useContext } from 'react';
import { Box, Heading, Text, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Button, VStack } from '@chakra-ui/react';
import { AuthContext } from '../../context/AuthContext';
import reportService from '../../services/reportService';
import { useNotification } from '../../context/NotificationContext';

function Report() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [cloudinaryUsage, setCloudinaryUsage] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await reportService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
        showNotification(error.response?.data?.message || error.message || 'Failed to fetch stats', 'error');
      }
    };
    fetchStats();
  }, [showNotification]);

  const handleFetchCloudinaryUsage = async () => {
    try {
      const data = await reportService.getCloudinaryUsage();
      setCloudinaryUsage(data);
    } catch (error) {
      console.error('Failed to fetch Cloudinary usage', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to fetch Cloudinary usage', 'error');
    }
  };

  return (
    <Box>
      <Heading as="h5" size="md" mb={3}>
        Platform Reports
      </Heading>
      {!stats ? (
        <Text>Loading stats...</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
          <Stat>
            <StatLabel>Total Users</StatLabel>
            <StatNumber>{stats.totalUsers}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Courses</StatLabel>
            <StatNumber>{stats.totalCourses}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Enrollments</StatLabel>
            <StatNumber>{stats.totalEnrollments}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {user.role === 'admin' && (
        <>
          <Heading as="h5" size="md" mt={6} mb={3}>
            Cloudinary Usage
          </Heading>
          <Button onClick={handleFetchCloudinaryUsage} colorScheme="blue" mb={4}>
            Fetch Cloudinary Usage
          </Button>
          {cloudinaryUsage && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
              <Stat>
                <StatLabel>Plan</StatLabel>
                <StatNumber>{cloudinaryUsage.plan}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Storage</StatLabel>
                <StatNumber>{(cloudinaryUsage.storage.usage / 10e8).toFixed(2)} GB</StatNumber>
                <StatHelpText>
                  Limit: {cloudinaryUsage.storage.limit / 10e8} GB
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Transformations</StatLabel>
                <StatNumber>{cloudinaryUsage.transformations.usage}</StatNumber>
                <StatHelpText>
                  Limit: {cloudinaryUsage.transformations.limit}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Bandwidth</StatLabel>
                <StatNumber>{(cloudinaryUsage.bandwidth.usage / 10e8).toFixed(2)} GB</StatNumber>
                <StatHelpText>
                  Limit: {cloudinaryUsage.bandwidth.limit / 10e8} GB
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
}

export default Report;