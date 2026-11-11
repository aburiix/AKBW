# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.build.json


# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./
# Copy generated prisma client to the location expected by compiled code in dist
COPY --from=builder /app/src/generated ./dist/generated
# Copy season images used by the adding-seasons script
COPY --from=builder /app/src/media ./media
COPY --from=builder /app/ecosystem.config.cjs ./

# Create logs directory
RUN mkdir -p /app/logs

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
