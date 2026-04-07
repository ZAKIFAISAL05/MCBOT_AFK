FROM node:18

WORKDIR /usr/src/app

# 🔥 INSTALL BUILD TOOLS (INI KUNCI)
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  cmake \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

CMD ["npm", "start"]
