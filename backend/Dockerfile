FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source
COPY . .

# Exposure (if any server is running - assuming 3001)
EXPOSE 3001

# Run the TypeScript entry point using ts-node
CMD ["npx", "ts-node", "src/index.ts"]
