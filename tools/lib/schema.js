import path from 'path';
import slugify from '@sindresorhus/slugify';
import fsx from 'fs-extra';
import yaml from 'js-yaml';
import matches from 'lodash.matches';
import uniqBy from 'lodash.uniqby';
import {assertNotNull, assertString, assertFileExists, sortMap} from './util.js';

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

  fileExists(filePath) {
    return fsx.existsSync(filePath);
  }

  loadFile(filePath) {
    assertFileExists(filePath);
    const fileContent = fsx.readFileSync(filePath, 'utf-8');
    return yaml.load(fileContent, {
      onWarning: (e) => {
        throw e;
      }
    });
  }

  loadEventFile(filePath) {
    const event = this.loadFile(filePath);

    // add slug from title
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

    // add slug from title
    trackingPlan._slug = titleToSlug(trackingPlan.title);

    // add all events that match the selectors
    const allEvents = this.getEvents();
    const event_selectors = trackingPlan.event_selectors || [];
    if (event_selectors.length > 0) {
      console.log();
      const trackingPlanEvents = event_selectors.reduce((allMatchedEvents, selector) => {
        // get events that match this selector and add to accumulator
        const matchedEvents = allEvents.filter(matches(selector));
        return [...allMatchedEvents, ...matchedEvents];
      }, []);

      // dedupe events in case multiple selectors match the same event
      const uniqueTrackingPlanEvents = uniqBy(trackingPlanEvents, '_slug');

      // attach events matching the selectors to the tracking plan itself
      trackingPlan._events = uniqueTrackingPlanEvents;
    } else {
      // no selectors defined - include all events
      trackingPlan._events = allEvents;
    }

    console.log(trackingPlan.title, trackingPlan._events.length);
    return trackingPlan;
  }

  saveEventFile(filePath, event) {
    const sortedProperties = sortMap(event.properties || {});
    const sortedContext = sortMap(event.context || {});
    const normalizedEvent = {
      title: event.title,
      description: event.description,
      collection: event.collection,
      properties: sortedProperties,
      context: sortedContext,
      ...event
    };

    // delete context field if not populated
    if (Object.keys(normalizedEvent.context).length === 0) {
      delete normalizedEvent.context;
    }

    fsx.ensureDir(this.eventsPath);
    const fileContent = yaml.dump(normalizedEvent);
    fsx.writeFileSync(filePath, fileContent);
  }

  upsertEvent(event) {
    assertNotNull(event, 'event');
    assertString(event.title, 'event.title');

    // start with existing event or empty object
    const filePath = this.buildEventFilePath(event.title);
    const existingEvent = this.fileExists(filePath) ? this.loadEventFile(filePath) : {};

    // merge updates
    const eventToSave = {...existingEvent, ...event};

    // save
    this.saveEventFile(filePath, eventToSave);
  }
}

export function findEvents(events, match) {
  const matcher = matches(match);
  return events.filter(matcher);
}
