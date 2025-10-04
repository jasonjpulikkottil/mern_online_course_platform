import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
} from '@chakra-ui/react';
import reportService from '../../services/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const fetchDashboardStats = () => reportService.getStats();
const fetchEnrollmentStats = () => reportService.getEnrollmentStats();
const fetchParticipationStats = () => reportService.getParticipationStats();
const fetchUserRoleDistribution = () => reportService.getUserRoleDistribution();
const fetchCourseStats = () => reportService.getCourseStats();

function Report() {
  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery('dashboardStats', fetchDashboardStats);
  const { data: enrollmentStats, isLoading: enrollmentLoading } = useQuery('enrollmentStats', fetchEnrollmentStats);
  const { data: participationStats, isLoading: participationLoading } = useQuery('participationStats', fetchParticipationStats);
  const { data: userRoles, isLoading: userRolesLoading } = useQuery('userRoles', fetchUserRoleDistribution);
  const { data: courseStats, isLoading: courseStatsLoading } = useQuery('courseStats', fetchCourseStats);

  const isLoading = dashboardLoading || enrollmentLoading || participationLoading || userRolesLoading || courseStatsLoading;

  return (
    <Box>
      <Heading as="h5" size="md" mb={4}>
        Platform Reports
      </Heading>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatNumber>{dashboardStats?.totalUsers}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Courses</StatLabel>
              <StatNumber>{dashboardStats?.totalCourses}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Enrollments</StatLabel>
              <StatNumber>{dashboardStats?.totalEnrollments}</StatNumber>
            </Stat>
          </SimpleGrid>

          <Accordion allowToggle defaultIndex={[0]}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    User Role Distribution
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userRoles}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Number of Users" />
                  </BarChart>
                </ResponsiveContainer>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Course Statistics
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Course Title</Th>
                      <Th>Instructor</Th>
                      <Th isNumeric>Enrollments</Th>
                      <Th isNumeric>Lessons</Th>
                      <Th>Completion Rate</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {courseStats?.map((course) => (
                      <Tr key={course._id}>
                        <Td>{course.title}</Td>
                        <Td>{course.instructor || 'N/A'}</Td>
                        <Td isNumeric>{course.enrollmentCount}</Td>
                        <Td isNumeric>{course.lessonCount}</Td>
                        <Td>
                          <Progress value={course.completionRate} size="sm" colorScheme="green" />
                          <Text fontSize="xs" textAlign="right">{course.completionRate.toFixed(2)}%</Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    Enrollment by Course
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentStats?.enrollmentsByCourse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseTitle" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </Box>
  );
}

export default Report;