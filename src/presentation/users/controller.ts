import { Request, Response } from 'express'
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from '../../domain'
import { UsersService } from '../services'

export class UsersController {
  //* DI
  constructor(public readonly usersService: UsersService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
      return
    }

    res.status(500).json({ error: 'Internal server error' })
  }

  public getUsers = (req: Request, res: Response) => {
    this.usersService
      .getUsers()
      .then((users) => res.json(users))
      .catch((error) => this.handleError(error, res))
  }

  public getUserById = (req: Request, res: Response) => {
    const userId = req.params.id
    if (!userId) {
      res.status(400).json({ error: 'userId is riquired' })
      return
    }
    this.usersService
      .getUserById(userId)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res))
  }
  public updateUserByEmail = (req: Request, res: Response) => {
    const email = req.params.email

    const [error, updaterUserDto] = UpdateUserDto.create({
      email,
      ...req.body,
    })
    if (error) {
      res.status(400).json({ error })
      return
    }

    this.usersService
      .updateUserByEmail(updaterUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res))
  }
}
