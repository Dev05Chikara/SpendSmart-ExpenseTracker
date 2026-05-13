# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine AS runtime
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app
COPY --from=build /app/dist/spendsmart-client/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
