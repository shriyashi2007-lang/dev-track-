import { createApp } from './app.js'
import { loadEnv } from './config/env.js'

let httpServer
let shuttingDown = false

function shutdown(reason, exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`DevTrack API shutting down (${reason}).`)

  if (!httpServer) {
    process.exit(exitCode)
    return
  }

  httpServer.close((error) => {
    if (error) {
      console.error('DevTrack API could not close cleanly.')
      process.exit(1)
      return
    }

    process.exit(exitCode)
  })

  httpServer.closeAllConnections?.()
}

try {
  const config = loadEnv()
  const app = createApp(config)

  httpServer = app.listen(config.port)
  httpServer.once('listening', () => {
    console.log(`DevTrack API listening on http://localhost:${config.port}`)
  })
  httpServer.once('error', (listenError) => {
    console.error(`DevTrack API could not listen on port ${config.port}: ${listenError.code || 'UNKNOWN_ERROR'}`)
    process.exit(1)
  })

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('unhandledRejection', () => shutdown('unhandledRejection', 1))
  process.on('uncaughtException', () => shutdown('uncaughtException', 1))
} catch (error) {
  console.error(`DevTrack API failed to start: ${error.message}`)
  process.exit(1)
}
