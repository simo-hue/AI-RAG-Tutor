FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/ai-services/package.json ./packages/ai-services/
COPY packages/audio-services/package.json ./packages/audio-services/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages
RUN npm run build --workspace=@ai-speech-evaluator/shared
RUN npm run build --workspace=@ai-speech-evaluator/database
RUN npm run build --workspace=@ai-speech-evaluator/ai-services
RUN npm run build --workspace=@ai-speech-evaluator/audio-services

# Build backend
RUN npm run build --workspace=@ai-speech-evaluator/backend

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install ffmpeg for audio processing
RUN apk add --no-cache ffmpeg

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/packages ./packages
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p ./uploads && chown -R backend:nodejs ./uploads

USER backend

EXPOSE 3001

ENV PORT 3001

CMD ["node", "dist/server.js"]