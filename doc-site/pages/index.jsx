import {Grid, Column, Link} from '@carbon/react';
import EventSearch from '../components/EventSearch';
import {getEvents} from '../lib/schema';

export function getStaticProps() {
  return {props: {events: getEvents()}};
}

export default function Home({events}) {
  return (
    <div style={{marginTop: '200px'}}>
      <Grid className="">
        <Column lg={3} />
        <Column lg={10} className="text-center">
          <h1>Schema Docs</h1>

          <p>
            This is a demo site showing generated documentation for Segment events.
            <br />
            The site is regenerated whenever a Pull Request is merged to <code>main</code> in the{' '}
            <Link href="https://github.com/hmedney-segment/schema">schema repo</Link>.
          </p>

          <EventSearch events={events} className="mt-5" />
        </Column>
        <Column lg={3} />
      </Grid>
    </div>
  );
}
