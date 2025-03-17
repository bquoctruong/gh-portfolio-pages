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

RUN chown -R node:node /usr/src/app

# Modify system to allow node user to bind to privileged ports
RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' $(which node)

USER node

# Expose the port the app runs on
EXPOSE 80 8080

# Define the command to run your app
CMD ["node", "--require", "src/instrumentation.js", "src/index.js"]
