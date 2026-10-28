const ERROR_RESPONSES = {
  INVALID_JSON: { status: 400, message: 'Request body contains invalid JSON' },
  PAYLOAD_TOO_LARGE: { status: 413, message: 'Request body exceeds the 100kb limit' },
  CORS_DENIED: { status: 403, message: 'Origin is not allowed' },
}

function classifyError(error) {
  if (error?.type === 'entity.parse.failed') return ['INVALID_JSON', ERROR_RESPONSES.INVALID_JSON]
  if (error?.type === 'entity.too.large') return ['PAYLOAD_TOO_LARGE', ERROR_RESPONSES.PAYLOAD_TOO_LARGE]
  if (error?.code === 'CORS_DENIED') return ['CORS_DENIED', ERROR_RESPONSES.CORS_DENIED]

  const requestedStatus = Number(error?.status ?? error?.statusCode)
  if (Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus < 500) {
    return [
      typeof error.code === 'string' ? error.code : 'CLIENT_ERROR',
      {
        status: requestedStatus,
        message: error.expose === true && typeof error.message === 'string'
          ? error.message
          : 'Request failed',
      },
    ]
  }

  return ['INTERNAL_ERROR', { status: 500, message: 'Internal server error' }]
}

export function createErrorHandler(config) {
  return function errorHandler(error, _request, response, _next) {
    const [code, details] = classifyError(error)

    if (details.status === 500 && config.nodeEnv !== 'test') {
      console.error('Unhandled request error', {
        code: typeof error?.code === 'string' ? error.code : 'INTERNAL_ERROR',
        name: error?.name || 'Error',
      })
    }

    response.status(details.status).json({
      success: false,
      error: {
        code,
        message: details.message,
      },
    })
  }
}
