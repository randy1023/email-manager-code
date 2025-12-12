import { Request, Response } from 'express'
import { CustomError, GetEmailsDto } from '../../domain'
import { CsvService } from '../services'

export class CsvController {
  //* DI
  constructor(public readonly csvService: CsvService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }

  public importCSV = (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        message: 'No se subió ningún archivo CSV',
      })
      return
    }
    this.csvService
      .importCSV(req.file!)
      .then(() => {
        res.json({ message: 'CSV imported successfully' })
      })
      .catch((error) => this.handleError(error, res))
    // this.gmailService
    //   .getLatestEmails(getEmailsDto!)
    //   .then((emails) => res.json(emails))
    //   .catch((error) => this.handleError(error, res))
  }

  public exportCSV = (req: Request, res: Response) => {
    this.csvService
      .exportCSV()

      .then((csvData) => {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=email_${Date.now()}.csv`
        )
        res.json(csvData)
      })
      .catch((error) => this.handleError(error, res))
    // this.gmailService
    //   .getLatestEmails(getEmailsDto!)
    //   .then((emails) => res.json(emails))
    //   .catch((error) => this.handleError(error, res))
  }
}
