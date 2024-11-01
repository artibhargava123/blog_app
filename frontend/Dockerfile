# Stage 1: Build the React app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the app's source code and build it
COPY . .
RUN npm run build

# Stage 2: Serve the React app using 'serve'
FROM node:18

# Install 'serve' globally
RUN npm install -g serve

# Copy the built files from the previous stage
COPY --from=build /app/build /app/build

# Expose the port 'serve' will run on
EXPOSE 3000

# Use 'serve' to serve the built files
CMD ["serve", "-s", "build", "-l", "3000"]




