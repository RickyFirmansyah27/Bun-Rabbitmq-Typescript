import { config } from 'dotenv';
import { Hono } from 'hono';
import { Logger } from './helper/logger';
import { httpLogger } from './helper/http-logger';
import { serverless } from './helper';
import schedule from 'node-schedule';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';

config();

const app = new Hono();
const port = process.env.PORT || 8989;

app.use('*', httpLogger);
// Routes
app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});

schedule.scheduleJob('*/3 * * * *', async () => {
  try {
    Logger.info('Starting listener...');
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    Logger.info('Listener started successfully.');
  } catch (error) {
    Logger.error('Error starting listener:', error);
  }
});
app.notFound((c) => c.text('Route not found', 404));

const server = serverless(app);

server.listen(Number(port), '0.0.0.0', () => {
  Logger.info(`[Hono-Service] Server is running on port ${port}`);
});
