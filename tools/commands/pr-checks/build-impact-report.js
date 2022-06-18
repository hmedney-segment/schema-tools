import fsx from 'fs-extra';
import simpleGit from 'simple-git';
import {GITHUB_PR_FROM_REF, GITHUB_PR_TO_REF, SCHEMA_CLONE_DIR} from '../../lib/config.js';
import {assertString, assertTrue} from '../../lib/util.js';
import {trackingPlanDefinitionToTrackingPlan} from '../../lib/tracking-plans.js';
import {SchemaRepo} from '../../lib/schema.js';
import {diff, addedDiff, deletedDiff, updatedDiff, detailedDiff} from 'deep-object-diff';

function getTrackingPlanEventMap() {
  const schema = new SchemaRepo(SCHEMA_CLONE_DIR);
  const events = schema.getEvents();
  const trackingPlanDefinition = {title: 'All', events};
  const trackingPlan = trackingPlanDefinitionToTrackingPlan(trackingPlanDefinition);
  return trackingPlan.rules.events.reduce((map, event) => {
    return {...map, [event.name]: event.rules.properties.properties.properties};
  }, {});
}

async function main() {
  assertString(SCHEMA_CLONE_DIR, 'SCHEMA_CLONE_DIR');
  assertString(GITHUB_PR_FROM_REF, 'GITHUB_PR_FROM_REF');
  assertString(GITHUB_PR_TO_REF, 'GITHUB_PR_TO_REF');
  assertTrue(fsx.existsSync(SCHEMA_CLONE_DIR), `Path ${SCHEMA_CLONE_DIR} does not exist`);
  assertTrue(fsx.statSync(SCHEMA_CLONE_DIR).isDirectory(), `Path ${SCHEMA_CLONE_DIR} is not a directory`);

  const git = simpleGit({baseDir: SCHEMA_CLONE_DIR});
  const {branches} = await git.branch();
  const originalBranch = Object.entries(branches)
    .filter(([branchName, branchData]) => branchData.current === true)
    .map(([branchName, branchData]) => branchName)[0];

  await git.checkout(GITHUB_PR_FROM_REF);
  const newTrackingPlanEventMap = getTrackingPlanEventMap();
  await git.checkout(GITHUB_PR_TO_REF);
  const currentTrackingPlanEventMap = getTrackingPlanEventMap();

  const changes = detailedDiff(currentTrackingPlanEventMap, newTrackingPlanEventMap);
  console.log(JSON.stringify(changes, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
