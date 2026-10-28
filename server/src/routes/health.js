import { Router } from 'express'

export function createHealthRouter() {
  const router = Router()

  router.get('/', (_request, response) => {
    response.status(200).json({
      success: true,
      status: 'ok',
      service: 'devtrack-api',
      timestamp: new Date().toISOString(),
    })
  })

  router.all('/', (_request, response) => {
    response.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  })

  return router
}
