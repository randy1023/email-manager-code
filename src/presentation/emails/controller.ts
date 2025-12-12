import { Request, Response } from 'express'
import { CreatedEmailServiceDto, CustomError } from '../../domain'

export class EmailController {
  //* DI
  constructor() {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }

  public createEmailByService = (req: Request, res: Response) => {
    const [error, createdEmailServiceDto] = CreatedEmailServiceDto.create(
      req.body
    )
    if (error) {
      res.status(400).json({ error })
      return
    }
    console.log({ createdEmailServiceDto })
    // this.authService
    //   .registerUser(registerUserDto!)
    //   .then((user) => res.json(user))
    //   .catch((error) => this.handleError(error, res))
  }
}
