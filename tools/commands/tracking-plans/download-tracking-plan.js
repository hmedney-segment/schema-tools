import {getTrackingPlan} from '../../lib/segment/api.js';
import {assertString} from '../../lib/util.js';

async function main() {
  const id = process.argv[2];
  assertString(id, 'tracking plan id is a required arg');
  const data = await getTrackingPlan(id);
  process.stdout.write(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
