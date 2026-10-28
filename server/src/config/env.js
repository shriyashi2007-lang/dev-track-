const VALID_ENVIRONMENTS = new Set(['development', 'test', 'production'])
const DEFAULT_CLIENT_ORIGIN = 'http://localhost:5173'

function parsePort(value) {
  const candidate = value === undefined || value === '' ? 5000 : Number(value)

  if (!Number.isInteger(candidate) || candidate < 1 || candidate > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }

  return candidate
}

function normalizeOrigin(value) {
  let url

  try {
    url = new URL(value)
  } catch {
    throw new Error(`CLIENT_ORIGIN contains an invalid URL: ${value}`)
  }

  const hasUnexpectedParts = (
    !['http:', 'https:'].includes(url.protocol)
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  )

  if (hasUnexpectedParts) {
    throw new Error(`CLIENT_ORIGIN must contain only an HTTP(S) origin: ${value}`)
  }

  return url.origin
}

function parseClientOrigins(value, nodeEnv) {
  const rawValue = value?.trim()

  if (!rawValue) {
    if (nodeEnv === 'production') {
      throw new Error('CLIENT_ORIGIN is required when NODE_ENV=production.')
    }

    return [DEFAULT_CLIENT_ORIGIN]
  }

  const origins = [...new Set(
    rawValue
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
  )]

  if (origins.length === 0) {
    throw new Error('CLIENT_ORIGIN must contain at least one valid origin.')
  }

  return origins
}

export function loadEnv(source = process.env) {
  const nodeEnv = source.NODE_ENV?.trim() || 'development'

  if (!VALID_ENVIRONMENTS.has(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production.')
  }

  return Object.freeze({
    port: parsePort(source.PORT),
    nodeEnv,
    clientOrigins: Object.freeze(parseClientOrigins(source.CLIENT_ORIGIN, nodeEnv)),
  })
}
