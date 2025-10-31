# Use the official Node.js runtime as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild native dependencies for the current platform
RUN npm rebuild

# Accept MODE as build argument
ARG MODE=staging
ENV MODE=${MODE}

# Build the application for static deployment
RUN npm run build:preview:${MODE}

# Production image, copy all the files and serve with a simple HTTP server
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port that Cloud Run will use
EXPOSE 8080

# Use serve to serve the static files on the PORT environment variable
CMD ["sh", "-c", "serve -s ./dist -l ${PORT:-8080}"]
