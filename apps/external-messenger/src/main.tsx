import '@babel/polyfill';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './app/containers/app';
import './styles.scss';
 
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
    <HashRouter>
      <App />
    </HashRouter>
);