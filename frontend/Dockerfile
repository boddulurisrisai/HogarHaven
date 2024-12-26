# Stage 1: Build the React App
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy all files and build the app
COPY . ./
RUN npm run build

# Stage 2: Serve the React App with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
