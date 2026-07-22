FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy compiled backend
COPY --from=backend-build /app/backend/dist ./backend/dist

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 5000

CMD ["node", "backend/dist/index.js"]
