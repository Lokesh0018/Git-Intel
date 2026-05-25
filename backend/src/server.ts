import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

await connectDatabase();

createApp().listen(env.PORT, () => {
  console.log(`GitIntel API listening on port ${env.PORT}`);
});
