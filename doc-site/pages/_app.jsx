import {Header, HeaderName, HeaderNavigation, HeaderMenuItem, Content} from '@carbon/react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import '../styles/index.scss';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';

function Layout({children}) {
  const router = useRouter();

  function goTo(route) {
    return (e) => {
      e.preventDefault();
      router.push(route);
      return false;
    };
  }

  return (
    <div className="container">
      <Header aria-label="Segment Schema">
        <HeaderName href="" prefix="Segment" onClick={goTo('/')}>
          Schema
        </HeaderName>
        <HeaderNavigation aria-label="Navigation">
          <HeaderMenuItem href="" onClick={goTo('/events')}>
            Events
          </HeaderMenuItem>
          <HeaderMenuItem href="" onClick={goTo('/one-pager')}>
            One-pager
          </HeaderMenuItem>
        </HeaderNavigation>
      </Header>
      <Content>{children}</Content>
    </div>
  );
}

export default function App({Component, pageProps}) {
  return (
    <Layout>
      <Head>
        <title>Segment Schema</title>
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
