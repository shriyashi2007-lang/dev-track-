import { describe, expect, it } from 'vitest'
import { loadEnv } from '../src/config/env.js'

describe('environment configuration', () => {
  it('applies safe development defaults', () => {
    expect(loadEnv({})).toEqual({
      port: 5000,
      nodeEnv: 'development',
      clientOrigins: ['http://localhost:5173'],
    })
  })

  it('parses and deduplicates multiple origins', () => {
    const config = loadEnv({
      PORT: '5050',
      NODE_ENV: 'test',
      CLIENT_ORIGIN: 'http://localhost:5173, https://devtrack.example, http://localhost:5173',
    })

    expect(config).toEqual({
      port: 5050,
      nodeEnv: 'test',
      clientOrigins: ['http://localhost:5173', 'https://devtrack.example'],
    })
  })

  it.each(['zero', '0', '65536', '12.5'])(
    'rejects invalid PORT value %s',
    (port) => {
      expect(() => loadEnv({ PORT: port, CLIENT_ORIGIN: 'http://localhost:5173' }))
        .toThrow('PORT must be an integer between 1 and 65535.')
    }
  )

  it('rejects an unsupported NODE_ENV', () => {
    expect(() => loadEnv({ NODE_ENV: 'staging', CLIENT_ORIGIN: 'http://localhost:5173' }))
      .toThrow('NODE_ENV must be development, test, or production.')
  })

  it.each(['not-a-url', 'ftp://example.com', 'https://example.com/path']) (
    'rejects invalid CLIENT_ORIGIN value %s',
    (origin) => {
      expect(() => loadEnv({ CLIENT_ORIGIN: origin })).toThrow(/CLIENT_ORIGIN/)
    }
  )

  it('requires CLIENT_ORIGIN in production', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' }))
      .toThrow('CLIENT_ORIGIN is required when NODE_ENV=production.')
  })
})
