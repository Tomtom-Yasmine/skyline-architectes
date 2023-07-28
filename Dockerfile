FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm run dev
ENTRYPOINT npm run start