import { Router } from 'express'
import { AuthController } from './controller'
import { AuthService } from '../services'
import { AuthMiddleware } from '../middlewares/auth.middleware'

export class AuthRoutes {
  static get routes(): Router {
    const router = Router()
    const authService = new AuthService()
    const authController = new AuthController(authService)

    // Definir las rutas
    router.post('/login', authController.loginUser)
    router.post('/register', authController.registerUser)
    router.get(
      '/check-status',
      [AuthMiddleware.validateJWT],
      authController.checkStatus
    )

    return router
  }
}
