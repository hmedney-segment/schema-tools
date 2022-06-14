import {parse} from 'csv/sync';
import {SchemaRepo} from '../shared/schema-lib/repo.js';
import {SCHEMA_DIR} from '../shared/config.js';
import {assertString, assertNotNull, readLocalFileSync} from '../shared/util.js';

function rowsToEvents(rows) {
  const eventMap = {};

  rows.forEach((row) => {
    const {collection, event_title, event_desc, prop_name, prop_type, prop_desc} = row;
    assertString(event_title, 'Event title');
    if (eventMap[event_title] == null) {
      eventMap[event_title] = {
        title: event_title,
        collection: collection,
        description: event_desc,
        propertiesMap: {}
      };
    }
    const currentEvent = eventMap[event_title];

    if (prop_name.indexOf('.$.') === -1) {
      // normal prop row
      currentEvent.propertiesMap[prop_name] = {
        name: prop_name,
        type: prop_type.toLowerCase(),
        description: prop_desc
      };
    } else {
      // row refers to a prop of an object in an array
      const [parentPropName, childPropName] = prop_name.split('.$.');
      const prop = currentEvent.propertiesMap[parentPropName];
      assertNotNull(prop, `prop not found in map; event and row=${JSON.stringify({currentEvent, row})}`);
      prop.items = prop.items || {type: 'object'};
      prop.items.properties = prop.items.properties || {};
      prop.items.properties[childPropName] = {
        name: childPropName,
        type: prop_type.toLowerCase(),
        description: prop_desc
      };
    }
  });

  const events = Object.values(eventMap);
  events.forEach((event) => {
    event.properties = Object.values(event.propertiesMap).sort();
    delete event.propertiesMap;
  });

  return events;
}

function main() {
  const csvContent = readLocalFileSync('data/events.csv');
  const rows = parse(csvContent, {skip_empty_lines: true, columns: true, trim: true});
  const events = rowsToEvents(rows);

  const repo = new SchemaRepo(SCHEMA_DIR);
  repo.deleteAllEvents();
  events.forEach((event) => repo.upsertEvent(event));

  console.log(repo.getEvents());
}

main();
