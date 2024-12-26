FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all source files
COPY . .

# Ensure the .env file is loaded correctly
RUN npm install dotenv --save

EXPOSE 3030

CMD ["npm", "start"]
