# Tools for automating Segment tracking plan deployment and documentation

Manual build

```sh
docker build . -t hmedney/segment-schema-tools:latest
docker push hmedney/segment-schema-tools:latest
```

Local dev

```sh
# start doc container in dev mode
docker-compose up docs_dev

# run doc build and publish script
docker-compose run scripts scripts/build-and-publish-docs.sh

# run tracking plan deploy script
docker-compose run scripts scripts/build-and-deploy-tracking-plans.sh

# dump all generated tracking plans to stdout
docker-compose run scripts tools/commands/tracking-plans/dump-tracking-plans.js

# process tracking plans through jq to get tracking plan names and events
docker-compose run scripts tools/commands/tracking-plans/dump-tracking-plans.js | jq .[].display_name
docker-compose run scripts tools/commands/tracking-plans/dump-tracking-plans.js | jq .[].rules.events[].name
```
