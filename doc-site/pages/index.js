import EventSearch from '../components/EventSearch';
import {getEvents} from '../lib/schema';

export function getStaticProps() {
  return {props: {events: getEvents()}};
}

export default function Home({events}) {
  return <EventSearch events={events} />;
}
