# Tools for automating Segment tracking plan deployment and documentation

Manual build

```sh
docker build . -t hmedney/segment-schema-tools:latest
docker push hmedney/segment-schema-tools:latest
```

Local dev

```sh
# build and publish site
docker-compose run docs_build ./build-and-publish-docs.sh

# start doc container in dev mode
# export SCHEMA_DIR=<path_to_schema_repo>
docker-compose up docs_dev
```

Get all event names in tracking plan

```sh
node tracking-plans/dump-tracking-plans.js | jq .[].rules.events[].name
```
