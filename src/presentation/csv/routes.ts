import { Router } from 'express'

import { CsvService } from '../services'

import { AuthMiddleware } from '../middlewares/auth.middleware'
import { CsvController } from './controller'
import { multerAdapter } from '../../config'

export class CsvRoutes {
  static get routes(): Router {
    const router = Router()

    const csvService = new CsvService()
    const csvController = new CsvController(csvService)

    // Definir las rutas

    router.post(
      '/import',
      [multerAdapter.upload.single('file')],
      csvController.importCSV
    )
    router.get('/export', csvController.exportCSV)
    return router
  }
}
