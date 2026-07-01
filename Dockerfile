# ===== Stage 1:  Build the app =====
FROM node:22-alpine AS builder

WORKDIR /app

ARG NPM_RC_FILE=.npmrc-public
COPY ${NPM_RC_FILE} ./.npmrc

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ===== Stage 2: Serve the app with Nginx =====
FROM nginx:stable-alpine AS production

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
