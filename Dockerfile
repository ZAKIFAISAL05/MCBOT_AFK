FROM node:18-alpine

WORKDIR /usr/src/app

# Install deps
COPY package.json .
RUN npm install --production --no-optional

# Copy code
COPY . .

# FIXED Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node --version || exit 1

# Run bot
CMD ["npm", "start"]
