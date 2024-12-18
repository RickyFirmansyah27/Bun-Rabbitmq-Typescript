import amqp from 'amqplib';
import { config } from 'dotenv';
config({ path: '../.env' });

import { Logger } from '../src/helper';
import { UserCreateRequestEmail } from '../src/utils/mailer';
interface UserRegistrationPayload {
  email: string;
  userId: string;
}
const processUserRegistration = async (payload: UserRegistrationPayload) => {
  try {
    await UserCreateRequestEmail('aicorex4@gmail.com');
    
    Logger.info(`Memproses registrasi untuk user: ${payload.userId}`);
  } catch (error) {
    Logger.error(`Gagal memproses registrasi untuk user ${payload.userId}`, error);
  }
};

export const startQueueWorker = async (queueName: string) => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);
    Logger.info(`Worker mulai mendengarkan antrian: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
    
          const payload: UserRegistrationPayload = JSON.parse(msg.content.toString());
          await processUserRegistration(payload);
    
          channel.ack(msg);
        } catch (error) {
          Logger.error('Gagal memproses pesan', error);
    
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    Logger.error('Kesalahan saat memulai worker', error);
  }
};
export default async function handler(req, res) {
  try {
    await startQueueWorker('USER_REGISTRATION');
    res.status(200).json({ message: 'Worker dimulai' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Gagal memulai worker',
      error: error instanceof Error ? error.message : 'Kesalahan tidak dikenal'
    });
  }
}