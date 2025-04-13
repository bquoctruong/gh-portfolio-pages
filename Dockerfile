# Use the official Node.js 18 image as base
FROM node:18-alpine AS builder

# Set default NODE_ENV value
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

# Remove unnecessary files
RUN rm -rf tests/ .github/ .git/ .gitignore

# Setup non-root user
RUN chown -R node:node /usr/src/app

# Security hardening
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
# For GCP Cloud Run, use PORT env var which defaults to 80
# PORT will be automatically set by Cloud Run
ENV HOST=0.0.0.0

# Copy from builder stage
WORKDIR /usr/src/app
COPY --from=builder --chown=node:node /usr/src/app /usr/src/app

# Modify system to allow node user to bind to privileged ports
RUN apk add --no-cache libcap dumb-init && \
    setcap 'cap_net_bind_service=+ep' $(which node) && \
    # Add security hardening packages
    apk add --no-cache tini && \
    # Remove unnecessary tools
    rm -rf /tmp/* && \
    # Set proper permissions
    chmod -R 755 /usr/src/app && \
    # Cleanup
    apk cache clean || true

# Switch to non-root user
USER node

# Expose port 80 as primary port, 8080 as secondary
# GCP Cloud Run will use the PORT environment variable (typically 8080)
EXPOSE 80 8080

# Use tini or dumb-init as entrypoint to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Define the command to run your app with explicit port setting
# Using PORT environment variable which will be provided by Cloud Run
CMD ["sh", "-c", "echo 'Starting server on port ${PORT:-80}' && node --require ./src/instrumentation.cjs src/index.js"]
