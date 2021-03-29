FROM node:14-alpine

# Necessary for timzone support
RUN apk add --no-cache tzdata

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies

# Bundle app source
COPY . .

EXPOSE 8090
CMD [ "node", "server.js" ]