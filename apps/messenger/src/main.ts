import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import 'global';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
