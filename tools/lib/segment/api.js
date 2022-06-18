import {callSegmentAPI} from './lib.js';
import {SEGMENT_WORKSPACE} from '../config.js';

function combinePages(pages, fieldName) {
  return pages.reduce((accum, page) => [...accum, ...page[fieldName]], []);
}

/******************************************************************/
/* Sources */
/******************************************************************/

export async function getSources() {
  const pages = await callSegmentAPI({method: 'GET', path: '/sources', usePaging: true});
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

/******************************************************************/
/* Tracking Plans */
/******************************************************************/

export async function getTrackingPlanList() {
  const data = await callSegmentAPI({method: 'GET', path: '/tracking-plans'});
  return data.tracking_plans;
}

export async function getTrackingPlan(id) {
  return callSegmentAPI({method: 'GET', path: `/tracking-plans/${encodeURIComponent(id)}`});
}

export async function createTrackingPlan(trackingPlan) {
  const data = {tracking_plan: trackingPlan};
  return callSegmentAPI({method: 'POST', path: `/tracking-plans`, data});
}

export async function updateTrackingPlan(id, trackingPlan) {
  const data = {
    update_mask: {paths: ['tracking_plan.display_name', 'tracking_plan.rules']},
    tracking_plan: trackingPlan
  };
  return callSegmentAPI({method: 'PUT', path: `/tracking-plans/${encodeURIComponent(id)}`, data});
}
