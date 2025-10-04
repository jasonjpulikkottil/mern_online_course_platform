import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import AttendanceView from '../components/dashboard/AttendanceView';

const MyAttendance = () => {
  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        My Attendance
      </Heading>
      <AttendanceView />
    </Box>
  );
};

export default MyAttendance;
