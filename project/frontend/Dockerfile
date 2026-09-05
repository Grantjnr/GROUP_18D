FROM node:20-alpine

WORKDIR /app

# Expose the metro bundler port
EXPOSE 8081

# Install dependencies FIRST to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Run the Expo development server
CMD ["npx", "expo", "start", "--host", "lan"]
