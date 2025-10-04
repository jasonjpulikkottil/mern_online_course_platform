import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
} from '@chakra-ui/react';
import enrollmentService from '../../services/enrollmentService';
import attendanceService from '../../services/attendanceService';

const AttendanceTracker = ({ courseId, lessonId }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const toast = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const enrolledStudents = await enrollmentService.getEnrolledStudents(
          courseId
        );
        setStudents(enrolledStudents.data);
      } catch (error) {
        toast({
          title: 'Error fetching students',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchAttendance = async () => {
      try {
        const attendanceData = await attendanceService.getAttendanceByLesson(
          courseId,
          lessonId
        );
        const attendanceMap = attendanceData.data.reduce((acc, record) => {
          acc[record.student._id] = record.status;
          return acc;
        }, {});
        setAttendance(attendanceMap);
      } catch (error) {
        // It's okay if attendance data doesn't exist yet
      }
    };

    fetchStudents();
    fetchAttendance();
  }, [courseId, lessonId, toast]);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      for (const studentId in attendance) {
        await attendanceService.markAttendance(
          courseId,
          lessonId,
          { studentId, status: attendance[studentId] }
        );
      }
      toast({
        title: 'Attendance saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving attendance',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Text fontSize="xl" mb={4}>
        Attendance Tracker
      </Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Student</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {students.map((enrollment) => (
            <Tr key={enrollment.student._id}>
              <Td>{enrollment.student.username}</Td>
              <Td>
                <Select
                  value={attendance[enrollment.student._id] || 'absent'}
                  onChange={(e) =>
                    handleStatusChange(enrollment.student._id, e.target.value)
                  }
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </Select>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button mt={4} colorScheme="blue" onClick={handleSaveAttendance}>
        Save Attendance
      </Button>
    </Box>
  );
};

export default AttendanceTracker;
