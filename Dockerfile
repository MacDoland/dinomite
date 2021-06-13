FROM node:14.17.0-alpine
WORKDIR /app
COPY ./ .
RUN yarn install
RUN yarn run build:server

ENV NODE_ENV production

USER node
EXPOSE 3000
CMD ["npm", "run", "server"]