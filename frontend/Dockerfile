# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production
RUN npm install --save-dev @types/node

# Copy all files
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]