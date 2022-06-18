#!/bin/bash
source /usr/app/scripts/init.sh

# create markdown diff report
node /usr/app/tools/commands/pr-checks/build-impact-report.js