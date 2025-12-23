# ---- BASE IMAGE ----
FROM node:20-bullseye

# ---- INSTALL SYSTEM DEPENDENCIES (for whatsapp-web.js / puppeteer) ----
RUN apt-get update && apt-get install -y \
  chromium \
  ca-certificates \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# ---- ENV VARIABLES ----
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# ---- APP DIRECTORY ----
WORKDIR /app

# ---- COPY FILES ----
COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

# ---- EXPOSE PORT ----
EXPOSE 3000

# ---- START APP ----
CMD ["node", "server.js"]
