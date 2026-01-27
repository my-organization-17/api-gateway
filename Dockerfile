FROM node:24-alpine AS dev

WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4004
CMD ["npm", "start"]