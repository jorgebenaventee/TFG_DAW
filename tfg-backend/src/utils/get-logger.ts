import pino from 'pino'

// Get file from which this function is called

export const getLogger = () => {
  return pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
  })
}
