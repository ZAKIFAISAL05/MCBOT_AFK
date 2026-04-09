FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package first (cache)
COPY package.json .

# Install
RUN npm install --production --no-optional

# Copy source
COPY . .

# Railway health
EXPOSE 3000

CMD ["npm", "start"]
