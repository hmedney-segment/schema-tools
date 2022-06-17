import {SchemaRepo} from '../shared/schema-lib/repo.js';
import {SCHEMA_DIR} from '../shared/config.js';

function eventToTrackingPlanRule(eventDefinition) {
  return {
    name: eventDefinition.title,
    description: eventDefinition.description,
    rules: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      labels: {
        collection: eventDefinition.collection
      },
      properties: {
        properties: {
          type: 'object',
          properties: eventDefinition.properties,
          required: Object.entries(eventDefinition.properties)
            .filter((entry) => entry[1].required === true)
            .map((entry) => entry[0])
        }
      },
      required: 'properties'
    }
  };
}

function trackingPlanDefinitionToTrackingPlan(trackingPlanDefinition) {
  return {
    display_name: trackingPlanDefinition.title,
    rules: {
      events: trackingPlanDefinition.events.map(eventToTrackingPlanRule)
    }
  };
}

function main() {
  const repo = new SchemaRepo(SCHEMA_DIR);
  const trackingPlanDefinitions = repo.getTrackingPlans();
  const trackingPlans = trackingPlanDefinitions.map(trackingPlanDefinitionToTrackingPlan);
  console.log(trackingPlans);
}

main();
