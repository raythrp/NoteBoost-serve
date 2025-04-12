# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy entire project (except what's in .dockerignore if it exists)
COPY . .

# Set environment port for Cloud Run
ENV PORT=8080

# Expose port (Cloud Run uses this)
EXPOSE 8080

# Start the app
CMD [ "npm", "start" ]