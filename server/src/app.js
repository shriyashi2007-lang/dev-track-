import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { createErrorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import { createApiRouter } from './routes/index.js'

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

function createCorsOptions(config) {
  const allowedOrigins = new Set(config.clientOrigins)

  return {
    credentials: false,
    methods: ALLOWED_METHODS,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      const error = new Error('CORS origin rejected')
      error.code = 'CORS_DENIED'
      error.status = 403
      callback(error)
    },
  }
}

export function createApp(config, { beforeRoutes = [] } = {}) {
  const app = express()

  // Security and parsing run before routes; 404 and error handling stay last.
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors(createCorsOptions(config)))
  app.use(express.json({ limit: '100kb' }))
  beforeRoutes.forEach((middleware) => app.use(middleware))
  app.use('/api', createApiRouter())
  app.use(notFound)
  app.use(createErrorHandler(config))

  return app
}
