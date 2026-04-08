FROM node:18-alpine

WORKDIR /usr/src/app

# Copy & install
COPY package.json .
RUN npm install --production

# Copy code
COPY . .

# Run
CMD ["npm", "start"]
