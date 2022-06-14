import path from 'path';
import slugify from '@sindresorhus/slugify';
import fsx from 'fs-extra';
import yaml from 'js-yaml';
import {assertNotNull, assertString} from '../util.js';

function titleToSlug(title) {
  return slugify(title);
}

export class SchemaRepo {
  repoPath;
  eventsPath;

  constructor(repoPath) {
    this.repoPath = repoPath;
    this.eventsPath = path.resolve(repoPath, 'events');
  }

  getEvents() {
    const fileNames = fsx.readdirSync(this.eventsPath);
    const filePaths = fileNames.map((fileName) => path.join(this.eventsPath, fileName));
    return filePaths.map((filePath) => this.loadEventFile(filePath));
  }

  deleteAllEvents() {
    fsx.emptyDirSync(this.eventsPath);
  }

  buildFilePath(title) {
    const fileName = `${titleToSlug(title)}.yaml`;
    return path.join(this.eventsPath, fileName);
  }

  loadEventFile(filePath) {
    if (!fsx.existsSync(filePath)) {
      return null;
    }
    const fileContent = fsx.readFileSync(filePath, 'utf-8');
    return yaml.load(fileContent);
  }

  saveEventFile(filePath, event) {
    const sortedProperties = event.properties.sort((p1, p2) => p1.name.localeCompare(p2.name));
    const normalizedEvent = {
      title: event.title,
      description: event.description,
      collection: event.collection,
      properties: sortedProperties,
      ...event
    };

    fsx.ensureDir(this.eventsPath);
    const fileContent = yaml.dump(normalizedEvent);
    fsx.writeFileSync(filePath, fileContent);
  }

  upsertEvent(event) {
    assertNotNull(event, 'event');
    assertString(event.title, 'event.title');

    // start with existing event or empty object
    const filePath = this.buildFilePath(event.title);
    const existingEvent = this.loadEventFile(filePath);
    let eventToSave = existingEvent || {};

    // merge updates
    eventToSave = {...eventToSave, ...event};

    // save
    this.saveEventFile(filePath, eventToSave);
  }
}
