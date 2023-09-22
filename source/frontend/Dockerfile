FROM docker.io/node:20-bullseye as builder
WORKDIR /opt/application/

COPY ./ ./

WORKDIR /opt/application/frontend
RUN npm ci

RUN npm run build

FROM nginx:1.25
COPY --from=builder /opt/application/frontend/dist/frontend /usr/share/nginx/html
COPY --from=builder /opt/application/frontend/server.conf /opt/application/frontend/server.conf

RUN mv /opt/application/frontend/server.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
