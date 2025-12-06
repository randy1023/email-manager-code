import { Router } from 'express'
import { AuthRoutes } from './auth/routes'
import { GmailRoutes } from './gmail/routes'
import { UsersRoutes } from './users/routes'

export class AppRoutes {
  static get routes(): Router {
    const router = Router()

    // Definir las rutas
    router.use('/api/auth', AuthRoutes.routes)
    router.use('/api/gmail', GmailRoutes.routes)
    router.use('/api/users', UsersRoutes.routes)

    return router
  }
}
