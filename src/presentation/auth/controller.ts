import { Request, Response } from 'express'
import { CustomError } from '../../domain'

export class AuthController {
  //* DI
  constructor(/*public readonly authService: AuthService*/) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }

  public registerUser = (req: Request, res: Response) => {
    res.json({ message: 'User registered successfully' })
  }

  public loginUser = (req: Request, res: Response) => {
    res.json({ message: 'User logged in successfully' })
  }
}
