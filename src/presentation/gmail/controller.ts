import { Request, Response } from 'express'
import { CustomError, GetEmailsDto } from '../../domain'
import { GmailService } from '../services'

export class GmailController {
  //* DI
  constructor(public readonly gmailService: GmailService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }

  public getEmails = (req: Request, res: Response) => {
    const [error, getEmailsDto] = GetEmailsDto.create(req.query)
    if (error) {
      res.status(400).json({ error })
      return
    }
    this.gmailService
      .getLatestEmails(getEmailsDto!.limit)
      .then((emails) => res.json(emails))
      .catch((error) => this.handleError(error, res))
  }
}
