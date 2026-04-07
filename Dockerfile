FROM node:18-slim

WORKDIR /usr/src/app

# Copy package.json saja dulu
COPY package*.json ./

# Install library
RUN npm install --production

# Baru copy sisa kodenya
COPY . .

# Jalankan menggunakan node langsung
CMD ["node", "bot_bedrock.js"]
