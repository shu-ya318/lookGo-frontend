# ===== Stage 1:  Build the app =====
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc ./

RUN npm install

COPY . .

RUN npm run build

# ===== Stage 2: Serve the app with Nginx =====
FROM nginx:stable-alpine AS production

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
