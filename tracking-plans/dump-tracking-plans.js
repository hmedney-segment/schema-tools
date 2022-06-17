import {SCHEMA_DIR} from '../shared/config.js';
import {generateTrackingPlans} from './tracking-plans.js';
import path from 'path';
import fsx from 'fs-extra';

function main() {
  const trackingPlans = generateTrackingPlans(SCHEMA_DIR);

  const dumpDir = process.argv[2];
  if (dumpDir) {
    fsx.ensureDirSync(dumpDir);
    trackingPlans.forEach((trackingPlan) => {
      const fileName = `${trackingPlan._definition._slug}.json`;
      const filePath = path.join(dumpDir, fileName);
      fsx.writeJSONSync(filePath, trackingPlan, {spaces: 2});
      console.log(`tracking plan written to ${filePath}`);
    });
  } else {
    process.stdout.write(JSON.stringify(trackingPlans, null, 2));
  }
}

main();
