FROM node:22-alpine as base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .

FROM base as prod
CMD ["npm", "start"]