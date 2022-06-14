FROM node:16-alpine
WORKDIR /usr/app

RUN apk update && \
  apk upgrade --no-cache && \
  apk add --no-cache bash git

COPY shared ./shared
COPY scripts ./scripts
COPY doc-site ./doc-site

# install deps
RUN yarn --cwd shared install --production
RUN yarn --cwd scripts install --production
RUN yarn --cwd doc-site install
RUN yarn cache clean

# do an initial build of docs site w/ no events to make subsequent builds faster
RUN yarn --cwd doc-site build

COPY build-and-publish-docs.sh .