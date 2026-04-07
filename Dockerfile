FROM node:18

# buat folder kerja
WORKDIR /usr/src/app

# copy package.json dulu
COPY package*.json ./

# install dependencies
RUN npm install

# copy semua file
COPY . .

# jalankan bot
CMD ["npm", "start"]
