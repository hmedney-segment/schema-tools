import path from 'path';
import slugify from '@sindresorhus/slugify';
import fsx from 'fs-extra';
import yaml from 'js-yaml';
import matches from 'lodash.matches';
import uniqBy from 'lodash.uniqby';
import {assertNotNull, assertString} from '../util.js';

function titleToSlug(title) {
  return slugify(title);
}

export class SchemaRepo {
  repoPath;
  eventsPath;
  trackingPlansPath;

  constructor(repoPath) {
    this.repoPath = repoPath;
    this.eventsPath = path.resolve(repoPath, 'events');
    this.trackingPlansPath = path.resolve(repoPath, 'tracking-plans');
  }

  getTrackingPlans() {
    const fileNames = fsx.readdirSync(this.trackingPlansPath);
    const filePaths = fileNames.map((fileName) => path.join(this.trackingPlansPath, fileName));
    return filePaths.map((filePath) => this.loadTrackingPlanFile(filePath));
  }

  getEvents() {
    const fileNames = fsx.readdirSync(this.eventsPath);
    const filePaths = fileNames.map((fileName) => path.join(this.eventsPath, fileName));
    return filePaths.map((filePath) => this.loadEventFile(filePath));
  }

  deleteAllEvents() {
    fsx.emptyDirSync(this.eventsPath);
  }

  buildEventFilePath(title) {
    const fileName = `${titleToSlug(title)}.yaml`;
    return path.join(this.eventsPath, fileName);
  }

  loadFile(filePath) {
    if (!fsx.existsSync(filePath)) {
      return null;
    }
    const fileContent = fsx.readFileSync(filePath, 'utf-8');
    return yaml.load(fileContent, {
      onWarning: (e) => {
        throw e;
      }
    });
  }

  loadEventFile(filePath) {
    const event = this.loadFile(filePath);
    if (event == null) {
      return null;
    }

    // add computed props
    event._slug = titleToSlug(event.title);

    // does slug === filename?
    const fileName = path.parse(filePath).name;
    if (event._slug !== fileName) {
      console.warn(
        `Warning: event filename does not match title slug - filename: ${fileName}, slug: ${event._slug}, title: ${event.title}`
      );
    }

    return event;
  }

  loadTrackingPlanFile(filePath) {
    const trackingPlan = this.loadFile(filePath);
    if (trackingPlan == null) {
      return null;
    }

    // add all events that meet selector
    const allEvents = this.getEvents();
    const selector = trackingPlan.selector || [];
    const trackingPlanEvents = selector.reduce((allMatchedEvents, match) => {
      const matchedEvents = allEvents.filter(matches(match));
      return [...allMatchedEvents, ...matchedEvents];
    }, []);
    trackingPlan.events = uniqBy(trackingPlanEvents, '_slug');

    return trackingPlan;
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
    const filePath = this.buildEventFilePath(event.title);
    const existingEvent = this.loadEventFile(filePath);
    let eventToSave = existingEvent || {};

    // merge updates
    eventToSave = {...eventToSave, ...event};

    // save
    this.saveEventFile(filePath, eventToSave);
  }
}

export function findEvents(events, match) {
  const matcher = matches(match);
  return events.filter(matcher);
}
