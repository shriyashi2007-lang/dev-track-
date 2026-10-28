import { Router } from 'express'
import { createHealthRouter } from './health.js'

export function createApiRouter() {
  const router = Router()
  router.use('/health', createHealthRouter())
  return router
}
