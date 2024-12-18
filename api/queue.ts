import amqp from 'amqplib';
import { config } from 'dotenv';
config({ path: '../.env' });

import { Logger } from '../src/helper';
import { listeningQueue } from '../src/listener';
import { handleCreateUser } from '../src/listener/create-user';


export default async function handler(req, res) {
    Logger.info('Starting listener...');
    try {
        await listeningQueue('USER_REGISTRATION', handleCreateUser);
        Logger.info('Listener started successfully.');
        res.status(200).json({ message: 'Worker dimulai' });
    } catch (error) {
        Logger.info('Start Listener', error);
        res.status(500).json({
            message: 'Gagal memulai worker',
            error: error instanceof Error ? error.message : 'Kesalahan tidak dikenal'
        });
    }
}