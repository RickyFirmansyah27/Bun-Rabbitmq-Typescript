import { config } from 'dotenv';
config({ path: '.././.env' });
import amqp from 'amqplib';
import { handleError, Logger } from '../helper';

type MessagePayload = Record<string, unknown>;

const RABBITMQ_URL = process.env.RABBITMQ_URL as string;
let connection: amqp.Connection | null = null;

// RabbitMQ connection setup with auto-reconnect
export const connectRabbitMQ = async (qName: string): Promise<amqp.Channel> => {
    const reconnect = async (): Promise<amqp.Channel> => {
        try {
            Logger.info('Connecting to RabbitMQ...');
            connection = await amqp.connect(RABBITMQ_URL);

            const channel = await connection.createChannel();
            await channel.assertExchange('myapp-rabbitmq', 'direct', { durable: true });

            channel.prefetch(1);
            Logger.info(`Connected to RabbitMQ and listening on queue: ${qName}`);

            return channel;
        } catch (error) {
            handleError('RabbitMQ Connection Error', error);
            Logger.error('Retrying connection in 3 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return reconnect();
        }
    };

    return reconnect();
};

// Generic message handler with autoAck and acknowledgment management
export const processMessage = async (
    channel: amqp.Channel,
    msg: amqp.Message | null,
    handler: (payload: MessagePayload) => Promise<void>
): Promise<void> => {
    if (!msg) return;
    try {
        const payload: MessagePayload = JSON.parse(msg.content.toString());
        Logger.info('Received message:', payload);
        
        await handler(payload);
        channel.ack(msg);
    } catch (error) {
        handleError('Message Processing', error);
        channel.nack(msg, false, true);
    }
};

// Example of consuming messages from the queue
export const consumeMessages = async (qName: string, handler: (payload: MessagePayload) => Promise<void>) => {
    const channel = await connectRabbitMQ(qName);
    await channel.assertQueue(qName, { durable: true });
   
    channel.consume(qName, (msg) => {
        processMessage(channel, msg, handler);
    }, { noAck: false });
};
