FROM node:alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN yarn install --production --silent && mv node_modules ../
CMD yarn start