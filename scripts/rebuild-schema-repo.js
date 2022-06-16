import {parse} from 'csv/sync';
import {SchemaRepo} from '../shared/schema-lib/repo.js';
import {SCHEMA_DIR} from '../shared/config.js';
import {assertString, assertNotNull, readLocalFileSync} from '../shared/util.js';

/**
 * Convert csv rows to event array
 */
function rowsToEvents(rows) {
  const eventMap = {};

  rows.forEach((row) => {
    // parse csv row
    const {collection, event_title, event_desc, prop_name, prop_type, prop_desc} = row;
    assertString(event_title, 'Event title');

    // get or create event in event map
    if (eventMap[event_title] == null) {
      eventMap[event_title] = {
        title: event_title,
        collection: collection,
        description: event_desc,
        propertiesMap: {}
      };
    }
    const currentEvent = eventMap[event_title];

    // add the prop on this row to the event
    if (prop_name.indexOf('.$.') === -1) {
      // normal prop row
      currentEvent.propertiesMap[prop_name] = {
        name: prop_name,
        type: prop_type.toLowerCase(),
        description: prop_desc
      };
    } else {
      // row refers to a prop of an object in an array
      // assumes the parent array prop row has already been processed
      const [parentPropName, childPropName] = prop_name.split('.$.');
      const prop = currentEvent.propertiesMap[parentPropName];
      assertNotNull(prop, `prop not found in map; event and row=${JSON.stringify({currentEvent, row})}`);

      // create items.properties map which has the schema for the array elements
      prop.items = prop.items || {type: 'object'};
      prop.items.properties = prop.items.properties || {};

      // add this row's prop to item.properties
      prop.items.properties[childPropName] = {
        name: childPropName,
        type: prop_type.toLowerCase(),
        description: prop_desc
      };
    }
  });

  // event map to event array
  const events = Object.values(eventMap);

  // prop map to prop array (also remove prop map field)
  events.forEach((event) => {
    event.properties = Object.values(event.propertiesMap).sort();
    delete event.propertiesMap;
  });

  return events;
}

function main() {
  assertString(SCHEMA_DIR, `Specify dir to create events in SCHEMA_DIR env var`);

  const csvContent = readLocalFileSync('data/events.csv');
  const rows = parse(csvContent, {skip_empty_lines: true, columns: true, trim: true});
  const events = rowsToEvents(rows);

  const repo = new SchemaRepo(SCHEMA_DIR);
  repo.deleteAllEvents();
  events.forEach((event) => repo.upsertEvent(event));

  const generatedEvents = repo.getEvents();
  console.log(`successfully generated ${String(generatedEvents.length)} events in ${SCHEMA_DIR}`);
}

main();
