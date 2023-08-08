FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma migrate deploy
ENTRYPOINT npm run dev
