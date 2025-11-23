import { Router } from 'express'

import { AuthService, GmailService } from '../services'
import { envs } from '../../config'
import { GmailController } from './controller'
import { join } from 'path'

export class GmailRoutes {
  static get routes(): Router {
    const router = Router()
    const pathToToken = join(process.cwd(), 'data', 'token.json')
    const gmailService = new GmailService(
      envs.GOOGLE_CLIENT_ID,
      envs.GOOGLE_CLIENT_SECRET,
      envs.GOOGLE_REDIRECT_URI,
      pathToToken
    )
    const gmailController = new GmailController(gmailService)

    // Definir las rutas

    router.get('/', gmailController.getEmails)

    return router
  }
}
