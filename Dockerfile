# Root Dockerfile for Back4app
FROM node:18-slim

WORKDIR /app

# Copy the backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the backend source code
COPY backend/ .

# Bind the port
EXPOSE 10000

# Start the backend server
CMD [ "node", "server.js" ]
