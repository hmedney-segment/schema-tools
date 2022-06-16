import {useState, useMemo} from 'react';
import debounce from 'lodash.debounce';
import {Search, Table, TableBody, TableRow, TableCell} from '@carbon/react';
import elasticlunr from 'elasticlunr';

function ResultsList({events}) {
  return (
    <Table>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.title}>
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

function SearchBar({onSearch, ...props}) {
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

  console.log({...props});
  return (
    <Search onChange={onChange} labelText="Search" {...props} />
    // <div>
    //   <form onSubmit={onSubmit}>
    //   </form>
    // </div>
  );
}

function SearchResults({searchIndex, searchString, events}) {
  const results = searchIndex.search(searchString, {expand: true});
  const matchingEvents = results.map((doc) => events.find((event) => event.title === doc.ref));
  return <ResultsList events={matchingEvents} />;
}

export default function EventSearch({events, ...props}) {
  const [searchString, setSearchString] = useState();
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
    <div {...props}>
      <div>
        <SearchBar onSearch={setSearchString} />
      </div>
      {searchString && <SearchResults searchIndex={searchIndex} searchString={searchString} events={events} />}
    </div>
  );
}
