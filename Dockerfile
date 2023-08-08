FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma migrate dev
ENTRYPOINT npm run dev
