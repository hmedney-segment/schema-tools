#!/bin/bash
source ./init.sh

# build NextJS static site and export to ./out
echo "Building Next.js static doc site with base path $GH_PAGES_BASE_PATH"
cd /usr/app/doc-site
yarn build
yarn export

# publish ./out to gh-pages
touch out/.nojekyll
git config --global user.email "$DEPLOY_GITHUB_USER_EMAIL"
git config --global user.name "$DEPLOY_GITHUB_USER_NAME"
yarn gh-pages --dotfiles -d out --repo "$GITHUB_REMOTE"