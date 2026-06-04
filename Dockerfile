# ===== Stage 1:  Build the app =====
FROM node:22-alpine AS builder

WORKDIR /app

# 預設從外網下載
ARG NPM_REGISTRY=https://registry.npmjs.org/
# 用 .npmrc 代替 npm config set 在容器全域的設定檔中寫入變數
# RUN npm config set registry $NPM_REGISTRY
RUN echo "registry=${NPM_REGISTRY}" > .npmrc

COPY package*.json ./

RUN npm ci

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
