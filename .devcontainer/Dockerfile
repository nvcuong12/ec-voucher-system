FROM node:20-alpine

# Install necessary tools
RUN apk add --no-cache git curl bash

WORKDIR /workspace/backend

# Copy package files first for layer caching
COPY backend/package*.json ./

RUN npm install

# Copy source
COPY backend/ .

EXPOSE 5000

CMD ["npm", "run", "dev"]
