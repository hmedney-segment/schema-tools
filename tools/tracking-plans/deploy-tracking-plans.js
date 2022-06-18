import {SCHEMA_CLONE_DIR} from '../shared/config.js';
import {getTrackingPlanList, createTrackingPlan, updateTrackingPlan} from '../shared/segment/api.js';
import {generateTrackingPlans} from './tracking-plans.js';
import {assertString} from '../shared/util.js';

async function main() {
  const generatedTrackingPlans = generateTrackingPlans(SCHEMA_CLONE_DIR);
  const segmentTrackingPlanList = await getTrackingPlanList();

  for (const generatedTrackingPlan of generatedTrackingPlans) {
    const segmentTrackingPlanName = segmentTrackingPlanList.find(
      (tp) => tp.display_name === generatedTrackingPlan.display_name
    )?.name;

    if (segmentTrackingPlanName) {
      const id = segmentTrackingPlanName.split('/')[3];
      assertString(id, 'tracking plan id');
      console.log(`found existing tracking plan with id ${id} - updating...`);
      const data = await updateTrackingPlan(id, generatedTrackingPlan);
      console.log('tracking plan updated successfully', data);
    } else {
      const data = await createTrackingPlan(generatedTrackingPlan);
      console.log('tracking plan created successfully', data);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
