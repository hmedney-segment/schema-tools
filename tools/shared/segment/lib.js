import axios from 'axios';
import debug from 'debug';
import {SEGMENT_WORKSPACE, SEGMENT_CONFIG_API_TOKEN, SEGMENT_PAGE_SIZE} from '../config.js';

const log = debug('segment');

async function sendRequestWithPaging(request, usePaging) {
  const fetchedPages = [];
  let next_page_token = null;
  let pageNum = 0;

  do {
    if (usePaging) {
      request.params = {...request.params, page_size: SEGMENT_PAGE_SIZE, page_token: next_page_token};
    }
    log('calling Segment: %o with paging: %s', request, usePaging);
    const response = await axios(request);
    log('request url %s', response.request.path);
    log('response status: %i', response.status);
    log('response body: %s', response.data);
    const {data} = response;
    fetchedPages.push(data);

    const reqPath = `/${request.url.split('/').slice(6).join('/')}`;
    console.log(`completed request ${request.method} to ${reqPath}${usePaging ? `, page ${++pageNum}` : ''}`);

    next_page_token = data.next_page_token;
  } while (usePaging && next_page_token != null && next_page_token !== '');

  return fetchedPages;
}

export async function callSegmentAPI({method = 'GET', path, params, data, usePaging = false}) {
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
    const pages = await sendRequestWithPaging(request, usePaging);
    log('response pages: %o', pages);
    return usePaging ? pages : pages[0];
  } catch (e) {
    const {response} = e;
    if (response) {
      // don't include unnecessary response fields for axios errors
      throw new Error(
        `request to Segment API failed, request path: ${response.request.path}, response status: ${
          response.status
        }, response body: ${JSON.stringify(response.data, null, 2)}`
      );
    }
    throw e;
  }
}
