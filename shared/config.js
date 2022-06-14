import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

import {inspect} from 'util';
inspect.defaultOptions = {depth: 7};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: path.resolve(__dirname, '../.env')});

export const SEGMENT_WORKSPACE = process.env.SEGMENT_WORKSPACE;
export const SEGMENT_CONFIG_API_TOKEN = process.env.SEGMENT_CONFIG_API_TOKEN;
export const SEGMENT_PAGE_SIZE = 100;
export const SCHEMA_DIR = process.env.SCHEMA_DIR;
