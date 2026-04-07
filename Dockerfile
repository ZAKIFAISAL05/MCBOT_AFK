FROM node:18-slim

# Install library sistem untuk kompilasi modul
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Jalankan bot dengan perintah node
CMD [ "node", "bot_jalan.js" ]
