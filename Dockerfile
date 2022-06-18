FROM node:16-alpine
WORKDIR /usr/app

RUN apk update && \
  apk upgrade --no-cache && \
  apk add --no-cache bash git

# install deps
COPY shared/package.json shared/yarn.lock ./shared/
COPY scripts/package.json scripts/yarn.lock ./scripts/
COPY tracking-plans/package.json tracking-plans/yarn.lock ./tracking-plans/
COPY doc-site/package.json doc-site/yarn.lock ./doc-site/
RUN yarn --cwd shared install --production
RUN yarn --cwd scripts install --production
RUN yarn --cwd tracking-plans install
RUN yarn --cwd doc-site install
RUN yarn cache clean

# copy remaining project files
COPY shared ./shared
COPY scripts ./scripts
COPY tracking-plans ./tracking-plans
COPY doc-site ./doc-site

# do an initial build of docs site w/ no events to make subsequent builds faster
RUN yarn --cwd doc-site build

COPY build-and-deploy-tracking-plans.sh .
COPY build-and-publish-docs.sh .
COPY init.sh .
