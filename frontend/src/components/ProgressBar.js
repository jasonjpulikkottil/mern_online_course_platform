import React from 'react';
import { Box, Progress, Text } from '@chakra-ui/react';

const ProgressBar = ({ value, ...props }) => {
  return (
    <Box {...props}>
      <Progress value={value} size="lg" colorScheme="green" hasStripe />
      <Text fontSize="sm" textAlign="center" mt={1}>
        {Math.round(value)}% Complete
      </Text>
    </Box>
  );
};

export default ProgressBar;
