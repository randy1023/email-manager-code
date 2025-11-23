import { Router } from 'express'
import { AuthRoutes } from './auth/routes'
import { GmailRoutes } from './gmail/routes'

export class AppRoutes {
  static get routes(): Router {
    const router = Router()

    // Definir las rutas
    router.use('/api/auth', AuthRoutes.routes)
    router.use('/api/gmail', GmailRoutes.routes)

    return router
  }
}
