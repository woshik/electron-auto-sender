const path = require('path')
const { createLogger, format, transports } = require('winston');
const { align, combine, timestamp, label, printf } = format;

const winstonDailyRotateFile = require('winston-daily-rotate-file')

module.exports = (app) => {
    return createLogger({
        format: combine(
            timestamp(),
            align(),
            printf(
                info => `${info.timestamp} ${info.level}: ${info.message}`
            )
        ),
        transports: [
            new winstonDailyRotateFile({
                filename: path.join(app.getPath('appData'), 'Roaming', 'auto-email-sender', 'logging', 'errors', 'error-%DATE%.log'),
                datePattern: 'DD-MM-YYYY',
                level: 'error'
            }),
            new transports.File({
                filename: path.join(app.getPath('appData'), 'Roaming', 'auto-email-sender', 'logging', 'all.log'),
                level: 'info'
            })
        ]
    })
}