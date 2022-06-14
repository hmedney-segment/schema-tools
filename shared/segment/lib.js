import axios from 'axios';
import debug from 'debug';
import {SEGMENT_WORKSPACE, SEGMENT_CONFIG_API_TOKEN, SEGMENT_PAGE_SIZE} from '../../shared/config.js';

const log = debug('segment-api');

async function sendRequestWithPaging(request) {
  const fetchedPages = [];
  let next_page_token = null;
  let pageNum = 0;

  do {
    if (request.method === 'GET') {
      request.params = {...request.params, page_size: SEGMENT_PAGE_SIZE, page_token: next_page_token};
    }
    log('calling Segment: %o', request);
    const response = await axios(request);
    const {data} = response;
    fetchedPages.push(data);

    const reqPath = `/${request.url.split('/').slice(6).join('/')}`;
    console.log(`completed request ${request.method} to ${reqPath}, page ${++pageNum}`);

    next_page_token = data.next_page_token;
  } while (next_page_token != null && next_page_token !== '');

  return fetchedPages;
}

export async function callSegmentAPI({method = 'GET', path, params, data}) {
  try {
    const url = `https://platform.segmentapis.com/v1beta/workspaces/${SEGMENT_WORKSPACE}${path}`;

    const request = {
      url,
      method,
      params,
      data,
      headers: {Authorization: `Bearer ${SEGMENT_CONFIG_API_TOKEN}`, 'Content-Type': 'application/json'}
    };

    // get all pages of response data
    const pages = sendRequestWithPaging(request);
    return method === 'GET' ? pages : pages[0];
  } catch (e) {
    const {response} = e;
    if (response) {
      // don't include unnecessary response fields for axios errors
      throw new Error(
        `request to Segment API failed, response status: ${response.status}, response body: ${JSON.stringify(
          response.data,
          null,
          2
        )}`
      );
    }
    throw e;
  }
}
