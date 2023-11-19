# Build stage
FROM node:21-alpine3.17 as builder
WORKDIR /app

COPY package*.json .
RUN npm i
COPY . .
RUN npm run build


# Use a lightweight Nginx image as the final image
FROM nginx:1.25.3-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# COPY package.json .
# COPY vite.config.ts .
# COPY .env .

# FROM nginx:1.23.1-alpine
# COPY --from=base /app/dist /usr/share/nginx/html
# COPY ./docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
# RUN npm i typescript
# EXPOSE 5173

# CMD [ "npm", "run", "dev" ]

