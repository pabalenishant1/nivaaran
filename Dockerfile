FROM node:20-alpine

WORKDIR /app

# Copy only server files
COPY server/package*.json ./server/
WORKDIR /app/server

RUN npm install

COPY server .

EXPOSE 4000

CMD ["npm", "start"]
