import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import attendanceService from '../../services/attendanceService';
import { AuthContext } from '../../context/AuthContext';

const AttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const toast = useToast();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceData = await attendanceService.getAttendanceByUser(
          user.id
        );
        setAttendance(attendanceData.data);
      } catch (error) {
        toast({
          title: 'Error fetching attendance',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('Fetching attendance for user:', user.id);
      fetchAttendance();
    }
  }, [user, toast]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box>
      <Text fontSize="xl" mb={4}>
        My Attendance
      </Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Course</Th>
            <Th>Lesson</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {attendance.map((record) => (
            <Tr key={record._id}>
              <Td>{record.course.title}</Td>
              <Td>{record.lesson.title}</Td>
              <Td>{record.status}</Td>
              <Td>{new Date(record.date).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AttendanceView;
