import {getEvents} from '../../lib/schema';
import {Tag, Table, TableHead, TableHeader, TableBody, TableRow, TableCell} from '@carbon/react';

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

function PropTable({title, properties, showHeader = true, className, size = 'lg'}) {
  // convert prop map to array and sort with required props first
  const getSortKey = (prop) => `${prop.required === true ? '0' : '1'}${prop.name}`;
  const sortedPropList = Object.entries(properties)
    .map(([key, prop]) => ({name: key, ...prop}))
    .sort((p1, p2) => getSortKey(p1).localeCompare(getSortKey(p2)));

  return (
    <div className={className}>
      {title && <h4>{title}</h4>}
      <Table className="w-auto" size={size}>
        {showHeader && (
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {sortedPropList.map((prop) => (
            <>
              <TableRow key={prop.name}>
                <TableCell>
                  <strong>{prop.name}</strong>
                </TableCell>
                <TableCell>{prop.type}</TableCell>
                <TableCell>{prop.description}</TableCell>
                <TableCell> {prop.required === true && <Tag type="teal">Required</Tag>}</TableCell>
              </TableRow>

              {/* render object array schema */}
              {prop.type === 'array' && prop.items?.properties && (
                <TableRow className="mt-0">
                  <TableCell colSpan="4" className="ps-4">
                    <p>
                      Elements of <code>{prop.name}</code> array:
                    </p>
                    <PropTable properties={prop.items.properties} showHeader={false} size="sm" />
                  </TableCell>
                </TableRow>
              )}

              {/* render object schema */}
              {prop.type === 'object' && prop.properties && (
                <TableRow className="mt-0">
                  <TableCell colSpan="4" className="ps-4">
                    <PropTable properties={prop.properties} showHeader={false} size="sm" />
                  </TableCell>
                </TableRow>
              )}
            </>
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
      <PropTable title="Event Properties" properties={event.properties} className="mt-5" />
      {event.context && <PropTable title="Context Properties" properties={event.context} className="mt-5" />}
    </div>
  );
}
