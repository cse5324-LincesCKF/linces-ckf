# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ vars are baked into the bundle at build time, not runtime
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production stage ----
FROM nginx:1.25-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to support React Router (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
