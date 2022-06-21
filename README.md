# Tools for automating Segment tracking plan deployment and documentation

This project creates a single container image with all the tools present for the GitHub Actions supporting the [schema repo](https://github.com/hmedney-segment/schema).

## Local commands

Below are some useful commands for local development of the schema tooling.

```sh
# start doc site NextJS app in dev mode
docker-compose up docs_dev

# dump all generated tracking plans to stdout (uses schema dir defined in HOST_SCHEMA_CLONE_DIR)
docker-compose run --rm scripts tools/commands/tracking-plans/dump-tracking-plans.js

# dump all generated tracking plans to ./local (/pwd is mapped to current dir in docker-compose)
docker-compose run --rm scripts tools/commands/tracking-plans/dump-tracking-plans.js /pwd/local
```

Commands to run core steps in GitHub Actions locally (requires `.env` to be populated - see [.env.template](.env.template))

```sh
# clone schema repo and run tracking plan deploy script
docker-compose run --rm scripts scripts/build-and-deploy-tracking-plans.sh

# clone schema repo and run PR impact report script (uses branch name in GITHUB_PR_FROM_REF)
docker-compose run --rm scripts scripts/create-impact-report.sh

# clone schema repo and run doc build and publish script
docker-compose run --rm scripts scripts/build-and-publish-docs.sh
```
