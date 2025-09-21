FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd backend && npm install --only=production

# Copy backend source code
COPY backend/ ./backend/

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose port
EXPOSE 3001

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["node", "server.mjs"]
