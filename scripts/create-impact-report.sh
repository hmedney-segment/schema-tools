#!/bin/bash
source /usr/app/scripts/init.sh > /dev/null

# create markdown diff report
node /usr/app/tools/commands/pr-checks/build-impact-report.js