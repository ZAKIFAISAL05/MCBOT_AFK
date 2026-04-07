FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Fix timezone (optional)
RUN apk add --no-cache tzdata
ENV TZ=Asia/Jakarta

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

CMD ["npm", "start"]
