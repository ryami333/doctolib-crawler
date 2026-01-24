# Use an official Node.js image
FROM node:24-slim

# Set working directory
WORKDIR /app

RUN corepack enable yarn

# Install Chromium for Puppeteer and required system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy dependency definitions
COPY package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

# Copy the rest of the app (including crawler.ts)
COPY . .

RUN yarn vite build

ENV TZ=Europe/Berlin

RUN chown -R 1000:1000 /app
USER 1000:1000

# Deliberately no CMD - one instance needs to run `node ./lib/worker.ts` and 
# the other needs to run `yarn next start`.

