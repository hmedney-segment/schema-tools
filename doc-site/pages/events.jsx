import {getEvents} from '../lib/schema';
import EventCollectionTile from '../components/EventCollectionTile';
// import Masonry from 'react-masonry-css';
import Masonry from 'react-responsive-masonry';

export function getStaticProps() {
  const events = getEvents();

  // group events by collection
  const collectionMap = events.reduce((map, event) => {
    const {collection} = event;
    if (!map[collection]) {
      map[collection] = [];
    }
    map[collection].push(event);
    map[collection].sort();
    return map;
  }, {});

  // create sorted collections array
  const collections = Object.entries(collectionMap)
    .map(([collectionName, events]) => ({collectionName, events}))
    .sort((c1, c2) => c1.collectionName.localeCompare(c2.collectionName));

  // return static props for this page
  return {props: {collections}};
}

export default function EventsPage({collections}) {
  return (
    <div>
      <Masonry columnsCount={3} gutter="5">
        {collections.map(({collectionName, events}) => (
          <EventCollectionTile collectionName={collectionName} events={events} key={collectionName} className="m-3" />
        ))}
      </Masonry>
    </div>
  );
}
