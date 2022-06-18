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
assertEnvVar DEPLOY_GITHUB_USER_NAME
assertEnvVar DEPLOY_GITHUB_USER_EMAIL

# parse url parts from DEPLOY_GITHUB_URL, e.g. git://github.com/codertocat/hello-world.git
IFS=/ read -a fields <<< "$DEPLOY_GITHUB_URL"
HOST=${fields[2]}
ORG=${fields[3]}
REPO=${fields[4]}
REPO_NAME=${REPO::-4}

# use repo path as docs base path
export GH_PAGES_BASE_PATH="/$REPO_NAME"

# build github remote
export GITHUB_REMOTE="https://$DEPLOY_GITHUB_USER:$DEPLOY_GITHUB_TOKEN@$HOST/$ORG/$REPO"


# clone repo
export SCHEMA_DIR=/usr/app/_schema_repo
git clone --branch main --depth 1 "$GITHUB_REMOTE" $SCHEMA_DIR