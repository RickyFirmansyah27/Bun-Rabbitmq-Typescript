import { Hono } from 'hono';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';
import schedule from 'node-schedule';
import { Logger } from './helper/logger';
import { serve } from '@hono/node-server';

const app = new Hono();
const port = process.env.PORT || 3000; 

schedule.scheduleJob('*/3 * * * *', async () => {
  try {
    Logger.info('Starting listener...');
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    Logger.info('Listener started successfully.');
  } catch (error) {
    Logger.error('Error starting listener:', error);
  }
});

app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});

app.notFound((c) => c.text('Route not found', 404));

serve({
  fetch: app.fetch,
  port: typeof port === 'string' ? parseInt(port, 10) : port,
  hostname: '0.0.0.0' 
}, () => {
  Logger.info(`[Hono-Service] Server is running on http://0.0.0.0:${port}`);
});
