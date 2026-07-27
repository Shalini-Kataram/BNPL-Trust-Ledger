# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve app with Nginx
FROM nginx:alpine
# Copy built static files (use 'dist' if you use Vite, or 'build' if you use Create React App)
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

# Custom Nginx configuration for React Client-Side Routing
RUN echo 'server { \
    listen 8080; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]