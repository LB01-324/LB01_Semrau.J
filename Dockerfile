# Build stage
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Run eslint
RUN npm run lint || exit 1

# Run tests
RUN npm test || exit 1

# Build the application
RUN npm run build || exit 1

# Runner stage
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the build output from the build stage
COPY --from=build /app/build ./build

# Copy client files
COPY --from=build /app/client ./client

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
