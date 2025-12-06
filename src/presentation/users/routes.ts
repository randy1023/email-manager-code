import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/auth.middleware'
import { UsersController } from './controller'
import { UsersService } from '../services'

export class UsersRoutes {
  static get routes(): Router {
    const router = Router()
    const usersService = new UsersService()
    const usersController = new UsersController(usersService)

    // Definir las rutas
    router.get('/', [AuthMiddleware.validateJWT], usersController.getUsers)
    router.get(
      '/:id',
      [AuthMiddleware.validateJWT],
      usersController.getUserById
    )

    return router
  }
}
