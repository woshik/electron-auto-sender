const { app } = require('electron')
const path = require('path')
const { createLogger, format, transports } = require('winston');
const { align, combine, timestamp, label, printf } = format;
const winstonDailyRotateFile = require('winston-daily-rotate-file')

const logger = createLogger({
    format: combine(
        timestamp(),
        align(),
        printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    transports: [
        new winstonDailyRotateFile({
            filename: path.join(app.getAppPath(), 'logging', 'errors', 'error-%DATE%.log'),
            datePattern: 'DD-MM-YYYY',
            level: 'error'
        }),
        new transports.File({
            filename: path.join(app.getAppPath(), 'logging', 'all.log'),
            level: 'info'
        })
    ]
})

exports.error = (err) => {
    logger.error(err.message)
}

exports.info = (info) => {
    logger.info(info.message)
}