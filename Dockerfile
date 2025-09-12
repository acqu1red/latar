FROM node:20-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd backend && npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
