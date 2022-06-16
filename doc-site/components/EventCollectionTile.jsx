import {Tile, Link} from '@carbon/react';
import {useRouter} from 'next/router';

export default function EventCollectionTile({collectionName, events, ...props}) {
  const router = useRouter();

  function goTo(route) {
    return (e) => {
      e.preventDefault();
      router.push(route);
      return false;
    };
  }

  return (
    <Tile {...props}>
      <h4>{collectionName}</h4>
      <ul>
        {events.map((event) => (
          <li key={event._slug}>
            <Link href="" onClick={goTo(`/event/${event._slug}`)}>
              {event.title}
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  );
}
