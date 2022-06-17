import {SchemaRepo} from '../shared/schema-lib/repo.js';
import {SCHEMA_DIR} from '../shared/config.js';

function definitionToTrackingPlan(definition) {
  //
}

function main() {
  const repo = new SchemaRepo(SCHEMA_DIR);
  const trackingPlanDefinitions = repo.getTrackingPlans();
  const trackingPlans = trackingPlanDefinitions.map(definitionToTrackingPlan);
}

main();
