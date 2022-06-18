const path = require('path');
const fsx = require('fs-extra');

let repoDir = path.resolve(__dirname, process.env.SCHEMA_CLONE_DIR || '../_schema_clone');
if (!fsx.existsSync(repoDir)) {
  console.warn(`repo dir "${repoDir}" not found`);
  repoDir = null;
}

module.exports = {
  basePath: process.env.GH_PAGES_BASE_PATH,
  serverRuntimeConfig: {
    repoDir
  }
};
