import getConfig from 'next/config.js';
import {SchemaRepo} from '../../tools/lib/schema.js';

const {serverRuntimeConfig} = getConfig();
const {repoDir} = serverRuntimeConfig;

let events;

// if repoDir not provided, use empty event to allow content-less build
if (repoDir != null) {
  console.log(`Reading events from dir ${repoDir}`);
  const schemaRepo = new SchemaRepo(repoDir);
  events = schemaRepo.getEvents();
} else {
  events = [];
}

console.log(`Number of events in schema: ${String(events.length)}`);

export function getEvents() {
  return events;
}
