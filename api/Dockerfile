FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=development
WORKDIR /app
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src

EXPOSE 8080
CMD ["npm", "run", "dev"]

