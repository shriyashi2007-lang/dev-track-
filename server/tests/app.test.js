import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'

const TEST_CONFIG = Object.freeze({
  port: 5000,
  nodeEnv: 'test',
  clientOrigins: ['http://localhost:5173'],
})

describe('DevTrack API', () => {
  it('returns the exact public health payload', async () => {
    const response = await request(createApp(TEST_CONFIG)).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/^application\/json/)
    expect(Object.keys(response.body).sort()).toEqual(['service', 'status', 'success', 'timestamp'])
    expect(response.body).toMatchObject({
      success: true,
      status: 'ok',
      service: 'devtrack-api',
    })

    const parsedTimestamp = Date.parse(response.body.timestamp)
    expect(Number.isFinite(parsedTimestamp)).toBe(true)
    expect(new Date(parsedTimestamp).toISOString()).toBe(response.body.timestamp)
  })

  it('returns consistent JSON errors for unknown routes and unsupported health methods', async () => {
    const app = createApp(TEST_CONFIG)
    const unknown = await request(app).get('/api/does-not-exist')
    const unsupported = await request(app).post('/api/health')

    expect(unknown.status).toBe(404)
    expect(unknown.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    })
    expect(unsupported.status).toBe(405)
    expect(unsupported.body).toEqual({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' },
    })
  })

  it('returns safe errors for malformed and oversized JSON', async () => {
    const app = createApp(TEST_CONFIG)
    const malformed = await request(app)
      .post('/api/does-not-exist')
      .set('Content-Type', 'application/json')
      .send('{"broken"')
    const oversized = await request(app)
      .post('/api/does-not-exist')
      .send({ payload: 'x'.repeat(110 * 1024) })

    expect(malformed.status).toBe(400)
    expect(malformed.body).toEqual({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body contains invalid JSON' },
    })
    expect(JSON.stringify(malformed.body)).not.toMatch(/SyntaxError|stack|Unexpected token/i)

    expect(oversized.status).toBe(413)
    expect(oversized.body).toEqual({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds the 100kb limit' },
    })
  })

  it('allows configured origins, preflights, and requests without Origin', async () => {
    const app = createApp(TEST_CONFIG)
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
    const preflight = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
    const withoutOrigin = await request(app).get('/api/health')

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(preflight.status).toBe(204)
    expect(preflight.headers['access-control-allow-methods']).toContain('GET')
    expect(withoutOrigin.status).toBe(200)
  })

  it('rejects disallowed origins without a wildcard header', async () => {
    const response = await request(createApp(TEST_CONFIG))
      .get('/api/health')
      .set('Origin', 'https://attacker.example')

    expect(response.status).toBe(403)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
    expect(response.body).toEqual({
      success: false,
      error: { code: 'CORS_DENIED', message: 'Origin is not allowed' },
    })
  })

  it('does not leak production error internals', async () => {
    const failingMiddleware = express.Router()
    failingMiddleware.get('/api/failure', () => {
      throw new Error('private implementation detail')
    })

    const app = createApp(
      { ...TEST_CONFIG, nodeEnv: 'production' },
      { beforeRoutes: [failingMiddleware] }
    )
    const response = await request(app).get('/api/failure')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    })
    expect(JSON.stringify(response.body)).not.toContain('private implementation detail')
    expect(JSON.stringify(response.body)).not.toMatch(/stack/i)
  })

  it('sets Helmet headers and hides Express implementation details', async () => {
    const response = await request(createApp(TEST_CONFIG)).get('/api/health')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})
