import {inspect} from 'util';
inspect.defaultOptions = {depth: 10};

export const SEGMENT_WORKSPACE = process.env.SEGMENT_WORKSPACE;
export const SEGMENT_CONFIG_API_TOKEN = process.env.SEGMENT_CONFIG_API_TOKEN;
export const SEGMENT_PAGE_SIZE = 100;
export const SCHEMA_CLONE_DIR = process.env.SCHEMA_CLONE_DIR;
