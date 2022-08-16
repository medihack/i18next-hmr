import '../styles/globals.css';
import { applyClientHMR } from 'file-watch-hmr';

function MyApp({ Component, pageProps }) {
  applyClientHMR((changedFiles) => {
    console.log('Changed files: ', changedFiles);
  });

  return <Component {...pageProps} />;
}

export default MyApp;
