FROM docker.io/node:20-bullseye as builder
WORKDIR /opt/application

COPY ./ ./
RUN npm ci

COPY ./src ./src
RUN mv ./.docker-env ./.env
RUN npm run build

ENTRYPOINT [ "node", "dist/main.js" ] 