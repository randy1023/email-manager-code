import { Router } from 'express'
import { EmailController } from './controller'
import { EmailsService } from '../services'

export class EmailsRoutes {
  static get routes(): Router {
    const router = Router()
    const emailService = new EmailsService()
    const emailController = new EmailController(emailService)
    // Definir las rutas
    router.post(
      '/create-email-by-service',
      emailController.createEmailByService
    )

    return router
  }
}
