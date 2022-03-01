FROM node:16-alpine

RUN apk -U upgrade \
  && apk add --no-cache \
    git \
    openssh

USER node
# Create app directory
WORKDIR /home/node/angie

COPY --chown=node out/angie ./

RUN chmod 777 ./


LABEL org.opencontainers.image.source="https://github.com/landra-sistemas/angie"

ENV NODE_ENV="production"
ENV KEYCLOAK_URL="http://angie_keycloak:8080/auth"

EXPOSE 3105
EXPOSE 3106
CMD [ "node", "execute.js" ]