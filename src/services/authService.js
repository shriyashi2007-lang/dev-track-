import { storageService } from './storageService'
import { STORAGE_KEYS } from '../data/constants'

class AuthService {
  getCurrentUser() {
    const authData = storageService.get(STORAGE_KEYS.DEMO_AUTH, null)
    if (!authData) {
      return {
        isAuthenticated: false,
        name: 'Demo Student',
        email: 'student@example.edu',
      }
    }
    return {
      isAuthenticated: true,
      name: authData.name || 'Demo Student',
      email: authData.email || 'student@example.edu',
    }
  }

  async login(email, _password) {
    // Simulated demo delay
    await new Promise((res) => setTimeout(res, 600))
    // Never store or process password!
    const name = email.split('@')[0] || 'Developer'
    const user = {
      isAuthenticated: true,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
    }
    storageService.set(STORAGE_KEYS.DEMO_AUTH, {
      name: user.name,
      email: user.email,
    })
    return user
  }

  async signup(name, email, _password) {
    // Simulated demo delay
    await new Promise((res) => setTimeout(res, 600))
    // Never store password!
    const user = {
      isAuthenticated: true,
      name: (name || 'Developer').trim(),
      email,
    }
    storageService.set(STORAGE_KEYS.DEMO_AUTH, {
      name: user.name,
      email: user.email,
    })
    return user
  }

  logout() {
    storageService.remove(STORAGE_KEYS.DEMO_AUTH)
  }
}

export const authService = new AuthService()
