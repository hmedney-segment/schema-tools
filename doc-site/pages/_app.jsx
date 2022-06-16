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
      <Header aria-label="Schema Docs">
        <HeaderName href="" prefix="Schema" onClick={goTo('/')}>
          Docs
        </HeaderName>
        <HeaderNavigation aria-label="Navigation">
          <HeaderMenuItem href="" onClick={goTo('/events')}>
            Browse
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
        <title>Schema Docs</title>
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
