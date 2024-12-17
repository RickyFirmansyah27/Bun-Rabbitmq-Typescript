import { config } from 'dotenv';
config({ path: '../../.env' });
import amqp from 'amqplib';
import { handleError, Logger } from '../helper';

type MessagePayload = Record<string, unknown>;

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
    throw new Error("Environment variable RABBITMQ_URL is not set.");
}

let connection: amqp.Connection | null = null; // Maintain connection state

// RabbitMQ connection setup with auto-reconnect
export const connectRabbitMQ = async (qName: string): Promise<amqp.Channel> => {
    const reconnect = async (): Promise<amqp.Channel> => {
        try {
            Logger.info('Connecting to RabbitMQ...');
            connection = await amqp.connect(RABBITMQ_URL);

            // Handle connection errors
            connection.on('error', (err) => {
                Logger.error('RabbitMQ connection error:', err.message);
            });

            connection.on('close', () => {
                Logger.warn('RabbitMQ connection closed. Reconnecting...');
                setTimeout(reconnect, 5000); // Retry after 5 seconds
            });

            const channel = await connection.createChannel();
            await channel.assertExchange('myapp-rabbitmq', 'direct', { durable: true });
            Logger.info(`Connected to RabbitMQ and listening on queue: ${qName}`);

            return channel;
        } catch (error) {
            handleError('RabbitMQ Connection Error', error);
            Logger.warn('Retrying connection in 3 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return reconnect();
        }
    };

    return reconnect();
};

// Generic message handler
export const processMessage = async (
    channel: amqp.Channel,
    msg: amqp.Message | null,
    handler: (payload: MessagePayload) => Promise<void>
): Promise<void> => {
    if (!msg) return;
    try {
        const payload: MessagePayload = JSON.parse(msg.content.toString());
        console.log('Received message:', payload);
        await handler(payload);
        channel.ack(msg);
    } catch (error) {
        handleError('Message Processing', error);
    }
};
