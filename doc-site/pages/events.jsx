import {getEvents} from '../lib/schema';

export function getStaticProps() {
  return {props: {events: getEvents()}};
}

export default function EventsPage({events}) {
  return (
    <div>
      <ul>
        {events.map((event) => (
          <li key={event.title}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
}
