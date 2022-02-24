FROM node:16-alpine

# Create app directory
WORKDIR /home/node/angie

COPY --chown=node out/angie ./

RUN chmod 755 ./ -R

USER node

LABEL org.opencontainers.image.source="https://github.com/landra-sistemas/angie"

ENV NODE_ENV="production"
ENV KEYCLOAK_URL="http://angie_keycloak:8080/auth"

EXPOSE 3105
EXPOSE 3106
CMD [ "node", "execute.js" ]