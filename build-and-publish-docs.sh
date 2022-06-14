#!/bin/bash

# exit on non-0 command
set -e

# check for required env vars
function assertEnvVar() {
  VAR_NAME=$1
  VAR_VALUE=${!VAR_NAME}
  if [ -z "$VAR_VALUE" ]
  then
    echo "Environment variable \$$VAR_NAME is missing or empty"
    exit 1
  fi
}
assertEnvVar DEPLOY_GITHUB_URL
assertEnvVar DEPLOY_GITHUB_USER
assertEnvVar DEPLOY_GITHUB_TOKEN


# parse url parts from DEPLOY_GITHUB_URL, e.g. git://github.com/codertocat/hello-world.git
IFS=/ read -a fields <<<"$DEPLOY_GITHUB_URL"
HOST=${fields[2]}
ORG=${fields[3]}
REPO=${fields[4]}
REPO_NAME=${REPO::-4}

# use repo path as docs base path
export DOC_SITE_BASE_PATH="/$REPO_NAME"

# build github remote
GITHUB_REMOTE="https://$DEPLOY_GITHUB_USER:$DEPLOY_GITHUB_TOKEN@$HOST/$ORG/$REPO"

# clone repo
git clone --branch main --depth 1 "$GITHUB_REMOTE" /usr/app/_schema_repo

# build doc site to ./out
cd doc-site
yarn build
yarn export

# publish gh-pages
touch out/.nojekyll
git config --global user.email "hmedney@gmail.com"
git config --global user.name "Hunter Medney"
yarn gh-pages --dotfiles -d out --repo "$GITHUB_REMOTE"