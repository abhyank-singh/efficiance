# Single-image build for Render / Railway / Fly / any Docker host.
# APP_MODE picks the build: "demo" (public showcase, default) or "personal" (your own copy).
ARG APP_MODE=demo

# ---- build stage ----
FROM node:22-alpine AS build
ARG APP_MODE
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Optional: free GoatCounter site code for anonymous product analytics (set as an env var on Render)
ARG VITE_GOATCOUNTER
ENV VITE_APP_MODE=$APP_MODE
ENV VITE_GOATCOUNTER=$VITE_GOATCOUNTER
RUN npm run build

# ---- runtime stage ----
FROM node:22-alpine
ARG APP_MODE
WORKDIR /app
ENV NODE_ENV=production
ENV APP_MODE=$APP_MODE
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY shared ./shared
COPY --from=build /app/dist ./dist
# PaaS hosts inject PORT; the server honors it. 8080 is the default.
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["node", "server/index.js"]
