import './styles/index.css';
import App from './app';
import renderShadeApp from '@tryghost/admin-x-framework/test/render-shade';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
renderShadeApp(App, {} as any);
