FROM node:18

# Tentukan folder kerja
WORKDIR /usr/src/app
RUN npm install --production --legacy-peer-deps
# Salin package.json
COPY package*.json ./

# Install semua dependencies (tanpa --production dulu agar lebih stabil saat build)
RUN npm install

# Salin semua file
COPY . .

# Jalankan bot
CMD ["node", "bot_jalan.js"]
