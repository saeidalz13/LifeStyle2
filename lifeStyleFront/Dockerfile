# Build stage
FROM node:21-alpine3.17 as base
WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm run build

# Production stage
# FROM node:21-alpine3.17 as production
# WORKDIR /app

# COPY --from=base /dist /dist

COPY package.json .
COPY vite.config.ts .
COPY .env .

RUN npm i typescript
EXPOSE 5173

CMD [ "npm", "run", "dev" ]

