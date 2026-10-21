FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY api/package*.json ./api/
COPY sandbox-engine/package*.json ./sandbox-engine/
COPY ui/package*.json ./ui/

RUN npm install

COPY . .

RUN npm run build --if-present

EXPOSE 3000
CMD ["npm", "start", "--workspace=api"]
