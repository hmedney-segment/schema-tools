import {Header, HeaderName, HeaderNavigation, HeaderMenuItem, Content} from '@carbon/react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import '../styles/index.scss';

function Layout({children}) {
  const router = useRouter();

  return (
    <div className="container">
      <Header aria-label="Segment Schema">
        <HeaderName
          href="#"
          prefix="Segment"
          onClick={() => {
            router.push('/');
            return false;
          }}
        >
          Schema
        </HeaderName>
        <HeaderNavigation aria-label="Navigation">
          <HeaderMenuItem onClick={() => router.push('/events')}>Events</HeaderMenuItem>
          <HeaderMenuItem onClick={() => router.push('/one-pager')}>One-pager</HeaderMenuItem>
        </HeaderNavigation>
      </Header>
      <Content>{children}</Content>
    </div>
  );
}

function App({Component, pageProps}) {
  return (
    <Layout>
      <Head>
        <title>Segment Schema</title>
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default App;
