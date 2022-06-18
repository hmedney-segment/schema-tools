import path from 'path';
import fsx from 'fs-extra';
import {SCHEMA_CLONE_DIR} from '../../lib/config.js';
import {generateTrackingPlans} from '../../lib/tracking-plans.js';

function main() {
  const trackingPlans = generateTrackingPlans(SCHEMA_CLONE_DIR);

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
