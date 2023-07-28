FROM node:lastest
WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT npm run start