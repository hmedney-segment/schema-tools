import {SchemaRepo} from '../shared/schema-lib/repo.js';

function eventDefinitionToTrackingPlanEvent(eventDefinition) {
  const eventProperties = Object.entries(eventDefinition.properties).reduce((map, entry) => {
    const [name, prop] = entry;
    prop.type = Array.isArray(prop.type) ? prop.type : [prop.type];
    return {...map, [name]: prop};
  }, {});

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
          properties: eventProperties,
          required: Object.entries(eventDefinition.properties)
            .filter((entry) => entry[1].required === true)
            .map((entry) => entry[0])
        }
      },
      required: ['properties']
    }
  };
}

function trackingPlanDefinitionToTrackingPlan(trackingPlanDefinition) {
  return {
    display_name: trackingPlanDefinition.title,
    rules: {
      events: trackingPlanDefinition.events.map(eventDefinitionToTrackingPlanEvent)
    },
    _definition: trackingPlanDefinition
  };
}

export function generateTrackingPlans(repoDir) {
  const repo = new SchemaRepo(repoDir);
  const trackingPlanDefinitions = repo.getTrackingPlans();
  return trackingPlanDefinitions.map(trackingPlanDefinitionToTrackingPlan);
}
