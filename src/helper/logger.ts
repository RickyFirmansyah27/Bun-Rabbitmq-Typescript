import { config } from 'dotenv';
config({ path: '../../.env' });
import moment from 'moment';
import { createLogger, format, transports } from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail('qLeeazh2QzV47U2f7EnoMhT8');

const { combine, timestamp, printf } = format;

const loggerFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

export const Logger = createLogger({
    level: 'debug',
    format: combine(
        timestamp({ format: () => moment().format('ddd, DD MMM YYYY HH:mm:ss') }),
        loggerFormat
    ),
    transports: [
        new transports.Console(), // Log ke console
        new LogtailTransport(logtail), // Log ke Logtail
    ],
});
