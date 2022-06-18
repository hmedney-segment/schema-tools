import {getSources, createSource} from '../../lib//segment/api.js';

async function main() {
  const existingSources = await getSources();
  const existingSourceNames = existingSources.map((existingSource) => existingSource.name.split('/')[3]);

  for (let i = 1; i <= 100; i++) {
    const seq = `000${String(i)}`.slice(-3);
    const name = `demo_product_${seq}`;
    if (existingSourceNames.includes(name)) {
      console.log(`source "${name}" already exists`);
      continue;
    }
    await createSource({name});
    console.log(`source ${name} created successfully`);
  }
}

main().catch((e) => console.error(e));
