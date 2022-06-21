import fsx from 'fs-extra';
import simpleGit from 'simple-git';
import {markdownTable} from 'markdown-table';
import {GITHUB_PR_FROM_REF, GITHUB_PR_TO_REF, SCHEMA_CLONE_DIR} from '../../lib/config.js';
import {assertString, assertTrue} from '../../lib/util.js';
import {trackingPlanDefinitionToTrackingPlan} from '../../lib/tracking-plans.js';
import {SchemaRepo} from '../../lib/schema.js';

function createImpactReport(currentMap, newMap) {
  const changes = [];
  const warnings = [];

  const currentEventTitles = Object.keys(currentMap);
  const newEventTitles = Object.keys(newMap);
  const eventsAdded = newEventTitles.filter((title) => !currentEventTitles.includes(title));
  const eventsRemoved = currentEventTitles.filter((title) => !newEventTitles.includes(title));
  eventsAdded.forEach((title) => changes.push({event: title, change: 'Event added'}));
  eventsRemoved.forEach((title) => changes.push({event: title, change: 'Event removed'}));
  eventsRemoved.forEach((title) =>
    warnings.push({event: title, warning: 'Event was removed from the schema and will be blocked'})
  );

  const commonEventTitles = newEventTitles.filter((title) => currentEventTitles.includes(title));
  commonEventTitles.forEach((title) => {
    const currentEvent = currentMap[title];
    const newEvent = newMap[title];
    const currentPropNames = Object.keys(currentEvent);
    const newPropNames = Object.keys(newEvent);
    const propNamesAdded = newPropNames.filter((name) => !currentPropNames.includes(name));
    const propNamesRemoved = currentPropNames.filter((name) => !newPropNames.includes(name));
    const commonPropNames = newPropNames.filter((name) => currentPropNames.includes(name));

    propNamesAdded.forEach((name) => changes.push({event: title, change: `Property \`${name}\` added`}));
    propNamesRemoved.forEach((name) => changes.push({event: title, change: `Property \`${name}\` removed`}));

    // are any new props required?
    const newRequiredPropNames = propNamesAdded
      .map((name) => ({...newEvent[name], name}))
      .filter((prop) => prop.required === true)
      .map((prop) => prop.name);

    // add warnings for new required props
    newRequiredPropNames.forEach((name) =>
      warnings.push({event: title, warning: `Events now require new property \`${name}\``})
    );

    // add warning for removed props
    propNamesRemoved.forEach((name) =>
      warnings.push({event: title, warning: `Property \`${name}\` was removed from the schema and will be omitted`})
    );
  });

  // sort lists
  const sorter = (e1, e2) => e1.event.localeCompare(e2.event);
  changes.sort(sorter);
  warnings.sort(sorter);

  return {changes, warnings};
}

function getTrackingPlanEventMap() {
  const schema = new SchemaRepo(SCHEMA_CLONE_DIR);
  const events = schema.getEvents();
  const trackingPlanDefinition = {title: 'All', _events: events};
  const trackingPlan = trackingPlanDefinitionToTrackingPlan(trackingPlanDefinition);
  return trackingPlan.rules.events.reduce((map, event) => {
    // bring required flag to prop level for easier diff
    const eventProps = event.rules.properties.properties.properties;
    const requiredPropNames = event.rules.properties.properties.required || [];
    Object.keys(eventProps).forEach(
      (propName) => (eventProps[propName].required = requiredPropNames.includes(propName))
    );
    return {...map, [event.name]: eventProps};
  }, {});
}

async function main() {
  assertString(SCHEMA_CLONE_DIR, 'SCHEMA_CLONE_DIR');
  assertString(GITHUB_PR_FROM_REF, 'GITHUB_PR_FROM_REF');
  assertString(GITHUB_PR_TO_REF, 'GITHUB_PR_TO_REF');
  assertTrue(fsx.existsSync(SCHEMA_CLONE_DIR), `Path ${SCHEMA_CLONE_DIR} does not exist`);
  assertTrue(fsx.statSync(SCHEMA_CLONE_DIR).isDirectory(), `Path ${SCHEMA_CLONE_DIR} is not a directory`);

  // get current and new tracking plans
  const git = simpleGit({baseDir: SCHEMA_CLONE_DIR});
  await git.checkout(GITHUB_PR_FROM_REF);
  const newTrackingPlanEventMap = getTrackingPlanEventMap();
  await git.checkout(GITHUB_PR_TO_REF);
  const currentTrackingPlanEventMap = getTrackingPlanEventMap();

  // compute diffs
  const {changes, warnings} = createImpactReport(currentTrackingPlanEventMap, newTrackingPlanEventMap);

  const report = `
  # Schema Impact Report

  ### :notebook: All changes

  ${markdownTable([['Event', 'Change'], ...changes.map((change) => [change.event, change.change])])}

  
  ### :warning: Warnings

  ${markdownTable([['Event', 'Warning'], ...warnings.map((warning) => [warning.event, warning.warning])])}
  `;

  console.log(report);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
