FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8083

EXPOSE 8083

CMD ["node", "app.js"]