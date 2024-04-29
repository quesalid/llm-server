import { loadModule } from '../utils/loadutils.js'
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import HttpStreamTransport from 'winston-transport-http-stream'

const createLogger = winston.createLogger
const transports = winston.transports
const format = winston.format

var transport = new winston.transports.DailyRotateFile({
    filename: 'LOM-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: process.env.WINSTON_MAXFILES ? process.env.WINSTON_MAXFILES : '14d',
    dirname: './logs'
});
transport.on('rotate', function (oldFilename:any, newFilename:any) {
    // do something fun
});


let httptranport = new HttpStreamTransport({
    url: process.env.WINSTON_HTTPTRANSPORT ? process.env.WINSTON_HTTPTRANSPORT : 'https://127.0.0.1:3004/loggerpost',
    /* agent: new https.Agent({
         rejectUnauthorized: process.env.TARGETSTATUS == 'development' ? false : true
     }),*/
    method: "POST"
})

export const loggers = {
    simple: createLogger({
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            format.printf((info:any) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        transports: [
            transport,
            //httptranport,
            new transports.Console(),
        ]
    }),
    splat: createLogger({
        format: format.combine(
            format.splat(),
            format.simple()
        ),
        transports: [
            new winston.transports.Stream({
                stream: process.stderr,
                level: 'info',
            })
        ]
    })
}

export const loadLogger = async () => {
    try {
        // SET NODE_TLS_REJECT_UNAUTHORIZED=0 IF IN DEVELOPMENT
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.TARGETSTATUS == 'development' ? '0' : '1'
        const winston = await loadModule("winston");
        const winstonRotate = await loadModule("winston-daily-rotate-file");
        const winstonHttp = await loadModule("winston-transport-http-stream");
        const createLogger = winston.createLogger
        const transports = winston.transports
        const format = winston.format
        let transport = new winston.transports.DailyRotateFile({
            filename: 'LOM-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: process.env.WINSTON_MAXFILES ? process.env.WINSTON_MAXFILES : '14d',
            dirname: './logs'
        });
        transport.on('rotate', function (oldFilename: any, newFilename: any) {
            // do something fun
        });
        let httptranport = new winstonHttp.default({
            url: process.env.WINSTON_HTTPTRANSPORT ? process.env.WINSTON_HTTPTRANSPORT : 'https://127.0.0.1:3004/loggerpost',
            /* agent: new https.Agent({
                 rejectUnauthorized: process.env.TARGETSTATUS == 'development' ? false : true
             }),*/
            method: "POST"
        })
        const loggers = {
            simple: createLogger({
                format: format.combine(
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
                    format.printf((info: any) => `${info.timestamp} ${info.level}: ${info.message}`)
                ),
                transports: [
                    transport,
                    //httptranport,
                    new transports.Console(),
                ]
            }),
            splat: createLogger({
                format: format.combine(
                    format.splat(),
                    format.simple()
                ),
                transports: [
                    new winston.transports.Stream({
                        stream: process.stderr,
                        level: 'info',
                    })
                ]
            })
        }

        return (loggers)

    } catch (error) {
        throw (error)
    }
}