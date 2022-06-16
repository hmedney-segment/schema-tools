import {useState, useMemo} from 'react';
import debounce from 'lodash.debounce';
import {useRouter} from 'next/router';
import {Search, Table, TableBody, TableRow, TableCell} from '@carbon/react';
import elasticlunr from 'elasticlunr';

function ResultsList({events}) {
  const router = useRouter();

  function goTo(route) {
    return (e) => {
      e.preventDefault();
      router.push(route);
      return false;
    };
  }

  return (
    <Table>
      <TableBody>
        {events.map((event) => (
          <TableRow
            key={event.title}
            style={{cursor: 'pointer'}}
            onMouseDown={(e) => e.preventDefault()}
            onClick={goTo(`/events/${event._slug}`)}
          >
            <TableCell>
              <strong>{event.title}</strong>
            </TableCell>
            <TableCell>{event.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SearchBar({onSearch}) {
  const [searchString, setSearchString] = useState();
  const debouncedOnSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  function onSubmit(e) {
    e.preventDefault();
    onSearch(searchString);
  }

  function onChange(e) {
    const {value} = e.target;
    const normalizedValue = value == null || value.trim() === '' ? null : value.trim();
    setSearchString(normalizedValue);
    debouncedOnSearch(normalizedValue);
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <Search onChange={onChange} labelText="Search" />
      </form>
    </div>
  );
}

function SearchResults({searchIndex, searchString, events}) {
  const results = searchIndex.search(searchString, {expand: true});
  const matchingEvents = results.map((doc) => events.find((event) => event.title === doc.ref));
  return <ResultsList events={matchingEvents} />;
}

export default function EventSearch({events, ...props}) {
  const [searchString, setSearchString] = useState();
  const [hasFocus, setHasFocus] = useState();

  const searchIndex = useMemo(() => {
    console.log(`Adding ${events.length} events to Elasticlunr.js index...`);
    const index = elasticlunr();
    index.addField('title');
    index.addField('description');
    index.setRef('title');
    events.forEach((event) => index.addDoc(event));
    return index;
  }, [events]);

  return (
    <div {...props} onFocus={() => setHasFocus(true)} onBlur={() => setHasFocus(false)}>
      <div>
        <SearchBar onSearch={setSearchString} />
      </div>
      {hasFocus && searchString && <SearchResults searchIndex={searchIndex} searchString={searchString} events={events} />}
    </div>
  );
}
