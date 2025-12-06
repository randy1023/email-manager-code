import { bcryptAdapter, envs, JwtAdapter } from '../../config'
import { UserModel } from '../../data'
import { CustomError, UserEntity } from '../../domain'

export class UsersService {
  constructor() {} // DI // Replace 'any' with the actual type of your UserRepository

  public async getUsers(): Promise<UserEntity[]> {
    const users = await UserModel.find()
    return users.map((user) => UserEntity.fromObject(user))
  }
  public async getUserById(userId: string): Promise<UserEntity> {
    const id = userId
    try {
      const user = await UserModel.findById(id)

      return UserEntity.fromObject(user!)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'CastError')
          throw CustomError.badRequest(`User with id ${userId} no found`)
      }
      throw error
    }
  }
}
