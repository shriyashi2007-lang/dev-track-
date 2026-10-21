import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '../services/authService'

describe('demo authentication service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('persists a login session without storing the password', async () => {
    const login = authService.login('ada@example.com', 'secret-password')
    await vi.runAllTimersAsync()
    const user = await login

    expect(user).toEqual({
      isAuthenticated: true,
      name: 'Ada',
      email: 'ada@example.com',
    })
    expect(JSON.stringify(localStorage)).not.toContain('secret-password')
    expect(authService.getCurrentUser()).toEqual(user)
  })

  it('trims a signup name and clears the session on logout', async () => {
    const signup = authService.signup('  Grace Hopper  ', 'grace@example.com', 'pw')
    await vi.runAllTimersAsync()
    expect(await signup).toMatchObject({ name: 'Grace Hopper' })

    authService.logout()
    expect(authService.getCurrentUser()).toMatchObject({
      isAuthenticated: false,
      name: 'Demo Student',
    })
  })
})
