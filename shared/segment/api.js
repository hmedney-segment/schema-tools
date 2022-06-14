import {callSegmentAPI} from './lib.js';
import {SEGMENT_WORKSPACE} from '../../shared/config.js';

function combinePages(pages, fieldName) {
  return pages.reduce((accum, page) => [...accum, ...page[fieldName]], []);
}

export async function getSources() {
  const pages = await callSegmentAPI({method: 'GET', path: '/sources'});
  return combinePages(pages, 'sources');
}

export async function createSource({name, type = 'javascript'}) {
  const data = {
    source: {
      name: `workspaces/${SEGMENT_WORKSPACE}/sources/${name}`,
      catalog_name: `catalog/sources/${type}`
    }
  };
  return callSegmentAPI({method: 'POST', path: '/sources', data});
}
