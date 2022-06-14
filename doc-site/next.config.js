const path = require('path');
const fsx = require('fs-extra');

let repoDir = path.resolve(__dirname, process.env.SCHEMA_DIR || '../_schema_repo');
if (!fsx.existsSync(repoDir)) {
  console.warn(`repo dir "${repoDir}" not found`);
  repoDir = null;
}

module.exports = {
  basePath: process.env.DOC_SITE_BASE_PATH,
  serverRuntimeConfig: {
    repoDir
  }
};
