FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --only=production

# Copy backend source code
COPY backend/ ./backend/

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
