#!/bin/bash

source ./init.sh

export DOC_SITE_BASE_PATH=$GH_PAGES_BASE_PATH

# build NextJS static site and export to ./out
cd /usr/app/doc-site
yarn build
yarn export

# publish ./out to gh-pages
touch out/.nojekyll
git config --global user.email "$DEPLOY_GITHUB_USER_EMAIL"
git config --global user.name "$DEPLOY_GITHUB_USER_NAME"
yarn gh-pages --dotfiles -d out --repo "$GITHUB_REMOTE"