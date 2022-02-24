FROM node:16

# Create app directory
WORKDIR /home/node/angie

COPY --chown=node out/angie ./

USER node


ENV NODE_ENV="production"
ENV KEYCLOAK_URL="http://angie_keycloak:8080/auth"

EXPOSE 3105
EXPOSE 3106
CMD [ "node", "execute.js" ]