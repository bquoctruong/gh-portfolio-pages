# Use the official Node.js 18 image as base
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
ENV PORT=8080
EXPOSE 8080

# Define the command to run your app
CMD ["node", "index.js"]
