import { Hono } from 'hono';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';
import schedule from 'node-schedule';
import { Logger } from './helper/logger';
import { serve } from '@hono/node-server'

const app = new Hono();
const port = process.env.PORT || 8989;

// Jadwal cron job setiap 3 menit
schedule.scheduleJob('*/3 * * * *', async () => {
  try {
    Logger.info('Starting listener...');
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    Logger.info('Listener started successfully.');
  } catch (error) {
    Logger.error('Error starting listener:', error);
  }
});

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});

// 404 handler
app.notFound((c) => c.text('Route not found', 404));

// Menambahkan server untuk mendengarkan pada 0.0.0.0
serve({
  fetch: app.fetch,
  port: 8989,
  hostname: '0.0.0.0'
}, () => {
  Logger.info(`[Hono-Service] Server is running on 0.0.0.0:8989`);
});
