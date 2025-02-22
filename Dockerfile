# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Define the command to run the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]