FROM node:16.3.0-alpine

WORKDIR /usr/src/app

COPY .babelrc .

COPY package*.json ./

COPY yarn.lock .

RUN yarn

COPY src src

RUN yarn run build

ENV PORT=8080

EXPOSE 8080

ENV NODE_START_CMD=./dist/index.js

CMD [ "node", "./dist/index.js" ]