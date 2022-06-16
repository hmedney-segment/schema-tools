import {getEvents} from '../../lib/schema';
import {Table, TableHead, TableHeader, TableBody, TableRow, TableCell} from '@carbon/react';

export function getStaticPaths() {
  const events = getEvents();
  return {
    paths: events.map((event) => ({
      params: {slug: event._slug}
    })),
    fallback: false
  };
}

export function getStaticProps({params}) {
  const events = getEvents();
  const event = events.find((event) => event._slug === params.slug);
  return {props: {event}};
}

function PropTable({title, props}) {
  return (
    <div className="mt-5">
      <h4>{title}</h4>
      <Table className="w-auto">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Description</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={props.name}>
              <TableCell>
                <strong>{prop.name}</strong>
              </TableCell>
              <TableCell>{prop.type}</TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function EventPage({event}) {
  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <PropTable title="Event Properties" props={event.properties} />
      {event.context && <PropTable title="Context Properties" props={event.context} />}
    </div>
  );
}
