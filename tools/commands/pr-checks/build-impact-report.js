import fsx from 'fs-extra';
import simpleGit from 'simple-git';
import {markdownTable} from 'markdown-table';
import isEqual from 'lodash.isequal';
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
  eventsAdded.forEach((title) => changes.push({event: title, message: 'Event added'}));
  eventsRemoved.forEach((title) => changes.push({event: title, message: 'Event removed'}));
  eventsRemoved.forEach((title) =>
    warnings.push({event: title, message: 'Event was removed from the schema and will be blocked'})
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
    const commonPropPairs = commonPropNames.map((name) => {
      const currentProp = {...currentEvent[name], name};
      const newProp = {...newEvent[name], name};
      return {currentProp, newProp};
    });

    // add changes for added and removed props
    propNamesAdded.forEach((name) => changes.push({event: title, message: `Property \`${name}\` added`}));
    propNamesRemoved.forEach((name) => changes.push({event: title, message: `Property \`${name}\` removed`}));

    // add changes for changed props
    ['type', 'description', 'required'].forEach((field) => {
      commonPropPairs.forEach(({currentProp, newProp}) => {
        const {name} = currentProp;
        const currentValue = currentProp[field];
        const newValue = newProp[field];
        if (!isEqual(currentValue, newValue)) {
          changes.push({
            event: title,
            message: `Property field \`${name}.${field}\` changed: current value \`${currentValue}\`, new value: \`${newValue}\``
          });
        }
      });
    });

    // add warnings for new props that are required
    propNamesAdded
      .map((name) => ({...newEvent[name], name}))
      .filter((prop) => prop.required === true)
      .forEach((prop) =>
        warnings.push({
          event: title,
          message: `Events will be blocked unless they have new required property \`${prop.name}\``
        })
      );

    // add warning for removed props
    propNamesRemoved.forEach((name) =>
      warnings.push({event: title, message: `Property \`${name}\` was removed and will be omitted going forward`})
    );

    // add warning for newly required
    commonPropPairs
      .filter(({currentProp, newProp}) => newProp.required === true && currentProp.required !== true)
      .map((pair) => pair.newProp.name)
      .forEach((name) =>
        warnings.push({
          event: title,
          message: `Events will be blocked unless they have property \`${name}\`; this property isn't required presently`
        })
      );
  });

  // sort lists
  const sortKey = (m) => `${m.event}:${m.message}`;
  const sorter = (m1, m2) => sortKey(m1).localeCompare(sortKey(m2));
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

  ${markdownTable([['Event', 'Change'], ...changes.map((change) => [change.event, change.message])])}


  ### :warning: Warnings

  ${markdownTable([
    ['Event', 'Warning'],
    ...warnings.map((warning) => [warning.event, `:warning: ${warning.message}`])
  ])}
  `;

  console.log(report);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
