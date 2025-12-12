import { Router } from 'express'
import { EmailController } from './controller'

export class EmailsRoutes {
  static get routes(): Router {
    const router = Router()

    const emailController = new EmailController()
    // Definir las rutas
    router.post(
      '/create-email-by-service',
      emailController.createEmailByService
    )

    return router
  }
}
