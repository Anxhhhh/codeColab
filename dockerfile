#Build Front end

FROM node:20-alpine as  frontend-builder

COPY ./client /app 

WORKDIR /app

RUN npm install
 
RUN npm run build

  

FROM node:20-alpine

COPY ./server /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public 

CMD ["node", "server.js"]
