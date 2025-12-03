FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create upload directories
RUN mkdir -p uploads/reservations uploads/rooms

EXPOSE 8000

CMD ["node", "src/index.js"]
