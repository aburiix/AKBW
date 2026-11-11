# Build stage
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Production stage
EXPOSE 7000

CMD ["node", "index.js"]
