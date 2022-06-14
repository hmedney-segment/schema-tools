import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// input asserts
export function assertTrue(test, message) {
  if (test !== true) {
    throw new Error(message);
  }
}

export function assertNotNull(value, name) {
  assertTrue(value != null, `${name} is null`);
}

export function assertString(value, name) {
  assertNotNull(value, name);
  assertTrue(typeof value === 'string', `${name} is not a string`);
  assertTrue(value.trim().length > 0, `${name} is empty`);
}

export function assertArray(value, name) {
  assertNotNull(value, name);
  assertTrue(Array.isArray(value), `${name} is not a string`);
}

export function assertRegex(value, regex, name, message) {
  assertString(value, name);
  assertTrue(regex.test(value), `${name}: ${message}`);
}

export function assertOneOf(value, allowedValues, name) {
  assertString(value, name);
  assertArray(allowedValues);
  assertTrue(
    allowedValues.includes(value),
    `${name}: "${value}" is invalid; valid values are ${JSON.stringify(allowedValues)}`
  );
}

export function readLocalFileSync(localPath) {
  return fs.readFileSync(path.join(__dirname, '..', localPath), 'utf-8');
}
