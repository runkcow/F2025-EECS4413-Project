
# frontend
FROM node:20-alpine AS builder
WORKDIR /app

# copy packages first and install dependencies
COPY frontend/package*.json frontend/
RUN npm install --prefix frontend

# copy source code
COPY frontend/ frontend/

# build frontend
RUN npm run build --prefix frontend

# backend
FROM node:20-alpine
WORKDIR /app

# copy packages first and install dependencies
COPY backend/package*.json backend/
RUN npm install --prefix backend

# copy source code
COPY backend/ backend/

# copy react build from builder to frontend
COPY --from=builder /app/frontend/dist frontend/dist

# use port 80
EXPOSE 80

# start server
CMD ["node", "backend/server.js"]
