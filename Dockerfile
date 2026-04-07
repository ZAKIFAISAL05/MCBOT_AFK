FROM node:18

WORKDIR /usr/src/app

# Copy package.json dulu
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file
COPY . .

# Jalankan bot
CMD ["npm", "start"]
