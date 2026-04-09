FROM node:18-alpine

# Instalasi library sistem yang dibutuhkan oleh beberapa package Node.js
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependensi (menggunakan ci lebih stabil untuk production)
RUN npm install --production --no-optional

# Copy seluruh source code
COPY . .

# Pastikan bot tidak dianggap crash oleh Railway karena tidak membuka port
# (Opsional: Railway butuh port terbuka agar statusnya 'Healthy')
EXPOSE 3000

# Jalankan bot
CMD ["node", "index.js"]
