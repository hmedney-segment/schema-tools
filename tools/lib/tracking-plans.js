import {SchemaRepo} from './schema.js';

function eventDefinitionToTrackingPlanEvent(eventDefinition) {
  // build list of required props from required fields
  const requiredProps = Object.entries(eventDefinition.properties)
    .filter(([_, prop]) => prop.required === true)
    .map(([name, _]) => name)
    .sort();

  // normalize event props
  const eventProperties = Object.entries(eventDefinition.properties)
    .sort((e1, e2) => e1[0].localeCompare(e2[0]))
    .reduce((map, entry) => {
      const [name, prop] = entry;

      // coerce array for type
      prop.type = Array.isArray(prop.type) ? prop.type.sort() : [prop.type];

      // delete required field (not standard json schema)
      delete prop.required;

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
          required: requiredProps
        }
      },
      required: ['properties']
    }
  };
}

export function trackingPlanDefinitionToTrackingPlan(trackingPlanDefinition) {
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
