FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json .
RUN npm install --production --no-optional

COPY . .

# Health check
HEALTHCHECK --interval=5m --timeout=10s \
  CMD node -e "console.log('alive')" || exit 1

CMD ["npm", "start"]
