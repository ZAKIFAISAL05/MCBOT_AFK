FROM node:18-alpine  # 🔥 Lebih kecil (82MB vs 900MB)

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production  # 🔥 Lebih cepat & bersih

# Copy source code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

CMD ["npm", "start"]
