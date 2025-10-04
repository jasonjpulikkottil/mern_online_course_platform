# Use a specific Node.js version for reproducibility
FROM node:18.17.1-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
# Use --only=production to avoid installing dev dependencies
RUN npm install --only=production

# Copy the rest of the application's source code
COPY . .

# Change the owner of the files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Add a health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "node", "-e", "require('http').get('http://localhost:5000', (res) => process.exit(res.statusCode == 200 ? 0 : 1))" ]

# Define the command to run your app
CMD [ "node", "server.js" ]