FROM node:20-alpine

# Install openssl for Prisma compatibility on Alpine
RUN apk add --update --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
