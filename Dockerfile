# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy only necessary files, excluding sensitive data
COPY public ./public
COPY src ./src
COPY index.html ./
COPY vite.config.js ./
COPY tsconfig.json ./
COPY .eslintrc.cjs ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Set correct permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Define the command to run the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]