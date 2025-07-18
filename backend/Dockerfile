# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
# Use --only=production to avoid installing dev dependencies
RUN npm install --only=production

# Copy the rest of the application's source code from your host to your image filesystem.
COPY . .

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define the command to run your app
CMD [ "node", "server.js" ]
