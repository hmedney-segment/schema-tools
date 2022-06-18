FROM node:16-alpine
WORKDIR /usr/app

RUN apk update && \
  apk upgrade --no-cache && \
  apk add --no-cache bash git

# install deps
COPY tools/package.json tools/yarn.lock ./tools/
COPY doc-site/package.json doc-site/yarn.lock ./doc-site/
RUN yarn --cwd tools install
RUN yarn --cwd doc-site install
RUN yarn cache clean

# copy remaining project files
COPY tools ./tools
COPY doc-site ./doc-site

# do an initial build of docs site w/ no events to make subsequent builds faster
RUN yarn --cwd doc-site build

# copy scripts
COPY scripts ./scripts
