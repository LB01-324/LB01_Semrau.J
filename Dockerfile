# Build stage
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install

COPY . .

# Run linter, tests and build
RUN npm run lint || exit 1
RUN npm test || exit 1
RUN npm run build || exit 1

# Runner stage
FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy the build output from the build stage and client sources
COPY --from=build /app/build ./build
COPY --from=build /app/client ./client

EXPOSE 3000

CMD ["npm", "start"]
